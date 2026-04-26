import { RootState } from '../index';

export const selectAllJobs = (state: RootState) => state.jobs.items;
export const selectRecommendedJobs = (state: RootState) => state.jobs.recommended;
export const selectJobsLoading = (state: RootState) => state.jobs.loading;
