import { RootState } from '../index';

export const selectVisaStatus = (state: RootState) => state.visa.status;
export const selectVisaHistory = (state: RootState) => state.visa.history;
