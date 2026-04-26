import { RootState } from '../index';

export const selectSidebarOpen = (state: RootState) => state.ui.sidebarOpen;
export const selectTheme = (state: RootState) => state.ui.theme;
