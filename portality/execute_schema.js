// Execute Supabase Schema
// Run with: node execute_schema.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseServiceKey) {
    console.error('❌ Missing SUPABASE_SERVICE_KEY environment variable');
    console.log('Run with: SUPABASE_SERVICE_KEY=your_service_key node execute_schema.js');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSchema() {
    console.log('🚀 Executing Portality Schema...\n');

    try {
        // 1. Create organizations table
        console.log('1. Creating organizations table...');
        const { error: orgError } = await supabase.rpc('exec_sql', {
            sql: `
                CREATE TABLE IF NOT EXISTS public.organizations (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    name TEXT NOT NULL,
                    slug TEXT UNIQUE NOT NULL,
                    plan TEXT DEFAULT 'free',
                    settings JSONB DEFAULT '{}',
                    created_at TIMESTAMPTZ DEFAULT now()
                );
            `
        });
        if (orgError) console.warn('  Organizations table may already exist:', orgError.message);
        else console.log('  ✅ Organizations table ready');

        // 2. Insert Elevat organization
        console.log('2. Creating Elevat organization...');
        const { error: elevError } = await supabase
            .from('organizations')
            .upsert({ name: 'Elevat', slug: 'elevat', plan: 'pro' }, { onConflict: 'slug' });
        if (elevError) console.warn('  Elevat org error:', elevError.message);
        else console.log('  ✅ Elevat organization created');

        // 3. Check profiles table
        console.log('3. Checking profiles table...');
        const { data: profiles, error: profError } = await supabase
            .from('profiles')
            .select('*')
            .limit(1);

        if (profError) {
            console.log('  ⚠️ Profiles table needs manual creation via SQL Editor');
        } else {
            console.log('  ✅ Profiles table exists');
        }

        // 4. Create notion_cache table
        console.log('4. Creating notion_cache table...');
        const { error: cacheError } = await supabase.rpc('exec_sql', {
            sql: `
                CREATE TABLE IF NOT EXISTS public.notion_cache (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    notion_id TEXT UNIQUE NOT NULL,
                    title TEXT NOT NULL,
                    summary TEXT,
                    tag TEXT DEFAULT 'General',
                    icon TEXT DEFAULT '📄',
                    role TEXT NOT NULL,
                    last_synced TIMESTAMPTZ DEFAULT now(),
                    created_at TIMESTAMPTZ DEFAULT now()
                );
            `
        });
        if (cacheError) console.warn('  notion_cache error:', cacheError.message);
        else console.log('  ✅ notion_cache table ready');

        // 5. Create knowledge_sources table
        console.log('5. Creating knowledge_sources table...');
        const { error: ksError } = await supabase.rpc('exec_sql', {
            sql: `
                CREATE TABLE IF NOT EXISTS public.knowledge_sources (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    type TEXT NOT NULL,
                    format TEXT DEFAULT 'text',
                    content TEXT,
                    chunks JSONB,
                    metadata JSONB DEFAULT '{}',
                    created_at TIMESTAMPTZ DEFAULT now()
                );
            `
        });
        if (ksError) console.warn('  knowledge_sources error:', ksError.message);
        else console.log('  ✅ knowledge_sources table ready');

        console.log('\n✅ Schema execution complete!');
        console.log('\n📌 Note: For full schema including RLS policies and triggers,');
        console.log('   please run schema.sql in Supabase SQL Editor manually.');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

executeSchema();
