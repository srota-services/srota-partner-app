import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { initializeTheme } from '../../store/slices/themeSlice';
import {
   applyThemeToDocument,
   resolveDocumentTheme,
} from '../../utils/themeStorage';

/**
 * Loads theme preference and applies it to the document for the current route.
 * Login, signup, and landing always stay in light mode.
 */
function ThemeRouteSync() {
   const dispatch = useAppDispatch();
   const location = useLocation();
   const mode = useAppSelector(state => state.theme.mode);
   const initialized = useAppSelector(state => state.theme.initialized);

   useEffect(() => {
      dispatch(initializeTheme());
   }, [dispatch]);

   useEffect(() => {
      if (!initialized) {
         return;
      }

      const effectiveTheme = resolveDocumentTheme(mode, location.pathname);
      applyThemeToDocument(effectiveTheme);
   }, [initialized, mode, location.pathname]);

   return null;
}

export default ThemeRouteSync;
