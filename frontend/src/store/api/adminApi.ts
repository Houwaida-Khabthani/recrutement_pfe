import { baseApi } from './baseApi';

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStats: builder.query({
      query: () => '/admin/statistics',
      providesTags: ['Stats'],
    }),
    getAllUsers: builder.query({
      query: (params) => ({
        url: '/admin/users',
        params: params || {},
      }),
      providesTags: ['Users'],
    }),
    createUser: builder.mutation({
      query: (userData) => ({
        url: '/admin/users',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Users', 'Stats'],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...userData }) => ({
        url: `/admin/users/${id}`,
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: ['Users', 'Stats'],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users', 'Stats'],
    }),
    getAllCompanies: builder.query({
      query: (params) => ({
        url: '/admin/companies',
        params: params || {},
      }),
      providesTags: ['Companies'],
    }),
    createCompany: builder.mutation({
      query: (companyData) => ({
        url: '/admin/companies',
        method: 'POST',
        body: companyData,
      }),
      invalidatesTags: ['Companies', 'Stats'],
    }),
    updateCompany: builder.mutation({
      query: ({ id, ...companyData }) => ({
        url: `/admin/companies/${id}`,
        method: 'PUT',
        body: companyData,
      }),
      invalidatesTags: ['Companies', 'Stats'],
    }),
    deleteCompany: builder.mutation({
      query: (id) => ({
        url: `/admin/companies/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Companies', 'Stats'],
    }),
    approveCompany: builder.mutation({
      query: (id) => ({
        url: `/admin/companies/${id}/approve`,
        method: 'PUT',
      }),
      invalidatesTags: ['Companies', 'Stats'],
    }),
    rejectCompany: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/admin/companies/${id}/reject`,
        method: 'PUT',
        body: { reason },
      }),
      invalidatesTags: ['Companies', 'Stats'],
    }),
    getAllApplications: builder.query({
      query: (params) => ({
        url: '/admin/applications',
        params: params || {},
      }),
      providesTags: ['Applications'],
    }),
    updateApplicationStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin/applications/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Applications', 'Stats'],
    }),
    deleteApplication: builder.mutation({
      query: (id) => ({
        url: `/admin/applications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Applications', 'Stats'],
    }),
    getAllJobs: builder.query({
      query: (params) => ({
        url: '/admin/jobs',
        params: params || {},
      }),
      providesTags: ['Jobs'],
    }),
    getJobById: builder.query({
      query: (id) => `/admin/jobs/${id}`,
      providesTags: (result, error, id) => [{ type: 'Jobs', id }],
    }),
    approveJob: builder.mutation({
      query: (id) => ({
        url: `/admin/jobs/${id}/approve`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Jobs', 'Stats'],
    }),
    rejectJob: builder.mutation({
      query: (id) => ({
        url: `/admin/jobs/${id}/reject`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Jobs', 'Stats'],
    }),
    suspendJob: builder.mutation({
      query: (id) => ({
        url: `/admin/jobs/${id}/suspend`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Jobs', 'Stats'],
    }),
    createJob: builder.mutation({
      query: (jobData) => ({
        url: '/admin/jobs',
        method: 'POST',
        body: jobData,
      }),
      invalidatesTags: ['Jobs', 'Stats'],
    }),
    updateJob: builder.mutation({
      query: ({ id, ...jobData }) => ({
        url: `/admin/jobs/${id}`,
        method: 'PUT',
        body: jobData,
      }),
      invalidatesTags: ['Jobs', 'Stats'],
    }),
    deleteJob: builder.mutation({
      query: (id) => ({
        url: `/admin/jobs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Jobs', 'Stats'],
    }),
    getReports: builder.query({
      query: () => '/admin/reports',
    }),
  }),
});

export const {
  useGetStatsQuery,
  useGetAllUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetAllCompaniesQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useDeleteCompanyMutation,
  useApproveCompanyMutation,
  useRejectCompanyMutation,
  useGetAllApplicationsQuery,
  useUpdateApplicationStatusMutation,
  useDeleteApplicationMutation,
  useGetAllJobsQuery,
  useGetJobByIdQuery,
  useApproveJobMutation,
  useRejectJobMutation,
  useSuspendJobMutation,
  useCreateJobMutation,
  useUpdateJobMutation,
  useDeleteJobMutation,
  useGetReportsQuery,
} = adminApi;
