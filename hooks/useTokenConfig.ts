'use client';

import { useTokenConfigContext } from '@/context/TokenConfigContext';
import type { TokenConfig } from '@/types/tokens';

export function useTokenConfig(): TokenConfig {
  return useTokenConfigContext().config;
}

export function useTokenDispatch() {
  return useTokenConfigContext().dispatch;
}
