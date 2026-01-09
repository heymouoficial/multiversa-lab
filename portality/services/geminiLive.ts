import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from "@google/genai";
import { GEMINI_LIVE_MODEL, SYSTEM_INSTRUCTION } from "../constants";
import { float32ToInt16, arrayBufferToBase64, base64ToArrayBuffer, pcmToAudioBuffer } from "../utils/audioUtils";

import { AudioState } from "../types";

interface LiveSessionCallbacks {
  onStateChange: (state: AudioState) => void;
  onAudioData?: (isPlaying: boolean) => void;
  onToolCall?: (name: string, args: any) => Promise<any>;
}

// Tool: Create Task
const createTaskTool: FunctionDeclaration = {
  name: 'createTask',
  description: 'Create a new task in the user\'s to-do list.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "The content or title of the task." },
      priority: { type: Type.STRING, description: "Priority level: high, medium, or low." }
    },
    required: ['title']
  }
};

// Tool: Operational Summary
const getOperationalSummaryTool: FunctionDeclaration = {
  name: 'getOperationalSummary',
  description: 'Get a summary of the current operational state, including client count, pending tasks, and today\'s focuses.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
    required: []
  }
};

const queryKnowledgeBaseTool: FunctionDeclaration = {
  name: 'queryKnowledgeBase',
  description: 'Search the internal Elevat/Multiversa database for specific information, documents, or strategic context.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: { type: Type.STRING, description: "The search term or question to look up in the vector database." }
    },
    required: ['query']
  }
};

import { geminiKeyManager } from "../utils/geminiKeyManager";

export class GeminiLiveService {
  private client: GoogleGenAI;
  private session: any = null;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private stream: MediaStream | null = null;
  private nextStartTime: number = 0;
  private callbacks: LiveSessionCallbacks;
  private gainNode: GainNode | null = null;
  private currentKey: string | null = null;

  constructor(callbacks: LiveSessionCallbacks) {
    this.currentKey = geminiKeyManager.getKey();
    this.client = new GoogleGenAI({ apiKey: this.currentKey || '' });
    this.callbacks = callbacks;
  }

  async connect() {
    this.callbacks.onStateChange(AudioState.CONNECTING);

    try {
      // Re-initialize client with a fresh key if previous one failed
      this.currentKey = geminiKeyManager.getKey();
      this.client = new GoogleGenAI({ apiKey: this.currentKey || '' });

      this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      await this.inputAudioContext.audioWorklet.addModule('/pcm-processor.js');

      this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      // Explicitly resume contexts (required by many browsers)
      if (this.inputAudioContext.state === 'suspended') await this.inputAudioContext.resume();
      if (this.outputAudioContext.state === 'suspended') await this.outputAudioContext.resume();

      // Create Gain Node to boost volume
      this.gainNode = this.outputAudioContext.createGain();
      this.gainNode.gain.value = 3.0; 
      this.gainNode.connect(this.outputAudioContext.destination);

      const constraints = {
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);

      const sessionPromise = this.client.live.connect({
        model: GEMINI_LIVE_MODEL,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoide' } }, // Aoide is often clearer/more melodic
          },
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ functionDeclarations: [createTaskTool, queryKnowledgeBaseTool, getOperationalSummaryTool] }],
        },
        callbacks: {
          onopen: () => {
            console.log("Gemini Live Session Opened with key:", this.currentKey?.slice(0, 5));
            this.callbacks.onStateChange(AudioState.LISTENING);
            this.startAudioStreaming(sessionPromise);
          },
          onmessage: async (message: LiveServerMessage) => {
            await this.handleServerMessage(message, sessionPromise);
          },
          onclose: (event) => {
            console.log("Gemini Live Session Closed", event);
            this.callbacks.onStateChange(AudioState.IDLE);
            this.disconnect();
          },
          onerror: (error) => {
            console.error("Gemini Live Session Error", error);
            if (this.currentKey) geminiKeyManager.reportError(this.currentKey);
            this.callbacks.onStateChange(AudioState.ERROR);
            this.disconnect();
          },
        },
      });

      this.session = await sessionPromise;

    } catch (error) {
      console.error("Failed to connect to Gemini Live:", error);
      if (this.currentKey) geminiKeyManager.reportError(this.currentKey);
      this.callbacks.onStateChange(AudioState.ERROR);
      this.disconnect();
    }
  }

  private startAudioStreaming(sessionPromise: Promise<any>) {
    if (!this.inputAudioContext || !this.stream) return;

    this.inputSource = this.inputAudioContext.createMediaStreamSource(this.stream);
    // Use AudioWorklet instead of ScriptProcessor
    const workletNode = new AudioWorkletNode(this.inputAudioContext, 'pcm-processor');
    this.processor = workletNode as any; // Cast for compatibility with disconnect logic

    workletNode.port.onmessage = (event) => {
      const pcm16Buffer = event.data; // ArrayBuffer
      const base64Data = arrayBufferToBase64(pcm16Buffer);

      sessionPromise.then(session => {
        session.sendRealtimeInput({
          media: {
            mimeType: 'audio/pcm;rate=16000',
            data: base64Data
          }
        });
      });
    };

    this.inputSource.connect(workletNode);
    // workletNode does not need to connect to destination if it doesn't output audio
    // but typically we don't connect input mic to output speakers to avoid feedback
  }

  private async handleServerMessage(message: LiveServerMessage, sessionPromise: Promise<any>) {
    const serverContent = message.serverContent;

    if (serverContent?.modelTurn?.parts?.[0]?.inlineData) {
      this.callbacks.onStateChange(AudioState.SPEAKING);
      this.callbacks.onAudioData?.(true);
      const base64Audio = serverContent.modelTurn.parts[0].inlineData.data;
      await this.playAudioChunk(base64Audio);
    }

    if (message.toolCall) {
      for (const fc of message.toolCall.functionCalls) {
        console.log("Tool Call Received:", fc);
        let result: any = { result: 'ok' };

        if (this.callbacks.onToolCall) {
          try {
            const output = await this.callbacks.onToolCall(fc.name, fc.args);
            result = output || { result: 'ok' };
          } catch (e) {
            console.error("Tool execution failed", e);
            result = { error: 'Failed to execute tool' };
          }
        }

        sessionPromise.then(session => {
          session.sendToolResponse({
            functionResponses: [{
              id: fc.id,
              name: fc.name,
              response: result
            }]
          });
        });
      }
    }

    if (serverContent?.interrupted) {
      this.nextStartTime = 0;
      this.callbacks.onAudioData?.(false);
    }

    if (serverContent?.turnComplete) {
      this.callbacks.onStateChange(AudioState.LISTENING);
      this.callbacks.onAudioData?.(false);
    }
  }

  private async playAudioChunk(base64Audio: string) {
    if (!this.outputAudioContext || !this.gainNode) return;
    try {
      const arrayBuffer = base64ToArrayBuffer(base64Audio);
      const int16Data = new Int16Array(arrayBuffer);
      const audioBuffer = pcmToAudioBuffer(int16Data, this.outputAudioContext);

      const source = this.outputAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      // Connect to Gain Node instead of destination directly
      source.connect(this.gainNode);

      const currentTime = this.outputAudioContext.currentTime;
      if (this.nextStartTime < currentTime) {
        this.nextStartTime = currentTime;
      }
      source.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;
    } catch (e) {
      console.error("Error decoding/playing audio chunk", e);
    }
  }

  disconnect() {
    if (this.session) {
      try { /* this.session.close(); */ } catch (e) { }
      this.session = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.inputSource) { this.inputSource.disconnect(); this.inputSource = null; }
    if (this.processor) { this.processor.disconnect(); this.processor = null; }
    if (this.inputAudioContext) { this.inputAudioContext.close(); this.inputAudioContext = null; }
    if (this.outputAudioContext) { this.outputAudioContext.close(); this.outputAudioContext = null; }
    this.nextStartTime = 0;
    this.gainNode = null;
  }
}