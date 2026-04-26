import { useAppSelector, useAppDispatch } from './useAppDispatch';
import { setTheme, setLanguage } from '../store/slices/uiSlice';
import { translations } from '../utils/translations';

export const useThemeAndLanguage = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);
  const language = useAppSelector((state) => state.ui.language);
  const t = translations[language];

  return {
    theme,
    language,
    t,
    setTheme: (newTheme: 'light' | 'dark') => dispatch(setTheme(newTheme)),
    setLanguage: (newLanguage: 'EN' | 'FR') => dispatch(setLanguage(newLanguage)),
  };
};
