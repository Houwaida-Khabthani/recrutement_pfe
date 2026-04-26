import { baseApi } from "./baseApi";

export const interviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInterviews: builder.query({
      query: () => "/interviews",
      transformResponse: (response: any) => Array.isArray(response) ? response : response?.data || [],
      providesTags: ['Interviews'],
    }),

    getApplicationInterviews: builder.query({
      query: (applicationId) => `/interviews/application/${applicationId}`,
      transformResponse: (response: any) => Array.isArray(response) ? response : response?.data || [],
      providesTags: ['Interviews'],
    }),

    setExpectedInterviews: builder.mutation({
      query: ({ applicationId, expected_interviews }) => ({
        url: `/interviews/application/${applicationId}/expected`,
        method: "PATCH",
        body: { expected_interviews },
      }),
      invalidatesTags: ['Applications', 'Interviews'],
    }),

    scheduleInterviewStep: builder.mutation({
      query: ({ applicationId, step, date, meeting_link }) => ({
        url: `/interviews/application/${applicationId}`,
        method: "POST",
        body: { step, date, meeting_link },
      }),
      invalidatesTags: ['Interviews'],
    }),

    updateInterviewStatus: builder.mutation({
      query: ({ id, status, notes }) => ({
        url: `/interviews/${id}/status`,
        method: 'PATCH',
        body: { status, notes },
      }),
      invalidatesTags: ['Interviews'],
    }),

    confirmInterview: builder.mutation({
      query: (id) => ({
        url: `/interviews/${id}/confirm`,
        method: "PATCH",
      }),
      invalidatesTags: ['Applications', 'Interviews'],
    }),

    cancelInterview: builder.mutation({
      query: (id) => ({
        url: `/interviews/${id}/cancel`,
        method: "PATCH",
      }),
      invalidatesTags: ['Applications', 'Interviews'],
    }),

    // Check if user can join an interview
    checkCanJoin: builder.query({
      query: (interviewId) => `/interviews/${interviewId}/can-join`,
      transformResponse: (response: any) => response?.data || response,
    }),

    // Update meeting link for an interview
    updateMeetingLink: builder.mutation({
      query: ({ interviewId, meeting_link }) => ({
        url: `/interviews/${interviewId}/meeting-link`,
        method: 'PATCH',
        body: { meeting_link },
      }),
      invalidatesTags: ['Interviews'],
    }),
  }),
});

export const {
  useGetInterviewsQuery,
  useGetApplicationInterviewsQuery,
  useSetExpectedInterviewsMutation,
  useScheduleInterviewStepMutation,
  useUpdateInterviewStatusMutation,
  useConfirmInterviewMutation,
  useCancelInterviewMutation,
  useCheckCanJoinQuery,
  useUpdateMeetingLinkMutation,
} = interviewApi;
