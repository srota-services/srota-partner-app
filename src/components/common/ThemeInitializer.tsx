import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { initializeTheme } from '../../store/slices/themeSlice';
import { applyThemeToDocument } from '../../utils/themeStorage';

/**
 * Applies persisted theme on boot and keeps document data-theme in sync with Redux.
 */
function ThemeInitializer() {
   const dispatch = useAppDispatch();
   const mode = useAppSelector(state => state.theme.mode);
   const initialized = useAppSelector(state => state.theme.initialized);

   useEffect(() => {
      dispatch(initializeTheme());
   }, [dispatch]);

   useEffect(() => {
      if (initialized) {
         applyThemeToDocument(mode);
      }
   }, [initialized, mode]);

   return null;
}

export default ThemeInitializer;
