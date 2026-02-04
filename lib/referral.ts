import type { ReferralSetting } from "./types"

export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace("www.", "")
  } catch {
    return ""
  }
}

export function applyReferralToUrl(
  originalUrl: string,
  referralSettings: ReferralSetting[]
): string {
  const domain = extractDomain(originalUrl)
  const setting = referralSettings.find((s) => domain.includes(s.store_domain))

  if (!setting) {
    return originalUrl
  }

  try {
    const url = new URL(originalUrl)
    url.searchParams.set(setting.referral_param, setting.referral_value)
    return url.toString()
  } catch {
    return originalUrl
  }
}

// Common referral parameter patterns for popular stores
export const COMMON_REFERRAL_PATTERNS: Record<
  string,
  { param: string; example: string }
> = {
  "amazon.com": { param: "tag", example: "yourtag-20" },
  "amazon.co.uk": { param: "tag", example: "yourtag-21" },
  "amazon.de": { param: "tag", example: "yourtag-21" },
  "ebay.com": { param: "mkcid", example: "1" },
  "aliexpress.com": { param: "aff_id", example: "your_aff_id" },
  "etsy.com": { param: "ref", example: "your_ref_code" },
  "walmart.com": { param: "wmlspartner", example: "your_partner_id" },
  "target.com": { param: "afid", example: "your_affiliate_id" },
  "bestbuy.com": { param: "irclickid", example: "your_click_id" },
}
