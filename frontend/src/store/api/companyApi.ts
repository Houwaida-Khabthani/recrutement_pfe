import { baseApi } from './baseApi';

export const companyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query<any, void>({
      query: () => '/company/dashboard',
    }),
    getProfile: builder.query<any, void>({
      query: () => '/company/profile',
      providesTags: ['Profile'],
    }),
    getRecruiterProfile: builder.query<any, void>({
      query: () => '/recruiters/profile',
      providesTags: ['Profile'],
    }),
    // ✅ Get public company profile by ID
    getCompanyById: builder.query<any, string>({
      query: (id: string) => `/company/${id}`,
      providesTags: ['CompanyProfile'],
      transformResponse: (response: any) => response?.data || response,
    }),
    updateProfile: builder.mutation<any, any>({
      query: (body) => ({
        url: '/company/profile',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Profile'],
    }),
    getJobs: builder.query<any[], void>({
      query: () => '/jobs/company',
    }),
    getCompanyStats: builder.query<any, void>({
      query: () => '/company/stats',
    }),
  }),
});

export const {
  useGetDashboardQuery,
  useGetProfileQuery,
  useGetRecruiterProfileQuery,
  useGetCompanyByIdQuery,
  useUpdateProfileMutation,
  useGetCompanyStatsQuery,
} = companyApi;