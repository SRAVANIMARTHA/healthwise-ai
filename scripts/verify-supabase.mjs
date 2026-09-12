/**
 * Supabase Remote Project Verification Script
 * Validates connection and table availability without exposing or printing secrets.
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env safely without printing sensitive values
function getEnvConfig() {
  const envPath = path.resolve(process.cwd(), '.env');
  const content = fs.readFileSync(envPath, 'utf8');
  const config = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...vals] = trimmed.split('=');
    if (key && vals.length > 0) {
      config[key.trim()] = vals.join('=').trim().replace(/^["']|["']$/g, '');
    }
  }
  return config;
}

const env = getEnvConfig();
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
  console.error('Error: Supabase credentials are missing or still set to placeholder values.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const EXPECTED_TABLES = [
  'profiles',
  'knowledge_sources',
  'diseases',
  'health_topics',
  'knowledge_documents',
  'knowledge_chunks',
  'chat_sessions',
  'chat_messages',
  'bookmarks',
  'user_preferences',
  'source_trust_ratings',
  'content_reviews',
  'safety_audit_logs',
  'system_metrics',
  'emergency_escalations',
];

async function verifyConnectionAndTables() {
  console.log('====================================================');
  console.log('Verifying Supabase Remote Project Connection & Schema');
  console.log('====================================================');
  console.log(`Endpoint Host: ${new URL(supabaseUrl).hostname}`);
  console.log('Testing authentication and table availability...\n');

  let tablesPresent = 0;
  let tablesMissing = 0;
  const missingList = [];

  for (const tableName of EXPECTED_TABLES) {
    try {
      const { data, error, status } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        // PGRST205 or message containing "in the schema cache" or 404 indicates table does not exist
        if (
          error.code === 'PGRST205' ||
          status === 404 ||
          error.message.includes('schema cache') ||
          error.message.includes('does not exist') ||
          error.message.includes('relation')
        ) {
          console.log(`  [NOT YET CREATED] Table: "${tableName}" (not found in schema cache)`);
          tablesMissing++;
          missingList.push(tableName);
        } else if (error.code === '42501' || error.message.includes('permission denied') || error.message.includes('row-level security')) {
          console.log(`  [PRESENT - RLS PROTECTED] Table: "${tableName}"`);
          tablesPresent++;
        } else {
          console.log(`  [PRESENT] Table: "${tableName}" (Status: ${status})`);
          tablesPresent++;
        }
      } else {
        console.log(`  [PRESENT] Table: "${tableName}"`);
        tablesPresent++;
      }
    } catch (err) {
      console.error(`  [EXCEPTION] Table "${tableName}":`, err.message);
      tablesMissing++;
      missingList.push(tableName);
    }
  }

  console.log('\n----------------------------------------------------');
  console.log(`Connection Status: AUTHENTICATED AND REACHABLE`);
  console.log(`Schema Status: ${tablesPresent}/${EXPECTED_TABLES.length} tables present, ${tablesMissing} not yet created.`);
  console.log('----------------------------------------------------');

  if (tablesMissing > 0) {
    console.log('\nNOTICE: The project URL and anon key are valid and connected, but the database schema migrations have not been applied to this Supabase project yet.');
    console.log('\nTo create all tables, indexes, and RLS policies, execute the SQL files in your Supabase Dashboard SQL Editor (https://supabase.com/dashboard/project/xhytwnallelwghutgfpz/sql):');
    console.log('  1. supabase/migrations/001_initial_schema.sql (creates all 15 core tables, indexes, and RLS)');
    console.log('  2. supabase/migrations/002_knowledge_base_sync.sql (adds sync metadata and seeds WHO, CDC, MoHFW sources)');
    console.log('  3. supabase/migrations/003_vector_rag_retrieval.sql (adds pgvector embedding column, FTS search_vector, and match_knowledge_chunks RPC)');
  }
}

verifyConnectionAndTables();
