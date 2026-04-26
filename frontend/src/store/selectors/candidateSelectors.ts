import { RootState } from '../index';

export const selectCandidateProfile = (state: RootState) => state.candidate.profile;
export const selectCandidateStats = (state: RootState) => state.candidate.stats;
export const selectCandidateLoading = (state: RootState) => state.candidate.loading;
