require('dotenv').config();
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const client = new OpenAI({ apiKey: process.env.VITE_OPENAI_API_KEY });
const SYSTEM_PROMPT = fs.readFileSync(
 path.join(__dirname, '../prompts/synthesis_prompt.txt'),
 'utf-8'
);
async function generateBrief(objective, scrapedResults) {
 // Combine all scraped markdown into one string (max 12000 chars)
 const content = scrapedResults
 .filter(r => !r.error && r.markdown)
 .map(r => `## ${r.title}\n\n${r.markdown}`)
 .join('\n\n---\n\n')
 .slice(0, 12000);
 const userMessage = `Objective: ${objective}\n\nScraped Competitor Content:\
n${content}`;
 try {
 const response = await client.chat.completions.create({
model: 'gpt-4o',
 messages: [
 { role: 'system', content: SYSTEM_PROMPT },
 { role: 'user', content: userMessage }
 ],
 max_tokens: 1500,
 temperature: 0.3
 });
 const raw = response.choices[0].message.content.trim();
 return JSON.parse(raw);
 } catch (error) {
 console.error('generateBrief error:', error.message);
 return { error: true, message: error.message };
 }
}
module.exports = { generateBrief };