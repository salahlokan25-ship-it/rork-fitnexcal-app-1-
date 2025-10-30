import React from 'react';
import { Search, Filter, Flame, Clock, Globe2, ChevronRight } from 'lucide-react';
import { useNews, NewsCategory, Timeframe } from '../hooks/useNews';

const categoryOptions: Array<{ key: NewsCategory; label: string; icon: React.ReactNode }> = [
  { key: 'all', label: 'All', icon: <Globe2 className="h-4 w-4" /> },
  { key: 'forex', label: 'Forex', icon: <span className="text-green-400 text-xs font-semibold">FX</span> },
  { key: 'stocks', label: 'Stocks', icon: <span className="text-blue-400 text-xs font-semibold">EQ</span> },
  { key: 'crypto', label: 'Crypto', icon: <span className="text-yellow-400 text-xs font-semibold">₿</span> },
  { key: 'commodities', label: 'Commodities', icon: <span className="text-orange-400 text-xs font-semibold">COM</span> },
  { key: 'indices', label: 'Indices', icon: <span className="text-purple-400 text-xs font-semibold">IDX</span> },
  { key: 'economy', label: 'Economy', icon: <span className="text-pink-400 text-xs font-semibold">ECO</span> },
];

const timeframeOptions: Array<{ key: Timeframe; label: string }> = [
  { key: '24h', label: '24H' },
  { key: 'week', label: '1W' },
  { key: 'month', label: '1M' },
  { key: 'all', label: 'All' },
];

function ImportanceBadge({ level }: { level?: 'low' | 'medium' | 'high' }) {
  const map: Record<string, string> = {
    low: 'bg-gray-700 text-gray-300',
    medium: 'bg-yellow-700/40 text-yellow-300',
    high: 'bg-red-700/40 text-red-300',
  };
  const label = level ? level[0].toUpperCase() + level.slice(1) : 'Medium';
  return (
    <span className={`px-2 py-0.5 rounded text-xs ${map[level ?? 'medium']}`}>{label}</span>
  );
}

function NewsCard({ item }: { item: ReturnType<typeof useNews>['items'][number] }) {
  const date = new Date(item.publishedAt);
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="block border border-gray-800 rounded-lg p-4 hover:bg-gray-900 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <span>{item.source}</span>
            <span>•</span>
            <span>
              <Clock className="inline h-3 w-3 mr-1" />
              {date.toLocaleString()}
            </span>
          </div>
          <h3 className="text-white font-semibold leading-snug mb-2">{item.title}</h3>
          {item.summary && (
            <p className="text-gray-400 text-sm line-clamp-2">{item.summary}</p>
          )}
          {item.symbols && item.symbols.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {item.symbols.slice(0, 5).map((s) => (
                <span key={s} className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-300">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt=""
            className="w-24 h-16 object-cover rounded border border-gray-800"
            loading="lazy"
          />
        )}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <ImportanceBadge level={item.importance} />
        <span className="text-xs text-gray-500">{item.category.toUpperCase()}</span>
        <ChevronRight className="h-4 w-4 text-gray-600 ml-auto" />
      </div>
    </a>
  );
}

const News: React.FC = () => {
  const { items, loading, error, filters, setFilters, total } = useNews();

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Market News</h1>
        <p className="text-gray-400 text-sm">Curated market headlines similar to Investing.com</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1 space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">Filters</h2>
              <Filter className="h-4 w-4 text-gray-400" />
            </div>

            <div className="mb-4">
              <label className="text-xs text-gray-400">Search</label>
              <div className="mt-1 relative">
                <Search className="h-4 w-4 text-gray-500 absolute left-2 top-1/2 -translate-y-1/2" />
                <input
                  value={filters.query}
                  onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
                  className="w-full bg-black border border-gray-800 rounded pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-600"
                  placeholder="Search headlines, symbols..."
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs text-gray-400">Category</label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {categoryOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setFilters((f) => ({ ...f, category: opt.key }))}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded border text-xs ${
                      filters.category === opt.key
                        ? 'border-green-600 bg-green-600/20 text-green-300'
                        : 'border-gray-800 bg-gray-900 text-gray-300 hover:border-gray-700'
                    }`}
                  >
                    {opt.icon}
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs text-gray-400">Timeframe</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {timeframeOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setFilters((f) => ({ ...f, timeframe: opt.key }))}
                    className={`px-2 py-1 rounded text-xs border ${
                      filters.timeframe === opt.key
                        ? 'border-green-600 bg-green-600/20 text-green-300'
                        : 'border-gray-800 bg-gray-900 text-gray-300 hover:border-gray-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.highImpactOnly}
                  onChange={(e) => setFilters((f) => ({ ...f, highImpactOnly: e.target.checked }))}
                  className="accent-green-600"
                />
                <span className="text-gray-300">High impact only</span>
              </label>
              <Flame className={`h-4 w-4 ${filters.highImpactOnly ? 'text-red-400' : 'text-gray-500'}`} />
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <h2 className="text-sm font-semibold mb-3">Quick Stats</h2>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>Total loaded: <span className="text-gray-200">{total}</span></li>
              <li>Showing now: <span className="text-gray-200">{items.length}</span></li>
            </ul>
          </div>
        </aside>

        <main className="lg:col-span-3 space-y-3">
          {loading && (
            <div className="text-gray-400">Loading news...</div>
          )}
          {error && (
            <div className="text-red-400">{error}</div>
          )}
          {!loading && items.length === 0 && (
            <div className="text-gray-400">No news matched your filters.</div>
          )}

          {!loading && items.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </main>
      </div>
    </div>
  );
};

export default News;
