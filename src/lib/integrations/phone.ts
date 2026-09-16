/**
 * Phone number handling for Ghana.
 *
 * Accepts the shapes people actually type — 0545489200, 054 548 9200,
 * +233545489200, 233545489200 — and normalises to a single form.
 */

/** Digits only, with country code: 233545489200 */
export function toDigits(input: string, defaultCountry = '233') {
  const digits = input.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith(defaultCountry)) return digits;
  if (digits.startsWith('0')) return defaultCountry + digits.slice(1);
  // A bare 9-digit local number, e.g. 545489200.
  if (digits.length === 9) return defaultCountry + digits;
  return digits;
}

/** E.164 with the leading plus: +233545489200 */
export const toE164 = (input: string, defaultCountry = '233') => {
  const digits = toDigits(input, defaultCountry);
  return digits ? '+' + digits : '';
};

/** Kept for existing call sites. */
export const normaliseGhanaNumber = (input: string) => toDigits(input);
