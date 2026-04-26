import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

type Theme = 'light' | 'dark';
type Language = 'EN' | 'FR';

const getInitialTheme = (): Theme => {
  const saved = localStorage.getItem('theme') as Theme | null;
  return saved || 'light';
};

const getInitialLanguage = (): Language => {
  const saved = localStorage.getItem('language') as Language | null;
  return saved || 'EN';
};

interface UiState {
  sidebarOpen: boolean;
  theme: Theme;
  language: Language;
}

const initialState: UiState = {
  sidebarOpen: false,
  theme: getInitialTheme(),
  language: getInitialLanguage(),
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
      localStorage.setItem('language', action.payload);
    },
  },
});

export const { toggleSidebar, setTheme, setLanguage } = uiSlice.actions;
export default uiSlice.reducer;