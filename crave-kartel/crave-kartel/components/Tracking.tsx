"use client";
import { useEffect, useState } from "react";
import { CONSENT_KEY, hasConsent, track } from "@/lib/track";
import { useSettings } from "@/lib/useSettings";

const RX = { meta: /^\d{8,20}$/, ga4: /^G-[A-Z0-9]{6,14}$/, ads: /^AW-\d{6,14}$/, tt: /^[A-Z0-9]{10,30}$/ };
function add(id: string, src: string, inline?: string) {
  if (document.getElementById(id)) return; // prevent duplicate init
  const s = document.createElement("script"); s.id = id;
  if (src) { s.src = src; s.async = true; }
  if (inline) s.text = inline;
  document.head.appendChild(s);
}

export default function Tracking() {
  const s = useSettings();
  const [consent, setConsent] = useState<"granted" | "denied" | "unset">("unset");
  useEffect(() => { try { const v = localStorage.getItem(CONSENT_KEY); if (v === "granted" || v === "denied") setConsent(v); } catch {} }, []);

  useEffect(() => {
    if (consent !== "granted") return;
    window.__ck = window.__ck || {};
    if (RX.meta.test(s.metaPixelId) && !window.__ck.meta) {
      window.__ck.meta = true;
      add("ck-meta", "", `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${s.metaPixelId}');`);
    }
    const gid = RX.ga4.test(s.ga4Id) ? s.ga4Id : RX.ads.test(s.adsId) ? s.adsId : "";
    if (gid && !window.__ck.gtag) {
      window.__ck.gtag = true;
      add("ck-gtag", `https://www.googletagmanager.com/gtag/js?id=${gid}`);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer!.push(arguments); };
      window.gtag("js", new Date());
      if (RX.ga4.test(s.ga4Id)) window.gtag("config", s.ga4Id, { send_page_view: false });
      if (RX.ads.test(s.adsId)) window.gtag("config", s.adsId);
    }
    if (RX.tt.test(s.tiktokId) && !window.__ck.tt) {
      window.__ck.tt = true;
      add("ck-tt", "", `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.load=function(e){var n=d.createElement("script");n.src="https://analytics.tiktok.com/i18n/pixel/events.js?sdkid="+e+"&lib="+t;n.async=!0;d.head.appendChild(n)};ttq.load('${s.tiktokId}');ttq.page()}(window,document,'ttq');`);
    }
    const t = setTimeout(() => track("PageView"), 400);
    return () => clearTimeout(t);
  }, [consent, s]);

  if (consent !== "unset" || hasConsent()) return null;
  const set = (v: "granted" | "denied") => { try { localStorage.setItem(CONSENT_KEY, v); } catch {} setConsent(v); };
  return (
    <div role="dialog" aria-label="কুকি সম্মতি" className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-xl border border-gold-500/40 bg-forest-900 p-4 shadow-xl">
      <p className="text-sm">আমরা বিজ্ঞাপন ও ট্র্যাকিংয়ের জন্য কুকি ব্যবহার করতে পারি। আপনি কি অনুমতি দেবেন?</p>
      <div className="mt-3 flex gap-3">
        <button className="btn !py-2" onClick={() => set("granted")}>অনুমতি দিন</button>
        <button className="rounded-full border border-gold-500/40 px-5 py-2" onClick={() => set("denied")}>না</button>
      </div>
    </div>
  );
}
