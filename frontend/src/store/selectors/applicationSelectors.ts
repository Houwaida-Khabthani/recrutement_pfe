import { RootState } from '../index';

export const selectMyApplications = (state: RootState) => state.applications.myApplications;
export const selectApplicationsLoading = (state: RootState) => state.applications.loading;
