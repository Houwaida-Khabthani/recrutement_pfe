import { baseApi } from './baseApi';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // ================= LOGIN =================
    login: builder.mutation<any, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    // ================= REGISTER =================
    register: builder.mutation<any, any>({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: data, // ✅ JSON (not FormData)
      }),
    }),

    // ================= FORGOT PASSWORD =================
    forgotPassword: builder.mutation<any, string>({
      query: (email) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: { email },
      }),
    }),

    // ================= CURRENT USER =================
    getCurrentUser: builder.query<any, void>({
      query: () => ({
        url: '/auth/me',
        method: 'GET',
      }),
      providesTags: ['Profile'],
    }),

    // ================= CHANGE PASSWORD =================
    changePassword: builder.mutation<any, any>({
      query: (passwords) => ({
        url: '/auth/change-password',
        method: 'PUT',
        body: passwords,
      }),
    }),

  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useGetCurrentUserQuery,
  useChangePasswordMutation,
} = authApi;