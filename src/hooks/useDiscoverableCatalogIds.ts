import { useEffect, useState } from 'react';
import {
  getDiscoverableAuthors,
  getDiscoverableOrganizations,
} from '../utils/audiobookApi';
import { showApiError } from '../utils/toast';

export function useDiscoverableCatalogIds() {
  const [authorIds, setAuthorIds] = useState<Set<string>>(new Set());
  const [orgIds, setOrgIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      getDiscoverableAuthors(1, 100),
      getDiscoverableOrganizations(1, 100),
    ])
      .then(([authorsResult, orgsResult]) => {
        if (cancelled) {
          return;
        }
        setAuthorIds(new Set(authorsResult.authors.map(author => author.authorId)));
        setOrgIds(new Set(orgsResult.organizations.map(org => org.id)));
      })
      .catch(error => {
        if (!cancelled) {
          showApiError(error);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { authorIds, orgIds, loading };
}
