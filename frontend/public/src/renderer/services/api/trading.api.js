import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_CONFIG } from '@/utils/constants';

export const tradingApi = createApi({
  reducerPath: 'tradingApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_CONFIG.BASE_URL}/trading`,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Orders', 'Trades'],
  endpoints: (builder) => ({
    // Criar ordem
    createOrder: builder.mutation({
      query: (orderData) => ({
        url: '/orders',
        method: 'POST',
        body: orderData,
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Orders'],
    }),

    // Obter ordens
    getOrders: builder.query({
      query: (params) => ({
        url: '/orders',
        params,
      }),
      transformResponse: (response) => response.data,
      providesTags: ['Orders'],
    }),

    // Obter ordem específica
    getOrder: builder.query({
      query: (orderId) => `/orders/${orderId}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, orderId) => [{ type: 'Orders', id: orderId }],
    }),

    // Cancelar ordem
    cancelOrder: builder.mutation({
      query: (orderId) => ({
        url: `/orders/${orderId}/cancel`,
        method: 'POST',
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Orders'],
    }),

    // Modificar ordem
    modifyOrder: builder.mutation({
      query: ({ orderId, updates }) => ({
        url: `/orders/${orderId}`,
        method: 'PUT',
        body: updates,
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Orders'],
    }),

    // Obter ordens abertas
    getOpenOrders: builder.query({
      query: (symbol) => ({
        url: '/orders/open',
        params: symbol ? { symbol } : {},
      }),
      transformResponse: (response) => response.data,
      providesTags: ['Orders'],
    }),

    // Obter histórico de ordens
    getOrderHistory: builder.query({
      query: (params) => ({
        url: '/orders/history',
        params,
      }),
      transformResponse: (response) => response.data,
      providesTags: ['Orders'],
    }),

    // Obter execuções/trades
    getTrades: builder.query({
      query: (params) => ({
        url: '/trades',
        params,
      }),
      transformResponse: (response) => response.data,
      providesTags: ['Trades'],
    }),

    // Obter trade específico
    getTrade: builder.query({
      query: (tradeId) => `/trades/${tradeId}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, tradeId) => [{ type: 'Trades', id: tradeId }],
    }),

    // Obter histórico de trades
    getTradeHistory: builder.query({
      query: (params) => ({
        url: '/trades/history',
        params,
      }),
      transformResponse: (response) => response.data,
      providesTags: ['Trades'],
    }),

    // Validar ordem antes de enviar
    validateOrder: builder.mutation({
      query: (orderData) => ({
        url: '/orders/validate',
        method: 'POST',
        body: orderData,
      }),
      transformResponse: (response) => response.data,
    }),

    // Obter limites de trading
    getTradingLimits: builder.query({
      query: () => '/limits',
      transformResponse: (response) => response.data,
    }),

    // Obter configurações de trading
    getTradingSettings: builder.query({
      query: () => '/settings',
      transformResponse: (response) => response.data,
    }),

    // Atualizar configurações de trading
    updateTradingSettings: builder.mutation({
      query: (settings) => ({
        url: '/settings',
        method: 'PUT',
        body: settings,
      }),
      transformResponse: (response) => response.data,
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetOrdersQuery,
  useGetOrderQuery,
  useCancelOrderMutation,
  useModifyOrderMutation,
  useGetOpenOrdersQuery,
  useGetOrderHistoryQuery,
  useGetTradesQuery,
  useGetTradeQuery,
  useGetTradeHistoryQuery,
  useValidateOrderMutation,
  useGetTradingLimitsQuery,
  useGetTradingSettingsQuery,
  useUpdateTradingSettingsMutation,
} = tradingApi;
