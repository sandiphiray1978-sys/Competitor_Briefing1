const { scrapeCompetitors, discoverURLs } = require('./backend/scraper');
async function test() {
 console.log('Testing discoverURLs...');
 const urls = await discoverURLs('project management SaaS');
 console.log('Discovered URLs:', urls);
 console.log('Testing scrapeCompetitors...');
 const results = await scrapeCompetitors([urls[0]]);
 console.log('Scraped title:', results[0].title);
 console.log('Markdown preview:', results[0].markdown.slice(0, 200));
}
test().catch(console.error);