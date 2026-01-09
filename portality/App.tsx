import React, { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import { ragService } from "./services/ragService";
import { notionService } from "./services/notionService";
import ConnectionsView from "./components/ConnectionsView";
import TeamView from "./components/TeamView";
import LoginView from "./components/LoginView";
import { SettingsPanel } from "./components/SettingsPanel";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import AureonDock from "./components/AureonDock";
import HomeView from "./components/HomeView";
import NotionView from "./components/NotionView";
import RAGView from "./components/RAGView";
import ChatView from "./components/ChatView";
import { AureonCallModal } from "./components/AureonCallModal";
import { useAureonLive } from "./hooks/useAureonLive";
import { useRealtimeData } from "./hooks/useRealtimeData";
import {
  Task,
  Lead,
  ViewState,
  AudioState,
  ChatMessage,
  UserProfile,
  NotionPage,
  CalendarEvent,
  Client,
  Service,
} from "./types";
import { THEMES } from "./constants";
import { getCurrentBrand, applyBrandColors } from "./config/branding";

const brand = getCurrentBrand();

const PROFILES: Record<string, UserProfile> = {
  andrea: {
    id: "andrea",
    name: "Andrea Chimaras",
    role: "CEO (Strategic)",
    avatar: "AC",
    theme: "emerald",
    organizationId: "ELEVAT/AGORA",
    layoutConfig: ["status", "portfolio", "chronos", "tasks"],
  },
  christian: {
    id: "christian",
    name: "Christian Moreno",
    role: "Ops Lead",
    avatar: "CM",
    theme: "emerald",
    organizationId: "ELEVAT/AGORA",
    layoutConfig: ["status", "tasks", "portfolio"],
  },
  moises: {
    id: "moises",
    name: "Moisés D Vera",
    role: "Tech Lead",
    avatar: "MV",
    theme: "emerald",
    organizationId: "ELEVAT/AGORA",
    layoutConfig: ["status", "hub", "tasks", "links", "portfolio", "chronos"],
  },
  astursadeth: {
    id: "astursadeth" as any,
    name: "Architect",
    role: "Owner",
    avatar: "AS",
    theme: "violet",
    organizationId: "PERSONAL",
    layoutConfig: ["status", "tasks", "links", "chronos"],
  },
};

const EMAIL_TO_PROFILE: Record<string, string> = {
  "andreachimarasonlinebusiness@gmail.com": "andrea",
  "christomoreno6@gmail.com": "christian",
  "moshequantum@gmail.com": "moises",
  "andrea@elevatmarketing.com": "andrea",
  "christian@elevatmarketing.com": "christian",
  "moises@elevatmarketing.com": "moises",
};

const SESSION_TIMEOUT_MS = 90 * 60 * 1000; // 90 Minutes

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [demoAuthenticated, setDemoAuthenticated] = useState(false);

  const [currentUser, setCurrentUser] = useState<UserProfile>(
    brand.id === "astursadeth" ? PROFILES.astursadeth : PROFILES.andrea
  );
  const [currentView, setCurrentView] = useState<ViewState>("home");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<string>("dark");
  const [audioState, setAudioState] = useState<AudioState>(AudioState.IDLE);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const ELEVAT_ORG_ID = "392ecec2-e769-4db2-810f-ccd5bd09d92a";
  const [currentOrgId, setCurrentOrgId] = useState<string>(ELEVAT_ORG_ID);
  const organizations = [
    { id: ELEVAT_ORG_ID, name: "Elevat Marketing", slug: "elevat-marketing" },
  ];

  // Data Hook (Replaces manual fetch)
  const { tasks, clients, services, setTasks } = useRealtimeData(
    session,
    currentOrgId
  );

  const [notionDocs, setNotionDocs] = useState<NotionPage[]>([]);
  const [trainingMode, setTrainingMode] = useState<{
    active: boolean;
    reason: string;
  }>({ active: false, reason: "" });
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isNotionLinked, setIsNotionLinked] = useState(false);

  // Activity Tracking for 90-min expiry
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  // Dynamic Branding Effect
  useEffect(() => {
    const brandConfig = getCurrentBrand(currentOrgId);
    document.title = `${brandConfig.name} | Portality`;
    applyBrandColors(brandConfig);

    // Update user org in state logic if needed, but keeping simple for now
  }, [currentOrgId]);

  // Notion Sync Loop
  useEffect(() => {
    if (session) {
      notionService.startSyncLoop();
    }
    return () => {
      notionService.stopSyncLoop();
    };
  }, [session]);

  useEffect(() => {
    if (!session && !demoAuthenticated) return;

    const checkSession = () => {
      const now = Date.now();
      if (now - lastActivity > SESSION_TIMEOUT_MS) {
        console.log("Session expired due to inactivity");
        handleLogout();
      }
    };

    const interval = setInterval(checkSession, 60000); // Check every minute

    const resetActivity = () => setLastActivity(Date.now());
    window.addEventListener("mousemove", resetActivity);
    window.addEventListener("keydown", resetActivity);
    window.addEventListener("click", resetActivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener("mousemove", resetActivity);
      window.removeEventListener("keydown", resetActivity);
      window.removeEventListener("click", resetActivity);
    };
  }, [session, demoAuthenticated, lastActivity]);

  // Init Auth & Persistence
  useEffect(() => {
    document.title = `${brand.name} | Portality`;
    const persistedDemoUser = localStorage.getItem("polimata_demo_user");

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (session) {
          setSession(session);
          if (session?.user) mapUserFromSession(session.user);
          setLoadingSession(false);
        } else if (persistedDemoUser) {
          // Demo mode logic
          const foundKey = Object.keys(EMAIL_TO_PROFILE).find((key) =>
            persistedDemoUser.toLowerCase().includes(key)
          );
          if (foundKey) {
            setCurrentUser(PROFILES[EMAIL_TO_PROFILE[foundKey]]);
          }
          setDemoAuthenticated(true);
          setLoadingSession(false);
        } else {
          setLoadingSession(false);
        }
      })
      .catch((err) => {
        console.error("Supabase init error:", err);
        setLoadingSession(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) mapUserFromSession(session.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const mapUserFromSession = async (user: any) => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        console.log("✅ [Auth] Profile found:", profile.full_name);
        // Attempt to link with Notion Team
        let notionId = undefined;
        try {
          const team = await notionService.getTeam();
          // Prioritize strict email match, fall back to name
          const notionMember = team.find(
            (m) =>
              (m.email &&
                m.email.toLowerCase() === user.email?.toLowerCase()) ||
              (m.name &&
                m.name.toLowerCase() === profile.full_name?.toLowerCase())
          );

          if (notionMember) {
            notionId = notionMember.id;
            console.log(
              "✅ [Auth] Linked to Notion Member:",
              notionMember.name
            );
            setIsNotionLinked(true);
          } else {
            console.warn(
              "⚠️ [Auth] No matching Notion member found for:",
              user.email
            );
            setIsNotionLinked(false);
          }
        } catch (e) {
          console.warn("Failed to link Notion team member:", e);
        }

        // Map Supabase profile to App UserProfile
        const mappedUser: UserProfile = {
          id: profile.id, // ID matches Auth ID
          name: profile.full_name || user.email?.split("@")[0],
          role: profile.role || "Member",
          avatar:
            profile.avatar_url ||
            "https://ui-avatars.com/api/?name=" + (profile.full_name || "User"),
          theme: "emerald", // Default theme or from                    organizationId: profile.organization_id ? profile.organization_id : '392ecec2-e769-4db2-810f-ccd5bd09d92a',
          notionId: profile.notion_id || notionId, // Prioritize DB ID, fallback to auto-match
          layoutConfig: ["status", "tasks", "portfolio"], // Default layout
        };

        // If specific settings exist
        if (profile.settings?.theme) mappedUser.theme = profile.settings.theme;

        setCurrentUser(mappedUser);
      } else {
        // Fallback for demo users or if profile missing
        console.warn("Profile not found for user, using fallback.");
        const email = user.email || "";
        const foundKey = Object.keys(EMAIL_TO_PROFILE).find((key) =>
          email.toLowerCase().includes(key)
        );
        if (foundKey) {
          setCurrentUser(PROFILES[EMAIL_TO_PROFILE[foundKey]]);
        } else {
          setCurrentUser({
            ...PROFILES.andrea,
            id: "moises" as any,
            name: email.split("@")[0],
          });
        }
      }
    } catch (e) {
      console.error("Error mapping user profile:", e);
    }
  };

  const handleAuthSuccess = (email: string) => {
    // We need the full user object here, not just email.
    // LoginView should pass it or we fetch it.
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) mapUserFromSession(user);
    });
    setLastActivity(Date.now());
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("polimata_demo_user");
    setDemoAuthenticated(false);
    setSession(null);
  };

  const handleAddTask = async (
    title: string,
    priority: "high" | "medium" | "low",
    status: Task["status"] = "todo"
  ) => {
    const newTaskPayload = {
      title,
      priority,
      status,
      completed: false,
      tags: ["Inbox"],
      assigned_to: currentUser.avatar,
      user_id: session?.user?.id,
    };

    // Optimistic UI Update
    const tempId = Date.now().toString();
    const optimisticTask: Task = {
      id: tempId,
      ...newTaskPayload,
      assignedTo: currentUser.avatar,
    } as Task;
    setTasks((prev) => [optimisticTask, ...prev]);

    // Real Insert
    const { data, error } = await supabase
      .from("tasks")
      .insert(newTaskPayload)
      .select()
      .single();
    if (data) {
      setTasks((prev) =>
        prev.map((t) => (t.id === tempId ? { ...t, id: data.id } : t))
      );
    } else {
      console.error("Error adding task:", error);
      setTasks((prev) => prev.filter((t) => t.id !== tempId)); // Revert on error
    }
  };

  const handleUpdateTaskStatus = async (
    id: string,
    newStatus: Task["status"]
  ) => {
    // Optimistic
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: newStatus, completed: newStatus === "done" }
          : t
      )
    );

    // Real
    await supabase
      .from("tasks")
      .update({ status: newStatus, completed: newStatus === "done" })
      .eq("id", id);
  };

  const handleToggleTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const newCompleted = !task.completed;
    const newStatus = newCompleted ? "done" : "todo";

    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, completed: newCompleted, status: newStatus } : t
      )
    );

    await supabase
      .from("tasks")
      .update({ completed: newCompleted, status: newStatus })
      .eq("id", id);
  };

  const handleDeleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await supabase.from("tasks").delete().eq("id", id);
  };

  const handleVoiceTaskCreate = async (
    title: string,
    priority: "high" | "medium" | "low"
  ) => {
    handleAddTask(title, priority);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "system",
        content: `✓ Tarea creada: ${title}`,
        timestamp: new Date(),
      },
    ]);
  };

  // AUREON LIVE VOICE HOOK
  const {
    status: aureonStatus,
    isTalking: aureonIsTalking,
    toggleVoice: toggleAureonVoice,
  } = useAureonLive({
    onTaskCreate: handleVoiceTaskCreate,
    onKnowledgeQuery: async (q) => {
      const res = await ragService.retrieveContext(
        q,
        "admin",
        currentUser.organizationId
      ); 
      return res; 
    },
    onOperationalSummary: async () => {
      const activeClientsCount = clients.filter(c => c.status === 'active').length;
      const pendingTasksCount = tasks.filter(t => !t.completed).length;
      const highPriorityCount = tasks.filter(t => t.priority === 'high' && !t.completed).length;
      
      return `Hola ${currentUser.name}. Actualmente tenemos ${activeClientsCount} clientes activos. Hay ${pendingTasksCount} tareas pendientes en total, de las cuales ${highPriorityCount} requieren atención inmediata hoy.`;
    }
  });

  useEffect(() => {
    const html = document.documentElement;
    if (themeMode === "dark") html.classList.add("dark");
    else if (themeMode === "light") html.classList.remove("dark");
    else {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches)
        html.classList.add("dark");
      else html.classList.remove("dark");
    }
  }, [themeMode]);

  if (loadingSession)
    return (
      <div className="min-h-screen bg-[#020203] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  if (!session) return <LoginView onLoginSuccess={handleAuthSuccess} />;

  return (
    <div className="min-h-screen bg-[#020203] text-white selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden font-sans">
      {/* LIQUID GLASS BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* SMOOTH GRADIENTS - MORE VISIBLE */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-gradient-to-br from-cyan-500/20 via-cyan-400/10 to-transparent blur-[80px] animate-[pulse_8s_ease-in-out_infinite]"></div>
          <div className="absolute top-[10%] right-[-5%] w-[45%] h-[45%] bg-gradient-to-bl from-indigo-500/25 via-purple-500/15 to-transparent blur-[100px] animate-[pulse_10s_ease-in-out_infinite_1s]"></div>
          <div className="absolute bottom-[5%] left-[15%] w-[35%] h-[35%] bg-gradient-to-tr from-purple-600/20 via-pink-500/10 to-transparent blur-[80px] animate-[pulse_12s_ease-in-out_infinite_2s]"></div>
        </div>
        {/* SUBTLE GRID - MORE VISIBLE */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `
                            linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
                        `,
            backgroundSize: "50px 50px",
          }}
        ></div>
        {/* NOISE TEXTURE - CSS ONLY */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/ %3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          }}
        ></div>
      </div>

      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] md:hidden animate-in fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <Sidebar
        activeView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          setIsMobileMenuOpen(false);
        }}
        user={currentUser}
        onLogout={handleLogout}
        onOpenSettings={() => setIsSettingsOpen(true)}
        organizations={organizations}
        currentOrgId={currentOrgId}
        onSwitchOrg={setCurrentOrgId}
        mobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      <main
        className={`flex-1 relative min-h-screen flex flex-col transition-all duration-300 ${
          "md:ml-[72px]" // Match collapsed sidebar width
        }`}
      >
        <Header
          user={currentUser}
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
          activeView={currentView}
        />

        <div className="flex-1 mt-14 pb-24">
          {currentView === "home" && (
            <HomeView
              user={currentUser}
              tasks={tasks.filter((t) => t.organizationId === currentOrgId)}
              clients={clients}
              onNavigate={setCurrentView}
              onToggleTask={handleToggleTask}
            />
          )}

          {currentView === "agency" && (
            <NotionView
              clients={clients}
              services={services}
              tasks={tasks.filter((t) => t.organizationId === currentOrgId)}
              onToggleTask={handleToggleTask}
            />
          )}

          {currentView === "flow" && <RAGView organizationId={currentOrgId} />}

          {currentView === "connections" && (
            <ConnectionsView organizationId={currentOrgId} />
          )}

          {currentView === "team" && <TeamView organizationId={currentOrgId} />}

          {currentView === "chat" && (
            <ChatView
              user={{ name: currentUser.name, avatar: currentUser.avatar }}
              organization={organizations.find((o) => o.id === currentOrgId)}
            />
          )}
        </div>
      </main>

      <AureonDock
        activeView={currentView}
        onNavigate={setCurrentView}
        onVoiceClick={toggleAureonVoice}
      />

      <AureonCallModal 
        isOpen={aureonStatus !== AudioState.IDLE}
        audioState={aureonStatus}
        onHangUp={toggleAureonVoice}
      />

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentTheme={themeMode}
        onThemeChange={setThemeMode}
        currentProfileId={currentUser.id}
        onProfileChange={(id) => {
          if (PROFILES[id]) setCurrentUser(PROFILES[id]);
        }}
        currentOrgId={currentOrgId}
      />
    </div>
  );
}
