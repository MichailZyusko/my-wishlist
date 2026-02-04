export function buildReferralUrl(originalUrl: string, refCode: string) {
  const url = new URL(originalUrl);
  if (refCode) {
    url.searchParams.set('ref', refCode);
  }
  return url.toString();
}
