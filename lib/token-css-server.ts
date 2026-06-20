import type { TokenConfig } from '@/types/tokens';
import { resolveTokens } from './token-engine';
import { computeTokenVars } from './compute-token-vars';

/**
 * Generates a complete :root { ... } CSS block for a given TokenConfig.
 * Safe for server-side use — no DOM access.
 * Inject the returned string via <style dangerouslySetInnerHTML> in layout/page.
 */
export function generateInitialStyles(config: TokenConfig): string {
  const resolved = resolveTokens(config);
  const vars = computeTokenVars(resolved, config);
  const lines = Object.entries(vars)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n');
  return `:root {\n${lines}\n}`;
}
