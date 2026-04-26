import { baseApi } from './baseApi';

export const visaApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVisaStatus: builder.query({
      query: () => '/visas/status',
      providesTags: ['Visa'],
    }),

    getVisaHistory: builder.query({
      query: () => '/visas/history',
      providesTags: ['Visa'],
    }),

    getVisaDocuments: builder.query({
      query: (params) => ({
        url: '/visas/documents',
        params: params || {},
      }),
      providesTags: ['Visa'],
    }),

    uploadVisaDocs: builder.mutation({
      query: (data) => ({
        url: '/visas/upload',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Visa'],
    }),

    deleteVisaDoc: builder.mutation({
      query: (id) => ({
        url: `/visas/documents/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Visa'],
    }),

    updateVisaStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/visas/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Visa'],
    }),
  }),
});

export const {
  useGetVisaStatusQuery,
  useGetVisaHistoryQuery,
  useGetVisaDocumentsQuery,
  useUploadVisaDocsMutation,
  useDeleteVisaDocMutation,
  useUpdateVisaStatusMutation,
} = visaApi;
