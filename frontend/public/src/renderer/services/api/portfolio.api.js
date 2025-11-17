import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_CONFIG } from '@/utils/constants';

export const portfolioApi = createApi({
  reducerPath: 'portfolioApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_CONFIG.BASE_URL}/portfolio`,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Portfolio', 'Positions', 'Performance', 'Watchlist'],
  endpoints: (builder) => ({
    // Obter resumo do portfólio
    getPortfolioSummary: builder.query({
      query: () => '/summary',
      transformResponse: (response) => response.data,
      providesTags: ['Portfolio'],
    }),

    // Obter posições
    getPositions: builder.query({
      query: (params) => ({
        url: '/positions',
        params,
      }),
      transformResponse: (response) => response.data,
      providesTags: ['Positions'],
    }),

    // Obter posição específica
    getPosition: builder.query({
      query: (symbol) => `/positions/${symbol}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, symbol) => [{ type: 'Positions', id: symbol }],
    }),

    // Obter performance do portfólio
    getPerformance: builder.query({
      query: (params) => ({
        url: '/performance',
        params,
      }),
      transformResponse: (response) => response.data,
      providesTags: ['Performance'],
    }),

    // Obter histórico de performance
    getPerformanceHistory: builder.query({
      query: (params) => ({
        url: '/performance/history',
        params,
      }),
      transformResponse: (response) => response.data,
      providesTags: ['Performance'],
    }),

    // Obter alocação de ativos
    getAllocation: builder.query({
      query: () => '/allocation',
      transformResponse: (response) => response.data,
      providesTags: ['Portfolio'],
    }),

    // Obter diversificação
    getDiversification: builder.query({
      query: () => '/diversification',
      transformResponse: (response) => response.data,
      providesTags: ['Portfolio'],
    }),

    // Obter dividendos recebidos
    getDividendsReceived: builder.query({
      query: (params) => ({
        url: '/dividends',
        params,
      }),
      transformResponse: (response) => response.data,
    }),

    // Obter histórico de transações
    getTransactionHistory: builder.query({
      query: (params) => ({
        url: '/transactions',
        params,
      }),
      transformResponse: (response) => response.data,
    }),

    // Obter relatório de imposto de renda
    getTaxReport: builder.query({
      query: (year) => ({
        url: '/tax-report',
        params: { year },
      }),
      transformResponse: (response) => response.data,
    }),

    // Obter watchlist
    getWatchlist: builder.query({
      query: () => '/watchlist',
      transformResponse: (response) => response.data,
      providesTags: ['Watchlist'],
    }),

    // Adicionar símbolo à watchlist
    addToWatchlist: builder.mutation({
      query: (symbol) => ({
        url: '/watchlist',
        method: 'POST',
        body: { symbol },
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Watchlist'],
    }),

    // Remover símbolo da watchlist
    removeFromWatchlist: builder.mutation({
      query: (symbol) => ({
        url: `/watchlist/${symbol}`,
        method: 'DELETE',
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Watchlist'],
    }),

    // Criar watchlist personalizada
    createWatchlist: builder.mutation({
      query: (watchlistData) => ({
        url: '/watchlists',
        method: 'POST',
        body: watchlistData,
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Watchlist'],
    }),

    // Obter watchlists personalizadas
    getWatchlists: builder.query({
      query: () => '/watchlists',
      transformResponse: (response) => response.data,
      providesTags: ['Watchlist'],
    }),

    // Atualizar watchlist
    updateWatchlist: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `/watchlists/${id}`,
        method: 'PUT',
        body: updates,
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Watchlist'],
    }),

    // Deletar watchlist
    deleteWatchlist: builder.mutation({
      query: (id) => ({
        url: `/watchlists/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Watchlist'],
    }),

    // Obter alertas
    getAlerts: builder.query({
      query: () => '/alerts',
      transformResponse: (response) => response.data,
    }),

    // Criar alerta
    createAlert: builder.mutation({
      query: (alertData) => ({
        url: '/alerts',
        method: 'POST',
        body: alertData,
      }),
      transformResponse: (response) => response.data,
    }),

    // Atualizar alerta
    updateAlert: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `/alerts/${id}`,
        method: 'PUT',
        body: updates,
      }),
      transformResponse: (response) => response.data,
    }),

    // Deletar alerta
    deleteAlert: builder.mutation({
      query: (id) => ({
        url: `/alerts/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response) => response.data,
    }),
  }),
});

export const {
  useGetPortfolioSummaryQuery,
  useGetPositionsQuery,
  useGetPositionQuery,
  useGetPerformanceQuery,
  useGetPerformanceHistoryQuery,
  useGetAllocationQuery,
  useGetDiversificationQuery,
  useGetDividendsReceivedQuery,
  useGetTransactionHistoryQuery,
  useGetTaxReportQuery,
  useGetWatchlistQuery,
  useAddToWatchlistMutation,
  useRemoveFromWatchlistMutation,
  useCreateWatchlistMutation,
  useGetWatchlistsQuery,
  useUpdateWatchlistMutation,
  useDeleteWatchlistMutation,
  useGetAlertsQuery,
  useCreateAlertMutation,
  useUpdateAlertMutation,
  useDeleteAlertMutation,
} = portfolioApi;
