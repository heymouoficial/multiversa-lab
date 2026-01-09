const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function update() {
    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase credentials');
        return;
    }

    const { data, error } = await supabase.from('neural_settings').upsert({
        tenant_id: 'multiversa',
        notion_token: process.env.NOTION_TOKEN,
        telegram_token: process.env.TELEGRAM_TOKEN,
        gemini_key: process.env.GEMINI_KEY,
        updated_at: new Date().toISOString(),
    }, { onConflict: 'tenant_id' });

    if (error) {
        console.error('Error updating neural settings:', error);
    } else {
        console.log('Neural settings updated successfully');
    }
}

update();
