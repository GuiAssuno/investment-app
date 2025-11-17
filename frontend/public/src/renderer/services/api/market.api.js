import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_CONFIG } from '@/utils/constants';

export const marketApi = createApi({
  reducerPath: 'marketApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_CONFIG.BASE_URL}/market`,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Quote', 'Candles', 'OrderBook', 'MarketStatus'],
  endpoints: (builder) => ({
    // Obter cotação de um símbolo
    getQuote: builder.query({
      query: (symbol) => `/quote/${symbol}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, symbol) => [{ type: 'Quote', id: symbol }],
    }),

    // Obter cotações de múltiplos símbolos
    getQuotes: builder.query({
      query: (symbols) => ({
        url: '/quotes',
        params: { symbols: symbols.join(',') },
      }),
      transformResponse: (response) => response.data,
      providesTags: ['Quote'],
    }),

    // Obter dados históricos (candles)
    getCandles: builder.query({
      query: ({ symbol, interval, from, to }) => ({
        url: `/candles/${symbol}`,
        params: { interval, from, to },
      }),
      transformResponse: (response) => response.data,
      providesTags: (result, error, { symbol }) => [{ type: 'Candles', id: symbol }],
    }),

    // Obter book de ofertas
    getOrderBook: builder.query({
      query: (symbol) => `/orderbook/${symbol}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, symbol) => [{ type: 'OrderBook', id: symbol }],
    }),

    // Obter status do mercado
    getMarketStatus: builder.query({
      query: () => '/status',
      transformResponse: (response) => response.data,
      providesTags: ['MarketStatus'],
    }),

    // Buscar símbolos
    searchSymbols: builder.query({
      query: (query) => ({
        url: '/search',
        params: { q: query },
      }),
      transformResponse: (response) => response.data,
    }),

    // Obter informações de um símbolo
    getSymbolInfo: builder.query({
      query: (symbol) => `/symbols/${symbol}`,
      transformResponse: (response) => response.data,
    }),

    // Obter lista de símbolos por categoria
    getSymbolsByCategory: builder.query({
      query: (category) => ({
        url: '/symbols',
        params: { category },
      }),
      transformResponse: (response) => response.data,
    }),

    // Obter índices de mercado (Ibovespa, etc)
    getIndices: builder.query({
      query: () => '/indices',
      transformResponse: (response) => response.data,
    }),

    // Obter moedas
    getCurrencies: builder.query({
      query: () => '/currencies',
      transformResponse: (response) => response.data,
    }),

    // Obter commodities
    getCommodities: builder.query({
      query: () => '/commodities',
      transformResponse: (response) => response.data,
    }),

    // Obter maiores altas do dia
    getTopGainers: builder.query({
      query: (params) => ({
        url: '/movers/gainers',
        params,
      }),
      transformResponse: (response) => response.data,
    }),

    // Obter maiores baixas do dia
    getTopLosers: builder.query({
      query: (params) => ({
        url: '/movers/losers',
        params,
      }),
      transformResponse: (response) => response.data,
    }),

    // Obter mais negociados
    getMostTraded: builder.query({
      query: (params) => ({
        url: '/movers/most-traded',
        params,
      }),
      transformResponse: (response) => response.data,
    }),

    // Obter notícias de mercado
    getMarketNews: builder.query({
      query: (params) => ({
        url: '/news',
        params,
      }),
      transformResponse: (response) => response.data,
    }),

    // Obter notícias de um símbolo específico
    getSymbolNews: builder.query({
      query: ({ symbol, ...params }) => ({
        url: `/news/${symbol}`,
        params,
      }),
      transformResponse: (response) => response.data,
    }),

    // Obter calendário econômico
    getEconomicCalendar: builder.query({
      query: (params) => ({
        url: '/calendar',
        params,
      }),
      transformResponse: (response) => response.data,
    }),

    // Obter dados fundamentalistas
    getFundamentals: builder.query({
      query: (symbol) => `/fundamentals/${symbol}`,
      transformResponse: (response) => response.data,
    }),

    // Obter dividendos
    getDividends: builder.query({
      query: ({ symbol, ...params }) => ({
        url: `/dividends/${symbol}`,
        params,
      }),
      transformResponse: (response) => response.data,
    }),
  }),
});

export const {
  useGetQuoteQuery,
  useGetQuotesQuery,
  useGetCandlesQuery,
  useGetOrderBookQuery,
  useGetMarketStatusQuery,
  useSearchSymbolsQuery,
  useGetSymbolInfoQuery,
  useGetSymbolsByCategoryQuery,
  useGetIndicesQuery,
  useGetCurrenciesQuery,
  useGetCommoditiesQuery,
  useGetTopGainersQuery,
  useGetTopLosersQuery,
  useGetMostTradedQuery,
  useGetMarketNewsQuery,
  useGetSymbolNewsQuery,
  useGetEconomicCalendarQuery,
  useGetFundamentalsQuery,
  useGetDividendsQuery,
} = marketApi;
