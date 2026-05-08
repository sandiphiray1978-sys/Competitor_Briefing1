require('dotenv').config();
const axios = require('axios');
const FIRECRAWL_KEY = process.env.VITE_FIRECRAWL_API_KEY;
// Scrape an array of URLs using Firecrawl
async function scrapeCompetitors(urls) {
 const results = [];
 for (const url of urls) {
 try {
 const response = await axios.post(
 'https://api.firecrawl.dev/v1/scrape',
 {
 url: url,
 formats: ['markdown'],
 onlyMainContent: true,
 timeout: 15000
 },
 {
 headers: {
 'Authorization': `Bearer ${FIRECRAWL_KEY}`,
 'Content-Type': 'application/json'
 }
 }
 );
 const data = response.data.data;
 results.push({
 url: url,
 markdown: data.markdown || '',
title: data.metadata?.title || url
});
 catch (error) {
 console.error(`Failed to scrape ${url}:`, error.message);
 results.push({ url, markdown: '', title: url, error: true });
 }
 }
 return results;
}
// Use OpenAI to discover competitor URLs from an objective
async function discoverURLs(objective) {
 const OpenAI = require('openai');
 const client = new OpenAI({ apiKey: process.env.VITE_OPENAI_API_KEY });
 const resp = await client.chat.completions.create({
 model: 'gpt-4o',
 messages: [{
 role: 'user',
 content: `List exactly 4 competitor homepage URLs for this objective: "$
{objective}".
Respond ONLY with a valid JSON array of URL strings. Example:
["https://notion.so","https://asana.com"]`
 }],
 max_tokens: 200
 });
 const text = resp.choices[0].message.content.trim();
 return JSON.parse(text);
}
module.exports = { scrapeCompetitors, discoverURLs };