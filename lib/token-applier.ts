'use client';

import type { ResolvedTokens, TokenConfig } from '@/types/tokens';
import { computeTokenVars } from './compute-token-vars';

function setVar(name: string, value: string) {
  document.documentElement.style.setProperty(name, value);
}

export function applyTokensToDOM(resolved: ResolvedTokens, config: TokenConfig): void {
  document.documentElement.setAttribute('data-theme', config.theme);
  const vars = computeTokenVars(resolved, config);
  Object.entries(vars).forEach(([name, value]) => setVar(name, value));
}
