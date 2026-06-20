import { converter, formatHex, toGamut } from 'culori';

const toOklch = converter('oklch');
const toRgb = converter('rgb');

export interface OklchColor {
  l: number;
  c: number;
  h: number;
}

export function hexToOklch(hex: string): OklchColor {
  const color = toOklch(hex);
  if (!color) return { l: 0.5, c: 0.1, h: 264 };
  return {
    l: color.l ?? 0.5,
    c: color.c ?? 0.1,
    h: color.h ?? 264,
  };
}

const gamutP3 = toGamut('p3', 'oklch');

export function oklchToHex(l: number, c: number, h: number): string {
  const color = gamutP3({ mode: 'oklch', l, c, h });
  return formatHex(color) ?? '#000000';
}

export function oklchToString(l: number, c: number, h: number): string {
  const lStr = l.toFixed(3);
  const cStr = c.toFixed(3);
  const hStr = h.toFixed(2);
  return `oklch(${lStr} ${cStr} ${hStr})`;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const color = toRgb(hex);
  if (!color) return { r: 0, g: 0, b: 0 };
  return {
    r: Math.round((color.r ?? 0) * 255),
    g: Math.round((color.g ?? 0) * 255),
    b: Math.round((color.b ?? 0) * 255),
  };
}

export function isValidHex(value: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}
