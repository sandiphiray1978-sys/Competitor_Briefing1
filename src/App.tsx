import { useState, useEffect, useCallback } from 'react';
import { Search, Radar, ArrowRight, Globe, RotateCcw } from 'lucide-react';
import BriefResultsCard, { type BriefData } from './BriefResultsCard';
import HistoryPanel, { type BriefHistoryEntry } from './HistoryPanel';
import { supabase, sessionId } from './supabaseClient';

const SAMPLE_BRIEF: BriefData = {
  landscapeSummary:
    'The collaborative workspace market is mature and crowded, dominated by three major players competing on flexibility, integrations, and AI-powered features. Pricing strategies vary significantly — from freemium-heavy models designed to hook individual users, to enterprise-first approaches that gate advanced features behind annual contracts. The market is shifting toward AI-native workflows, with all major players racing to embed generative AI into their core editing and project management experiences.',
  whoIsPlaying: [
    'Notion',
    'Coda',
    'Slite',
    'Confluence',
    'Clickup',
    'Monday.com',
  ],
  dominantMessagingThemes: [
    '"All-in-one workspace" — consolidating docs, wikis, and project management into a single tool',
    '"AI-first" — embedding AI assistants directly into the writing and planning flow',
    '"Built for scale" — emphasizing enterprise SSO, permissions, and audit logs',
    '"Replace your stack" — positioning against multiple point solutions to reduce SaaS fatigue',
  ],
  theGap:
    'No competitor is solving the "team of 50" pricing cliff. Notion charges per seat with no volume discount below 100 users. Coda gates databases behind Business tier. Slite has no mid-market plan at all. Teams of 30–80 people are either overpaying for enterprise features they don\'t need or stitching together free-tier limitations. There is a clear opening for a workspace tool that offers transparent, predictable mid-market pricing with the collaborative depth these teams actually require.',
  recommendedAngle:
    'Position directly against the "enterprise tax" by launching a mid-market plan with flat per-seat pricing, no feature gating, and a public pricing calculator. Lead messaging with "Enterprise-grade collaboration without the enterprise price tag" and target Series A–C companies with 30–80 employees who are currently on Notion\'s Team plan but frustrated by per-seat cost scaling.',
};

function LoadingState() {
  return (
    <div className="w-full max-w-2xl mx-auto mt-12 animate-fade-in">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-amber-900/40 flex items-center justify-center">
            <Radar className="w-8 h-8 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-amber-500/40 animate-ping opacity-30" />
        </div>

        <div className="text-center">
          <p className="text-lg font-semibold text-gray-100">Analyzing your competitive landscape...</p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <span className="loading-dot w-2 h-2 rounded-full bg-amber-400 inline-block" />
            <span className="loading-dot w-2 h-2 rounded-full bg-amber-400 inline-block" />
            <span className="loading-dot w-2 h-2 rounded-full bg-amber-400 inline-block" />
          </div>
        </div>

        <div className="w-full space-y-3 mt-4">
          <div className="shimmer-bar-dark h-4 rounded-full w-full" />
          <div className="shimmer-bar-dark h-4 rounded-full w-5/6" />
          <div className="shimmer-bar-dark h-4 rounded-full w-4/6" />
          <div className="shimmer-bar-dark h-4 rounded-full w-3/4" />
        </div>

        <p className="text-sm text-gray-400 mt-2">
          Building your strategic brief with AI insights...
        </p>
      </div>
    </div>
  );
}

type AppState = 'input' | 'loading' | 'results';

function App() {
  const [question, setQuestion] = useState('');
  const [urls, setUrls] = useState('');
  const [appState, setAppState] = useState<AppState>('input');
  const [briefData, setBriefData] = useState<BriefData | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyEntries, setHistoryEntries] = useState<BriefHistoryEntry[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    const { data } = await supabase
      .from('briefs')
      .select('id, objective, created_at')
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) {
      setHistoryEntries(data);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const saveBrief = async (objective: string, briefUrls: string, brief: BriefData) => {
    const { data } = await supabase
      .from('briefs')
      .insert({
        objective,
        urls: briefUrls,
        landscape_summary: brief.landscapeSummary,
        who_is_playing: brief.whoIsPlaying,
        dominant_messaging_themes: brief.dominantMessagingThemes,
        the_gap: brief.theGap,
        recommended_angle: brief.recommendedAngle,
        session_id: sessionId,
      })
      .select('id')
      .maybeSingle();
    if (data) {
      setActiveHistoryId(data.id);
      fetchHistory();
    }
  };

  const clearHistory = async () => {
    const ids = historyEntries.map((e) => e.id);
    if (ids.length === 0) return;
    await supabase.from('briefs').delete().in('id', ids);
    setHistoryEntries([]);
    setActiveHistoryId(null);
    setBriefData(null);
    setAppState('input');
    setQuestion('');
    setUrls('');
  };

  const loadBrief = async (id: string) => {
    const { data } = await supabase
      .from('briefs')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (data) {
      setBriefData({
        landscapeSummary: data.landscape_summary,
        whoIsPlaying: data.who_is_playing as string[],
        dominantMessagingThemes: data.dominant_messaging_themes as string[],
        theGap: data.the_gap,
        recommendedAngle: data.recommended_angle,
      });
      setQuestion(data.objective);
      setUrls(data.urls || '');
      setActiveHistoryId(id);
      setAppState('results');
      setHistoryOpen(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setAppState('loading');
    setActiveHistoryId(null);
    setTimeout(() => {
      setBriefData(SAMPLE_BRIEF);
      setAppState('results');
      saveBrief(question, urls, SAMPLE_BRIEF);
    }, 4000);
  };

  const handleReset = () => {
    setAppState('input');
    setBriefData(null);
    setQuestion('');
    setUrls('');
    setActiveHistoryId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <HistoryPanel
        entries={historyEntries}
        isOpen={historyOpen}
        onToggle={() => setHistoryOpen(!historyOpen)}
        onSelect={loadBrief}
        onClearAll={clearHistory}
        activeId={activeHistoryId}
      />

      <div className="fixed inset-0 opacity-[0.03] pointer-events-none text-yellow-400" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
        backgroundSize: '50px 50px',
      }} />

      <div className={`relative min-h-screen flex flex-col items-center px-4 py-16 transition-all duration-300 ${historyOpen ? 'sm:pl-[340px]' : ''}`}>
        {/* Header */}
        <div className={`text-center transition-all duration-500 ${appState === 'results' ? 'mb-8' : 'mb-10 mt-auto'}`}>
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#F2A900] to-amber-600 flex items-center justify-center shadow-lg shadow-amber-600/30">
              <Radar className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold text-white tracking-tight">ScoutAI</span>
          </div>
          {appState !== 'results' && (
            <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed font-medium">
              Competitive intelligence briefs powered by AI analysis.
            </p>
          )}
        </div>

        {/* Main content area */}
        <div className={`w-full ${appState === 'input' ? 'mb-auto' : ''}`}>
          {appState === 'input' && (
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-2xl mx-auto bg-gray-800/60 backdrop-blur-md rounded-2xl shadow-2xl shadow-black/40 border border-gray-700/50 p-8 transition-all duration-300"
            >
              <label
                htmlFor="question"
                className="block text-sm font-semibold text-gray-100 mb-3"
              >
                What do you want to know about your competitors?
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-4 w-5 h-5 text-gray-500 pointer-events-none" />
                <textarea
                  id="question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. How does Notion's pricing compare to Coda and Slite for teams of 50+? What are their key differentiators?"
                  className="w-full min-h-[140px] pl-12 pr-4 py-3.5 rounded-xl border border-gray-600 bg-gray-900/40 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/60 resize-y transition-all text-[15px] leading-relaxed"
                />
              </div>

              <div className="mt-6">
                <label
                  htmlFor="urls"
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-400 mb-2"
                >
                  <Globe className="w-3.5 h-3.5" />
                  Paste specific URLs
                  <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <input
                  id="urls"
                  type="text"
                  value={urls}
                  onChange={(e) => setUrls(e.target.value)}
                  placeholder="https://competitor.com/pricing, https://..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-900/40 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/60 transition-all text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={!question.trim()}
                className="mt-8 w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#F2A900] to-amber-600 text-gray-950 font-semibold text-base shadow-lg shadow-amber-600/30 hover:shadow-amber-600/50 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200"
              >
                Generate Brief
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-center text-xs text-gray-500 mt-4">
                Typically takes 1-3 minutes depending on scope
              </p>
            </form>
          )}

          {appState === 'loading' && <LoadingState />}

          {appState === 'results' && briefData && (
            <div className="space-y-6">
              <BriefResultsCard data={briefData} />
              <div className="flex justify-center">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 shadow-sm hover:bg-gray-700 hover:border-gray-600 active:scale-[0.98] transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  New Research
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
