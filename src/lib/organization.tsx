'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { useUser } from './supabase-auth';

export interface Organization {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  website: string | null;
  description: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

interface OrganizationContextValue {
  organizations: Organization[];
  currentOrganization: Organization | null;
  isLoading: boolean;
  setCurrentOrganization: (org: Organization) => void;
  refresh: () => Promise<void>;
}

const CURRENT_ORG_KEY = 'ss_current_org_id';

const OrganizationContext = createContext<OrganizationContextValue>({
  organizations: [],
  currentOrganization: null,
  isLoading: true,
  setCurrentOrganization: () => {},
  refresh: async () => {},
});

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isUserLoading } = useUser();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganizationState] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadOrgs = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('owner_id', userId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: true });

    if (error || !data) {
      setOrganizations([]);
      setCurrentOrganizationState(null);
      return;
    }

    setOrganizations(data);

    const stored = typeof window !== 'undefined' ? localStorage.getItem(CURRENT_ORG_KEY) : null;
    const storedOrg = stored ? data.find((o) => o.id === stored) : null;
    const primary = data.find((o) => o.is_primary) || data[0] || null;
    setCurrentOrganizationState(storedOrg || primary);
  }, []);

  useEffect(() => {
    if (isUserLoading) return;
    if (!user) {
      setOrganizations([]);
      setCurrentOrganizationState(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    loadOrgs(user.id).finally(() => setIsLoading(false));
  }, [user, isUserLoading, loadOrgs]);

  const setCurrentOrganization = (org: Organization) => {
    setCurrentOrganizationState(org);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_ORG_KEY, org.id);
    }
  };

  const refresh = useCallback(async () => {
    if (!user) return;
    await loadOrgs(user.id);
  }, [user, loadOrgs]);

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        currentOrganization,
        isLoading,
        setCurrentOrganization,
        refresh,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  return useContext(OrganizationContext);
}
