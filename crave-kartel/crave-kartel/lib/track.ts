declare global { interface Window { fbq?: any; gtag?: any; ttq?: any; dataLayer?: any[]; __ck?: Record<string, boolean>; } }
type Ev = "PageView" | "ViewContent" | "AddToCart" | "InitiateCheckout" | "Contact";
export const CONSENT_KEY = "ck_consent";
export const hasConsent = () => { try { return typeof window !== "undefined" && localStorage.getItem(CONSENT_KEY) === "granted"; } catch { return false; } };

export function track(ev: Ev, data: { value?: number; content_name?: string } = {}) {
  if (typeof window === "undefined" || !hasConsent()) return;
  const p = { ...data, currency: "BDT" };
  try {
    window.fbq?.("track", ev, p);
    const ga: Record<Ev, string> = { PageView: "page_view", ViewContent: "view_item", AddToCart: "add_to_cart", InitiateCheckout: "begin_checkout", Contact: "contact" };
    window.gtag?.("event", ga[ev], p);
    if (ev !== "PageView") window.ttq?.track(ev, { value: data.value, currency: "BDT" });
  } catch { /* tracking must never break the UI */ }
}
// Purchase is intentionally NOT exposed: it must only fire after a verified, admin-confirmed order.
