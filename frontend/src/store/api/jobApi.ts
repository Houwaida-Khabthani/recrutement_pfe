import { baseApi } from './baseApi';

export const jobApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getJobs: builder.query({
      query: () => '/jobs',
      providesTags: ['Jobs'],
    }),
    getMyJobs: builder.query({
      query: () => '/jobs/my-jobs',
      providesTags: ['Jobs'],
    }),
    getCompanyJobs: builder.query({
      query: (params) => ({
        url: '/jobs/company/my-jobs',
        params: params || {},
      }),
      providesTags: ['Jobs'],
    }),
    getJobById: builder.query({
      query: (id: string) => `/jobs/${id}`,
      providesTags: ['Jobs'],
    }),
    getRecommendedJobs: builder.query({
      query: () => '/jobs/recommended',
      providesTags: ['Jobs'],
    }),
    createJob: builder.mutation({
      query: (data) => ({
        url: '/jobs',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Jobs'],
    }),
    updateJob: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/jobs/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Jobs'],
    }),
    deleteJob: builder.mutation({
      query: (id: string | number) => ({
        url: `/jobs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Jobs'],
    }),
  }),
});

export const {
  useGetJobsQuery,
  useGetMyJobsQuery,
  useGetCompanyJobsQuery,
  useGetJobByIdQuery,
  useGetRecommendedJobsQuery,
  useCreateJobMutation,
  useUpdateJobMutation,
  useDeleteJobMutation,
} = jobApi;
