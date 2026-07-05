import type { Middleware, UnknownAction } from '@reduxjs/toolkit';
import { resetPartnerRegistration } from './slices/partnerRegistrationSlice';
import {
  clearPartnerRegistrationDraft,
  persistPartnerRegistrationDraft,
} from '../utils/partnerRegistrationStorage';

const PERSIST_DEBOUNCE_MS = 250;

let persistTimer: ReturnType<typeof setTimeout> | null = null;

export const partnerRegistrationPersistenceMiddleware: Middleware =
  store => next => action => {
    const result = next(action);
    const typedAction = action as UnknownAction;

    if (resetPartnerRegistration.match(action)) {
      if (persistTimer) {
        clearTimeout(persistTimer);
        persistTimer = null;
      }
      clearPartnerRegistrationDraft();
      return result;
    }

    if (
      typeof typedAction.type === 'string' &&
      typedAction.type.startsWith('partnerRegistration/') &&
      typedAction.type !== 'partnerRegistration/hydratePartnerRegistration'
    ) {
      if (persistTimer) {
        clearTimeout(persistTimer);
      }

      persistTimer = setTimeout(() => {
        void persistPartnerRegistrationDraft(store.getState().partnerRegistration);
      }, PERSIST_DEBOUNCE_MS);
    }

    return result;
  };
