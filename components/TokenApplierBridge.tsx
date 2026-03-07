'use client';

import { useEffect } from 'react';
import { useTokenConfig } from '@/hooks/useTokenConfig';
import { resolveTokens } from '@/lib/token-engine';
import { applyTokensToDOM } from '@/lib/token-applier';
import { loadFont } from '@/lib/font-loader';

export function TokenApplierBridge() {
  const config = useTokenConfig();

  useEffect(() => {
    const resolved = resolveTokens(config);
    applyTokensToDOM(resolved, config);
    loadFont(config.typography.headingFamily);
    loadFont(config.typography.bodyFamily);
  }, [config]);

  return null;
}
