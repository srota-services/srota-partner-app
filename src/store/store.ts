/**
 * Redux store configuration
 */
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import audiobooksReducer from './slices/audiobooksSlice';
import chaptersReducer from './slices/chaptersSlice';
import genresReducer from './slices/genresSlice';
import tagsReducer from './slices/tagsSlice';
import authorsReducer from './slices/authorsSlice';
import organizationAuthorsReducer from './slices/organizationAuthorsSlice';
import authorInboxReducer from './slices/authorInboxSlice';
import partnerRegistrationReducer from './slices/partnerRegistrationSlice';
import transcodingReducer from './slices/transcodingSlice';
export const store = configureStore({
  reducer: {
    auth: authReducer,
    audiobooks: audiobooksReducer,
    chapters: chaptersReducer,
    transcoding: transcodingReducer,
    genres: genresReducer,
    tags: tagsReducer,
    authors: authorsReducer,
    organizationAuthors: organizationAuthorsReducer,
    authorInbox: authorInboxReducer,
    partnerRegistration: partnerRegistrationReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: ['partnerRegistration.organizationProfile.image'],
      },
    }),
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
