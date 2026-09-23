import disposableDomains from "disposable-email-domains/index.json";
import wildcardDomains from "disposable-email-domains/wildcard.json";

/**
 * `disposableDomains` is exact-match ("mailinator.com"); `wildcardDomains`
 * blocks that domain AND every subdomain of it ("*.trashmail.com") — some
 * temp-mail services hand out a fresh random subdomain per address instead
 * of reusing one fixed domain, so an exact-match-only list would miss them.
 */
const EXACT_DOMAINS = new Set(disposableDomains.map((domain) => domain.toLowerCase()));
const WILDCARD_DOMAINS = wildcardDomains.map((domain) => domain.toLowerCase());

export function isDisposableEmailDomain(email: string): boolean {
  const domain = email.trim().toLowerCase().split("@").pop();
  if (!domain) return false;

  if (EXACT_DOMAINS.has(domain)) return true;
  return WILDCARD_DOMAINS.some((wildcard) => domain === wildcard || domain.endsWith(`.${wildcard}`));
}
