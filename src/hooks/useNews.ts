import { useEffect, useMemo, useState } from 'react';

export type NewsCategory =
  | 'all'
  | 'forex'
  | 'stocks'
  | 'crypto'
  | 'commodities'
  | 'indices'
  | 'economy';

export type Timeframe = '24h' | 'week' | 'month' | 'all';

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  summary?: string;
  imageUrl?: string;
  publishedAt: string; // ISO string
  category: Exclude<NewsCategory, 'all'>;
  importance?: 'low' | 'medium' | 'high';
  symbols?: string[];
}

export interface NewsFilters {
  category: NewsCategory;
  timeframe: Timeframe;
  highImpactOnly: boolean;
  query: string;
}

function getMsForTimeframe(timeframe: Timeframe): number | undefined {
  switch (timeframe) {
    case '24h':
      return 24 * 60 * 60 * 1000;
    case 'week':
      return 7 * 24 * 60 * 60 * 1000;
    case 'month':
      return 30 * 24 * 60 * 60 * 1000;
    default:
      return undefined;
  }
}

function createMockNews(): NewsItem[] {
  const now = Date.now();
  const base = [
    {
      id: '1',
      title: 'Dollar edges higher as traders await Fed commentary',
      source: 'MockWire',
      url: '#',
      summary:
        'The U.S. dollar strengthened slightly in early trading as investors look ahead to remarks from several Federal Reserve officials later today.',
      imageUrl: undefined,
      publishedAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      category: 'forex' as const,
      importance: 'medium' as const,
      symbols: ['DXY', 'EURUSD'],
    },
    {
      id: '2',
      title: 'S&P 500 slips as tech shares retreat after earnings',
      source: 'MarketPulse',
      url: '#',
      summary:
        'Mega-cap tech names led declines following mixed earnings, while defensive sectors outperformed.',
      imageUrl: undefined,
      publishedAt: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
      category: 'stocks' as const,
      importance: 'high' as const,
      symbols: ['SPY', 'AAPL', 'NVDA'],
    },
    {
      id: '3',
      title: 'Bitcoin holds above key support amid risk-off mood',
      source: 'CryptoDesk',
      url: '#',
      summary:
        'Bitcoin remained resilient, consolidating above a key technical support as broader markets turned cautious.',
      imageUrl: undefined,
      publishedAt: new Date(now - 40 * 60 * 1000).toISOString(),
      category: 'crypto' as const,
      importance: 'medium' as const,
      symbols: ['BTCUSD'],
    },
    {
      id: '4',
      title: 'Oil dips as inventories rise more than expected',
      source: 'CommoditiesNow',
      url: '#',
      summary:
        'Crude oil prices fell after government data showed a larger-than-expected build in U.S. stockpiles.',
      imageUrl: undefined,
      publishedAt: new Date(now - 28 * 60 * 60 * 1000).toISOString(),
      category: 'commodities' as const,
      importance: 'high' as const,
      symbols: ['CL'],
    },
    {
      id: '5',
      title: 'Eurozone PMI points to slowing expansion in manufacturing',
      source: 'EcoWatch',
      url: '#',
      summary:
        'Flash PMI data suggested a slowdown in the Eurozone manufacturing sector, weighing on growth expectations.',
      imageUrl: undefined,
      publishedAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'economy' as const,
      importance: 'medium' as const,
      symbols: [],
    },
    {
      id: '6',
      title: 'Nikkei advances as exporters benefit from weaker yen',
      source: 'AsiaMarkets',
      url: '#',
      summary:
        'Japanese equities climbed with exporters rallying on the back of currency weakness.',
      imageUrl: undefined,
      publishedAt: new Date(now - 14 * 60 * 60 * 1000).toISOString(),
      category: 'indices' as const,
      importance: 'low' as const,
      symbols: ['NKY'],
    },
  ];

  return base;
}

async function fetchFromFinnhub(): Promise<NewsItem[] | null> {
  const key = import.meta.env.VITE_FINNHUB_API_KEY;
  if (!key) return null;
  try {
    const url = `https://finnhub.io/api/v1/news?category=general&token=${encodeURIComponent(
      key,
    )}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: Array<{
      id?: number;
      headline: string;
      source: string;
      url: string;
      summary: string;
      image: string;
      datetime: number;
      category?: string;
      related?: string;
    }> = await res.json();
    return data.slice(0, 100).map((n, idx) => ({
      id: String(n.id ?? idx),
      title: n.headline,
      source: n.source,
      url: n.url,
      summary: n.summary,
      imageUrl: n.image || undefined,
      publishedAt: new Date((n.datetime || 0) * 1000).toISOString(),
      category: 'stocks',
      importance: 'medium',
      symbols: n.related ? n.related.split(',').filter(Boolean) : [],
    }));
  } catch {
    return null;
  }
}

async function fetchFromMarketaux(): Promise<NewsItem[] | null> {
  const key = import.meta.env.VITE_MARKETAUX_API_KEY;
  if (!key) return null;
  try {
    const url = `https://api.marketaux.com/v1/news/all?language=en&limit=50&api_token=${encodeURIComponent(
      key,
    )}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: { data: Array<any> } = await res.json();
    return data.data.map((n: any, idx: number) => ({
      id: String(n.uuid ?? idx),
      title: n.title,
      source: n.source ?? 'Marketaux',
      url: n.url,
      summary: n.description,
      imageUrl: n.image_url ?? undefined,
      publishedAt: new Date(n.published_at || Date.now()).toISOString(),
      category: 'stocks',
      importance: 'medium',
      symbols: Array.isArray(n.entities)
        ? n.entities.map((e: any) => e.symbol).filter(Boolean)
        : [],
    }));
  } catch {
    return null;
  }
}

export function useNews() {
  const [allItems, setAllItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<NewsFilters>({
    category: 'all',
    timeframe: '24h',
    highImpactOnly: false,
    query: '',
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      const provider = (import.meta.env.VITE_NEWS_PROVIDER || '').toLowerCase();
      let items: NewsItem[] | null = null;

      if (provider === 'finnhub') {
        items = await fetchFromFinnhub();
      } else if (provider === 'marketaux') {
        items = await fetchFromMarketaux();
      }

      if (!items) {
        items = createMockNews();
      }

      if (!cancelled) {
        setAllItems(items);
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const now = Date.now();
    const maxAge = getMsForTimeframe(filters.timeframe);

    return allItems
      .filter((n) => {
        if (filters.category !== 'all' && n.category !== filters.category) return false;
        if (filters.highImpactOnly && n.importance !== 'high') return false;
        if (maxAge !== undefined) {
          const age = now - new Date(n.publishedAt).getTime();
          if (age > maxAge) return false;
        }
        if (filters.query.trim()) {
          const q = filters.query.trim().toLowerCase();
          const hay = [
            n.title,
            n.summary ?? '',
            n.source,
            ...(n.symbols ?? []),
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }, [allItems, filters]);

  return {
    items: filtered,
    total: allItems.length,
    loading,
    error,
    filters,
    setFilters,
  } as const;
}
