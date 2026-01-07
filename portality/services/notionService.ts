
/**
 * Notion Service - Automation Logic
 * Handles workspace provisioning and synchronization between Notion and Supabase.
 */
export const notionService = {
    /**
     * Triggers the creation of a new organization workspace in Notion.
     * In production, this calls an n8n webhook that duplicates the "Master Lab" template.
     */
    async provisionWorkspace(organizationId: string, orgName: string): Promise<{ success: boolean; workspaceId?: string }> {
        console.log(`🚀 [Notion] Provisioning workspace for ${orgName}...`);

        try {
            // Webhook for n8n automation
            const webhookUrl = import.meta.env.VITE_NOTION_SYNC_WEBHOOK;
            
            if (!webhookUrl) {
                // STRICT MODE: No mocks allowed in production/core logic.
                console.error('❌ [Notion] CRITICAL: VITE_NOTION_SYNC_WEBHOOK is missing.');
                return { success: false, workspaceId: undefined };
            }

            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'provision_workspace',
                    organizationId,
                    name: orgName,
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) throw new Error('Notion Automation Webhook failed');

            return await response.json();
            
        } catch (error) {
            console.error('❌ [Notion] Provisioning failed:', error);
            throw error;
        }
    },

    /**
     * Checks the setup status of a Notion connection
     */
    async checkSyncStatus(organizationId: string): Promise<'connected' | 'error' | 'disconnected'> {
        // In a real scenario, we'd check if notion_id is set in the organizations table
        return 'disconnected'; // Default for connections view lookup
    }
};
