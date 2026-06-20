'use client';

import { useEffect } from 'react';
import { useTokenConfigContext } from '@/context/TokenConfigContext';
import { deserializeConfig } from '@/lib/url-serializer';

interface Props {
  /** Raw search params forwarded from the Server Component page */
  params: Record<string, string | string[] | undefined>;
}

/**
 * Reads URL search params (already parsed server-side) and syncs the
 * TokenConfig context so pickers reflect the shared URL on hydration.
 * Runs once on mount — no flash because the server already injected
 * matching <style> vars before JS loaded.
 */
export function URLConfigLoader({ params }: Props) {
  const { dispatch } = useTokenConfigContext();

  useEffect(() => {
    const urlParams = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v ?? '')]),
    );
    const config = deserializeConfig(urlParams);
    dispatch({ type: 'LOAD_CONFIG', config });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
