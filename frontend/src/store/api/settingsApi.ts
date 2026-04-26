import { baseApi } from "./baseApi";

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // Get current user (email)
    getMe: builder.query({
      query: () => "/auth/me",
    }),

    // Change password
    changePassword: builder.mutation({
      query: (data: { currentPassword: string; newPassword: string }) => ({
        url: "/auth/change-password",
        method: "PUT",
        body: data,
      }),
    }),

    // Delete account
    deleteAccount: builder.mutation({
      query: () => ({
        url: "/auth/delete-account",
        method: "DELETE",
      }),
    }),

  }),
});

export const {
  useGetMeQuery,
  useChangePasswordMutation,
  useDeleteAccountMutation,
} = settingsApi;