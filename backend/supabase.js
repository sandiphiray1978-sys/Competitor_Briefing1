require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
 process.env.VITE_SUPABASE_URL,
 process.env.VITE_SUPABASE_ANON_KEY
);
// Save a brief to the database
async function saveBrief(objective, resultJson) {
 const { data, error } = await supabase
 .from('briefs')
 .insert([{
 objective: objective,
 result_json: resultJson,
 user_id: 'demo-user'
 }])
 .select();
 if (error) {
 console.error('saveBrief error:', error.message);
 return null;
 }
 return data[0];
}
// Get all past briefs (most recent first)
async function getBriefs() {
 const { data, error } = await supabase
 .from('briefs')
 .select('id, created_at, objective')
 .order('created_at', { ascending: false })
 .limit(20);
 if (error) {
 console.error('getBriefs error:', error.message);
 return [];
 }
 return data;
}
// Get one full brief by ID
async function getBriefById(id) {
 const { data, error } = await supabase
 .from('briefs')
 .select('*')
 .eq('id', id)
 .single();
 if (error) return null;
 return data;
}
module.exports = { saveBrief, getBriefs, getBriefById };