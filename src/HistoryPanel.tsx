import { useState } from 'react';
import { Clock, ChevronRight, PanelLeftClose, PanelLeftOpen, Trash2 } from 'lucide-react';

export interface BriefHistoryEntry {
  id: string;
  objective: string;
  created_at: string;
}

interface HistoryPanelProps {
  entries: BriefHistoryEntry[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (id: string) => void;
  onClearAll: () => Promise<void>;
  activeId: string | null;
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function HistoryPanel({ entries, isOpen, onToggle, onSelect, onClearAll, activeId }: HistoryPanelProps) {
  const [confirming, setConfirming] = useState(false);
  const [clearing, setClearing] = useState(false);

  const handleClear = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setClearing(true);
    await onClearAll();
    setClearing(false);
    setConfirming(false);
  };
  return (
    <>
      {/* Toggle button when panel is closed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed top-5 left-5 z-50 flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 shadow-lg text-sm font-medium text-gray-300 hover:bg-gray-700 hover:border-gray-600 transition-all"
        >
          <PanelLeftOpen className="w-4 h-4" />
          <span className="hidden sm:inline">History</span>
          {entries.length > 0 && (
            <span className="ml-1 w-5 h-5 rounded-full bg-amber-900/60 text-amber-300 text-xs font-bold flex items-center justify-center">
              {entries.length}
            </span>
          )}
        </button>
      )}

      {/* Sidebar panel */}
      <aside
        className={`fixed top-0 left-0 h-full z-40 bg-gray-850 border-r border-gray-700/80 shadow-2xl shadow-black/40 transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: '320px', backgroundColor: '#111827' }}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700/60">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-bold text-gray-200 uppercase tracking-wide">Past Briefs</h2>
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 transition-colors"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Entries list */}
        <div className="flex-1 overflow-y-auto">
          {entries.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-700/50 flex items-center justify-center mx-auto mb-3">
                <Clock className="w-5 h-5 text-gray-500" />
              </div>
              <p className="text-sm text-gray-400">No briefs yet</p>
              <p className="text-xs text-gray-500 mt-1">Generated briefs will appear here</p>
            </div>
          ) : (
            <ul className="py-2">
              {entries.map((entry) => (
                <li key={entry.id}>
                  <button
                    onClick={() => onSelect(entry.id)}
                    className={`w-full text-left px-5 py-3.5 flex items-start gap-3 hover:bg-gray-700/40 transition-colors group ${
                      activeId === entry.id ? 'bg-amber-900/30 border-r-2 border-amber-400' : ''
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug line-clamp-2 ${
                        activeId === entry.id ? 'text-amber-200 font-medium' : 'text-gray-300'
                      }`}>
                        {entry.objective}
                      </p>
                      <p className="text-xs text-gray-500 mt-1.5">
                        {formatTimestamp(entry.created_at)}
                      </p>
                    </div>
                    <ChevronRight className={`w-4 h-4 mt-0.5 shrink-0 transition-colors ${
                      activeId === entry.id ? 'text-amber-400' : 'text-gray-600 group-hover:text-gray-400'
                    }`} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Clear all button */}
        {entries.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-700/60">
            <button
              onClick={handleClear}
              onBlur={() => setConfirming(false)}
              disabled={clearing}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                confirming
                  ? 'bg-red-900/40 text-red-300 border border-red-700/60 hover:bg-red-900/60'
                  : 'text-gray-500 hover:text-red-400 hover:bg-red-900/20 border border-transparent'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              {clearing ? 'Clearing...' : confirming ? 'Confirm Clear All' : 'Clear History'}
            </button>
          </div>
        )}
      </aside>

      {/* Overlay to close panel on mobile */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[2px] sm:hidden"
        />
      )}
    </>
  );
}
