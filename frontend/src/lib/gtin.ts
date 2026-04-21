/** Merchant SKU: letters/digits, separators . _ - / (stored uppercase on server). */
export function isValidSku(raw: string): boolean {
  const s = raw.trim();
  if (s.length < 2 || s.length > 50) return false;
  const upper = s.toUpperCase();
  return /^[A-Z0-9][A-Z0-9._\-/]{0,48}[A-Z0-9]$/.test(upper);
}

/**
 * GS1 GTIN check-digit validator (GTIN-8, GTIN-12/UPC-A, GTIN-13/EAN-13, GTIN-14).
 * Strict: digits only, no separators or whitespace inside. Empty/whitespace = valid (optional field).
 */
export function isValidGtinOrEmpty(barcode: string): boolean {
  const d = barcode.trim();
  if (d.length === 0) return true;
  if (![8, 12, 13, 14].includes(d.length)) return false;
  if (!/^\d+$/.test(d)) return false;
  let sum = 0;
  let multiplyThree = true;
  for (let i = d.length - 2; i >= 0; i--) {
    const n = d.charCodeAt(i) - 48;
    sum += multiplyThree ? n * 3 : n;
    multiplyThree = !multiplyThree;
  }
  const check = (10 - (sum % 10)) % 10;
  return check === d.charCodeAt(d.length - 1) - 48;
}
