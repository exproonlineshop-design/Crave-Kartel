"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { collection, doc, getDocs, orderBy, query, setDoc, updateDoc } from "firebase/firestore";
import { auth, db, firebaseReady } from "@/lib/firebase";
import { DEFAULT_SETTINGS, Settings } from "@/lib/content";
import { useSettings } from "@/lib/useSettings";

type Order = { id: string; name: string; phone: string; address: string; total: number; status: string; items: { name: string; kg: number }[] };
const RX: Partial<Record<keyof Settings, [RegExp, string]>> = {
  metaPixelId: [/^(\d{8,20})?$/, "Meta Pixel ID শুধু সংখ্যা (৮–২০ ডিজিট)"],
  ga4Id: [/^(G-[A-Z0-9]{6,14})?$/, "GA4 ID এর ফরম্যাট G-XXXXXXXXXX"],
  adsId: [/^(AW-\d{6,14})?$/, "Google Ads ID এর ফরম্যাট AW-123456789"],
  tiktokId: [/^([A-Z0-9]{10,30})?$/, "TikTok Pixel ID ভুল"],
  whatsapp: [/^\d{10,15}$/, "WhatsApp নাম্বার কান্ট্রি কোডসহ, + ছাড়া"],
};

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [em, setEm] = useState(""); const [pw, setPw] = useState(""); const [msg, setMsg] = useState("");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const loaded = useSettings();
  const [s, setS] = useState<Settings>(DEFAULT_SETTINGS);
  useEffect(() => setS(loaded), [loaded]);
  useEffect(() => { if (!auth) { setReady(true); return; } return onAuthStateChanged(auth, (u) => { setUser(u); setReady(true); }); }, []);
  useEffect(() => {
    if (!user || !db) return;
    getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc")))
      .then((r) => setOrders(r.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Order, "id">) }))))
      .catch(() => { setOrders([]); setMsg("অর্ডার লোড হয়নি — এই ইউজার অ্যাডমিন নয় (admins/{uid} ডকুমেন্ট নেই)।"); });
  }, [user]);

  if (!firebaseReady) return <p className="p-8">Firebase কনফিগার করা নেই। .env.local এ NEXT_PUBLIC_FIREBASE_* সেট করুন (README দেখুন)।</p>;
  if (!ready) return <p className="p-8">লোড হচ্ছে…</p>;
  if (!user) return (
    <form className="mx-auto mt-24 max-w-sm space-y-4 p-6" onSubmit={async (e) => { e.preventDefault(); setMsg(""); try { await signInWithEmailAndPassword(auth!, em, pw); } catch { setMsg("ইমেইল বা পাসওয়ার্ড ভুল"); } }}>
      <h1 className="font-display text-2xl">অ্যাডমিন লগইন</h1>
      <input className="field" type="email" placeholder="ইমেইল" value={em} onChange={(e) => setEm(e.target.value)} required />
      <input className="field" type="password" placeholder="পাসওয়ার্ড" value={pw} onChange={(e) => setPw(e.target.value)} required />
      {msg && <p role="alert" className="text-red-300">{msg}</p>}<button className="btn w-full">লগইন করুন</button>
    </form>
  );

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    for (const k in RX) { const [r, m] = RX[k as keyof Settings]!; if (!r.test(String(s[k as keyof Settings]).trim())) return setMsg(m); }
    try { await setDoc(doc(db!, "settings", "site"), { ...s, deliveryDhaka: Number(s.deliveryDhaka), deliveryOutside: Number(s.deliveryOutside) }, { merge: true }); setMsg("সফলভাবে সেভ হয়েছে"); }
    catch { setMsg("সেভ হয়নি — অ্যাডমিন অনুমতি নেই"); }
  };
  const text: [keyof Settings, string][] = [["whatsapp", "WhatsApp (কান্ট্রি কোডসহ)"], ["phone", "কল নাম্বার"], ["email", "ইমেইল"], ["videoUrl", "হিরো ভিডিও URL (mp4/webm)"], ["metaPixelId", "Meta Pixel ID"], ["ga4Id", "GA4 Measurement ID"], ["adsId", "Google Ads ID (AW-…)"], ["adsLabel", "Google Ads Conversion Label"], ["tiktokId", "TikTok Pixel ID"]];
  return (
    <main className="mx-auto max-w-4xl space-y-10 p-6">
      <div className="flex justify-between"><h1 className="font-display text-2xl">Crave-Kartel অ্যাডমিন</h1><button onClick={() => signOut(auth!)}>লগ-আউট</button></div>
      {msg && <p role="status" className="rounded bg-forest-800 p-3">{msg}</p>}
      <form onSubmit={save} className="space-y-3">
        <h2 className="text-xl">সেটিংস ও ট্র্যাকিং</h2>
        {text.map(([k, l]) => <label key={k} className="block">{l}<input className="field mt-1" value={String(s[k])} onChange={(e) => setS({ ...s, [k]: e.target.value })} /></label>)}
        <label className="block">ঢাকার ভিতরে ডেলিভারি (৳)<input type="number" min={0} className="field mt-1" value={s.deliveryDhaka} onChange={(e) => setS({ ...s, deliveryDhaka: Number(e.target.value) })} /></label>
        <label className="block">ঢাকার বাইরে ডেলিভারি (৳)<input type="number" min={0} className="field mt-1" value={s.deliveryOutside} onChange={(e) => setS({ ...s, deliveryOutside: Number(e.target.value) })} /></label>
        <button className="btn">সেভ করুন</button>
      </form>
      <section>
        <h2 className="mb-3 text-xl">অর্ডারসমূহ</h2>
        {orders === null ? <p>লোড হচ্ছে…</p> : !orders.length ? <p className="text-white/60">এখনো কোনো অর্ডার আসেনি।</p> : orders.map((o) => (
          <div key={o.id} className="mb-3 rounded-lg border border-gold-500/25 p-4">
            <p>{o.name} — {o.phone} — ৳{o.total}</p><p className="text-sm text-white/70">{o.address}</p>
            <p className="text-sm">{o.items.map((i) => `${i.name}×${i.kg}`).join(", ")}</p>
            <select className="field mt-2 !w-auto" value={o.status} onChange={async (e) => { await updateDoc(doc(db!, "orders", o.id), { status: e.target.value }); setOrders(orders.map((x) => x.id === o.id ? { ...x, status: e.target.value } : x)); }}>
              {["pending", "confirmed", "delivered", "cancelled"].map((v) => <option key={v}>{v}</option>)}
            </select>
          </div>))}
      </section>
    </main>
  );
}
