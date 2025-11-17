import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_CONFIG } from '@/utils/constants';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_CONFIG.BASE_URL}/auth`,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    // Login
    login: builder.mutation({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response) => response.data,
    }),

    // Registro
    register: builder.mutation({
      query: (userData) => ({
        url: '/register',
        method: 'POST',
        body: userData,
      }),
      transformResponse: (response) => response.data,
    }),

    // Logout
    logout: builder.mutation({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),

    // Refresh token
    refreshToken: builder.mutation({
      query: (refreshToken) => ({
        url: '/refresh',
        method: 'POST',
        body: { refreshToken },
      }),
      transformResponse: (response) => response.data,
    }),

    // Obter perfil do usuário
    getProfile: builder.query({
      query: () => '/profile',
      transformResponse: (response) => response.data,
      providesTags: ['User'],
    }),

    // Atualizar perfil
    updateProfile: builder.mutation({
      query: (profileData) => ({
        url: '/profile',
        method: 'PUT',
        body: profileData,
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['User'],
    }),

    // Alterar senha
    changePassword: builder.mutation({
      query: (passwordData) => ({
        url: '/change-password',
        method: 'POST',
        body: passwordData,
      }),
      transformResponse: (response) => response.data,
    }),

    // Solicitar redefinição de senha
    requestPasswordReset: builder.mutation({
      query: (email) => ({
        url: '/forgot-password',
        method: 'POST',
        body: { email },
      }),
      transformResponse: (response) => response.data,
    }),

    // Redefinir senha
    resetPassword: builder.mutation({
      query: ({ token, password }) => ({
        url: '/reset-password',
        method: 'POST',
        body: { token, password },
      }),
      transformResponse: (response) => response.data,
    }),

    // Verificar email
    verifyEmail: builder.mutation({
      query: (token) => ({
        url: '/verify-email',
        method: 'POST',
        body: { token },
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['User'],
    }),

    // Reenviar email de verificação
    resendVerificationEmail: builder.mutation({
      query: () => ({
        url: '/resend-verification',
        method: 'POST',
      }),
      transformResponse: (response) => response.data,
    }),

    // Habilitar 2FA
    enable2FA: builder.mutation({
      query: () => ({
        url: '/2fa/enable',
        method: 'POST',
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['User'],
    }),

    // Desabilitar 2FA
    disable2FA: builder.mutation({
      query: (code) => ({
        url: '/2fa/disable',
        method: 'POST',
        body: { code },
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['User'],
    }),

    // Verificar código 2FA
    verify2FA: builder.mutation({
      query: (code) => ({
        url: '/2fa/verify',
        method: 'POST',
        body: { code },
      }),
      transformResponse: (response) => response.data,
    }),

    // Obter configurações de segurança
    getSecuritySettings: builder.query({
      query: () => '/security',
      transformResponse: (response) => response.data,
      providesTags: ['User'],
    }),

    // Atualizar configurações de segurança
    updateSecuritySettings: builder.mutation({
      query: (settings) => ({
        url: '/security',
        method: 'PUT',
        body: settings,
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useResendVerificationEmailMutation,
  useEnable2FAMutation,
  useDisable2FAMutation,
  useVerify2FAMutation,
  useGetSecuritySettingsQuery,
  useUpdateSecuritySettingsMutation,
} = authApi;
