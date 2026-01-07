
/**
 * Google Workspace Service
 * Handles interactions with Gmail and Google Drive via REST API.
 */

const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1';
const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

class GoogleService {
    private accessToken: string | undefined;

    constructor() {
        // Access token would typically be managed via OAuth2 flow/Supabase tokens
        this.accessToken = import.meta.env.VITE_GOOGLE_ACCESS_TOKEN;
    }

    get isConfigured(): boolean {
        return !!this.accessToken;
    }

    private async fetch<T>(url: string, options: RequestInit = {}): Promise<T> {
        if (!this.accessToken) throw new Error('Google Access Token not configured');

        const response = await fetch(url, {
            ...options,
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Google API error');
        }

        return response.json();
    }

    /**
     * Gmail: Send a simple email
     */
    async sendEmail(to: string, subject: string, body: string): Promise<{ id: string }> {
        // Simple RFC822 format for the API
        const str = [
            `To: ${to}`,
            `Subject: ${subject}`,
            "",
            body
        ].join('\n');

        const encodedMail = btoa(unescape(encodeURIComponent(str))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

        return this.fetch(`${GMAIL_API_BASE}/users/me/messages/send`, {
            method: 'POST',
            body: JSON.stringify({ raw: encodedMail }),
        });
    }

    /**
     * Gmail: List recent messages
     */
    async listEmails(maxResults: number = 5): Promise<any> {
        return this.fetch(`${GMAIL_API_BASE}/users/me/messages?maxResults=${maxResults}`);
    }

    /**
     * Drive: List files
     */
    async listFiles(pageSize: number = 10): Promise<any> {
        return this.fetch(`${DRIVE_API_BASE}/files?pageSize=${pageSize}&fields=nextPageToken,files(id,name,mimeType)`);
    }

    /**
     * Drive: Get file content (metadata for now)
     */
    async getFileMetadata(fileId: string): Promise<any> {
        return this.fetch(`${DRIVE_API_BASE}/files/${fileId}`);
    }

    /**
     * Calendar: Create event with Google Meet
     */
    async createCalendarEvent(summary: string, description: string, startTime: string, endTime: string, invitees: string[] = []): Promise<any> {
        const event = {
            summary,
            description,
            start: { dateTime: startTime, timeZone: 'UTC' },
            end: { dateTime: endTime, timeZone: 'UTC' },
            attendees: invitees.map(email => ({ email })),
            conferenceData: {
                createRequest: {
                    requestId: `meet_${Date.now()}`,
                    conferenceSolutionKey: { type: 'hangoutsMeet' }
                }
            }
        };

        return this.fetch(`${CALENDAR_API_BASE}/calendars/primary/events?conferenceDataVersion=1`, {
            method: 'POST',
            body: JSON.stringify(event),
        });
    }
}

export const googleService = new GoogleService();
