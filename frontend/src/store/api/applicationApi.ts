import { baseApi } from './baseApi';

export const applicationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    applyToJob: builder.mutation({
      query: ({ jobId, data }) => ({
        url: `/applications/apply/${jobId}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Applications'],
    }),
    getMyApplications: builder.query({
      query: () => '/applications/my-applications',
      providesTags: ['Applications'],
    }),
    getCompanyApplications: builder.query({
      query: (params) => ({
        url: '/applications/company-applications',
        params: params || {},
      }),
      providesTags: ['Applications'],
    }),
    updateApplicationStatus: builder.mutation({
      query: (data) => ({
        url: `/applications/${data.id}/status`,
        method: 'PATCH',
        body: { 
          ...data,
          statut: data.status // Translate to backend field name
        },
      }),
      invalidatesTags: ['Applications'],
    }),
    respondToOffer: builder.mutation({
      query: ({ id, decision }) => ({
        url: `/applications/${id}/offer-response`,
        method: 'PATCH',
        body: { decision },
      }),
      invalidatesTags: ['Applications'],
    }),
    deleteApplication: builder.mutation({
      query: (id) => ({
        url: `/applications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Applications'],
    }),
  }),
});

export const {
  useApplyToJobMutation,
  useGetMyApplicationsQuery,
  useGetCompanyApplicationsQuery,
  useUpdateApplicationStatusMutation,
  useRespondToOfferMutation,
  useDeleteApplicationMutation,
} = applicationApi;
