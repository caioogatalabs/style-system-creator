'use client';

import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { TokenConfig, TokenAction, PrimitiveColors, TypographyConfig } from '@/types/tokens';
import { DEFAULT_TOKEN_CONFIG } from '@/lib/default-config';

interface TokenConfigContextValue {
  config: TokenConfig;
  dispatch: React.Dispatch<TokenAction>;
}

const TokenConfigContext = createContext<TokenConfigContextValue | null>(null);

function tokenReducer(state: TokenConfig, action: TokenAction): TokenConfig {
  switch (action.type) {
    case 'SET_COLOR':
      return {
        ...state,
        colors: { ...state.colors, [action.key]: action.value },
      };
    case 'SET_TYPOGRAPHY':
      return {
        ...state,
        typography: { ...state.typography, ...action.patch },
      };
    case 'SET_SURFACE':
      return {
        ...state,
        surface: { ...state.surface, ...action.patch },
      };
    case 'SET_SPACING':
      return {
        ...state,
        spacing: { ...state.spacing, ...action.patch },
      };
    case 'SET_LIGHTNESS_RANGE':
      return {
        ...state,
        lightnessRange: { ...state.lightnessRange, ...action.patch },
      };
    case 'SET_THEME':
      return { ...state, theme: action.theme };
    case 'LOAD_CONFIG':
      return action.config;
    case 'RESET':
      return DEFAULT_TOKEN_CONFIG;
    default:
      return state;
  }
}

export function TokenConfigProvider({ children, initialConfig }: {
  children: ReactNode;
  initialConfig?: TokenConfig;
}) {
  const [config, dispatch] = useReducer(
    tokenReducer,
    initialConfig ?? DEFAULT_TOKEN_CONFIG
  );

  return (
    <TokenConfigContext.Provider value={{ config, dispatch }}>
      {children}
    </TokenConfigContext.Provider>
  );
}

export function useTokenConfigContext(): TokenConfigContextValue {
  const ctx = useContext(TokenConfigContext);
  if (!ctx) throw new Error('useTokenConfigContext must be used within TokenConfigProvider');
  return ctx;
}
