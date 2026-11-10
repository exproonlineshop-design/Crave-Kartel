"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { bn, FAQ, PACKAGES, WHY } from "@/lib/content";
import { useSettings } from "@/lib/useSettings";
import { track } from "@/lib/track";

export default function Store() {
  const s = useSettings();
  const [qty, setQty] = useState<Record<string, number>>({});
  const [area, setArea] = useState<"dhaka" | "outside">("dhaka");
  const [f, setF] = useState({ name: "", phone: "", address: "" });
  const [err, setErr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState<number | null>(null);

  const lines = useMemo(() => PACKAGES.filter((p) => (qty[p.id] ?? 0) > 0).map((p) => ({ ...p, q: qty[p.id] })), [qty]);
  const subtotal = lines.reduce((a, l) => a + l.price * l.q, 0);
  const delivery = lines.length ? (area === "dhaka" ? s.deliveryDhaka : s.deliveryOutside) : 0;
  const total = subtotal + delivery;

  const change = (id: string, name: string, price: number, d: number) => {
    setQty((q) => ({ ...q, [id]: Math.max(0, Math.min(20, (q[id] ?? 0) + d)) }));
    if (d > 0) track("AddToCart", { value: price, content_name: name });
  };

  async function checkout(e: React.FormEvent) {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!lines.length) er.cart = "কমপক্ষে একটি প্যাকেজ বেছে নিন";
    if (f.name.trim().length < 2) er.name = "আপনার নাম লিখুন";
    if (!/^(?:\+?88)?01[3-9]\d{8}$/.test(f.phone.replace(/[\s-]/g, ""))) er.phone = "সঠিক মোবাইল নাম্বার দিন (যেমন 01XXXXXXXXX)";
    if (f.address.trim().length < 10) er.address = "সম্পূর্ণ ঠিকানা লিখুন";
    setErr(er);
    if (Object.keys(er).length) return;
    setBusy(true);
    track("InitiateCheckout", { value: total });
    const items = lines.map((l) => ({ name: l.name, kg: l.q, price: l.price }));
    if (db) {
      try {
        await Promise.race([
          addDoc(collection(db, "orders"), { name: f.name.trim(), phone: f.phone.trim(), address: f.address.trim(), area, items, subtotal, delivery, total, status: "pending", createdAt: serverTimestamp() }),
          new Promise((r) => setTimeout(r, 2500)),
        ]);
      } catch { /* order is still sent via WhatsApp */ }
    }
    const msg = [
      "নতুন অর্ডার — Crave-Kartel", "",
      ...items.map((i) => `${i.name} × ${i.kg} কেজি = ৳${i.kg * i.price}`),
      `ডেলিভারি (${area === "dhaka" ? "ঢাকার ভিতরে" : "ঢাকার বাইরে"}): ৳${delivery}`,
      `সর্বমোট: ৳${total} (ক্যাশ অন ডেলিভারি)`, "",
      `নাম: ${f.name.trim()}`, `মোবাইল: ${f.phone.trim()}`, `ঠিকানা: ${f.address.trim()}`,
    ].join("\n");
    track("Contact", { value: total });
    window.location.href = `https://wa.me/${s.whatsapp}?text=${encodeURIComponent(msg)}`;
    setBusy(false);
  }

  const Err = ({ k }: { k: string }) => (err[k] ? <p role="alert" className="mt-1 text-sm text-red-300">{err[k]}</p> : null);
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between bg-forest-950/80 px-5 py-3 backdrop-blur">
        <a href="#" className="flex items-center gap-3 font-display text-xl text-gold-400"><Image src="/images/logo.png" alt="" width={36} height={36} className="rounded-full" />Crave-Kartel</a>
        <nav className="hidden gap-6 md:flex">{[["#pricing", "প্যাকেজ"], ["#faq", "প্রশ্নোত্তর"], ["#contact", "যোগাযোগ"]].map(([h, t]) => <a key={h} href={h} className="hover:text-gold-400">{t}</a>)}</nav>
        <a href="#order" className="btn !py-2">অর্ডার করুন</a>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="font-display text-3xl md:text-4xl">আমাদের চা কেন আলাদা</h2>
        <p className="mt-2 text-white/70">প্রতিটি পাতা বাছাই করা হয় যত্নসহকারে, যেন প্রতি কাপে থাকে খাঁটি স্বাদ আর সুবাস</p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {WHY.map(([t, d]) => <div key={t} className="rounded-xl border border-gold-500/25 p-5"><h3 className="font-display text-lg text-gold-400">{t}</h3><p className="mt-2 text-sm text-white/75">{d}</p></div>)}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="font-display text-3xl md:text-4xl">আপনার জন্য সঠিক প্যাকেজ</h2>
        <p className="mt-2 text-white/70">প্রতি কেজি হিসেবে মূল্য নির্ধারিত — প্রয়োজন অনুযায়ী বেছে নিন Classic, Gold বা Premium</p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {PACKAGES.map((p) => (
            <motion.article key={p.id} onViewportEnter={() => track("ViewContent", { value: p.price, content_name: p.name })} viewport={{ once: true, amount: 0.6 }}
              className="overflow-hidden rounded-2xl border border-gold-500/30 bg-forest-900">
              <div className="relative aspect-[3/4]"><Image src={p.image} alt={`${p.name} চা`} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" /></div>
              <div className="p-5">
                <h3 className="font-display text-2xl">{p.name}</h3>
                <p className="text-gold-400">৳{bn(p.price)}/কেজি</p>
                <div className="mt-4 flex items-center gap-3" role="group" aria-label={`${p.name} পরিমাণ`}>
                  <button type="button" aria-label="কমান" className="h-10 w-10 rounded-full border border-gold-500/50" onClick={() => change(p.id, p.name, p.price, -1)}>−</button>
                  <span aria-live="polite" className="w-10 text-center text-lg">{bn(qty[p.id] ?? 0)}</span>
                  <button type="button" aria-label="বাড়ান" className="h-10 w-10 rounded-full border border-gold-500/50" onClick={() => change(p.id, p.name, p.price, 1)}>+</button>
                  <span className="text-sm text-white/60">কেজি</span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section id="order" className="mx-auto max-w-3xl px-5 py-20">
        <h2 className="font-display text-3xl md:text-4xl">এখনই আপনার অর্ডারটি কনফার্ম করুন</h2>
        <p className="mt-2 text-white/70">ক্যাশ অন ডেলিভারি — পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন</p>
        <form onSubmit={checkout} noValidate className="mt-8 space-y-4 rounded-2xl border border-gold-500/30 bg-forest-900 p-6">
          <div><label htmlFor="n">আপনার নাম *</label><input id="n" className="field mt-1" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" /><Err k="name" /></div>
          <div><label htmlFor="p">মোবাইল নাম্বার *</label><input id="p" inputMode="tel" className="field mt-1" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} autoComplete="tel" /><Err k="phone" /></div>
          <div><label htmlFor="a">সম্পূর্ণ ঠিকানা *</label><textarea id="a" rows={3} className="field mt-1" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} autoComplete="street-address" /><Err k="address" /></div>
          <div><label htmlFor="ar">এলাকা *</label>
            <select id="ar" className="field mt-1" value={area} onChange={(e) => setArea(e.target.value as "dhaka" | "outside")}>
              <option value="dhaka">ঢাকার ভিতরে (ডেলিভারি ৳{bn(s.deliveryDhaka)})</option>
              <option value="outside">ঢাকার বাইরে (ডেলিভারি ৳{bn(s.deliveryOutside)})</option>
            </select></div>
          <div className="rounded-lg bg-forest-950 p-4" aria-live="polite">
            {lines.length ? lines.map((l) => <div key={l.id} className="flex justify-between"><span>{l.name} × {bn(l.q)} কেজি</span><span>৳{bn(l.price * l.q)}</span></div>)
              : <p className="text-white/60">আপনার কার্ট খালি। উপরের প্যাকেজ থেকে পরিমাণ বাড়ান।</p>}
            <div className="mt-2 flex justify-between text-white/70"><span>ডেলিভারি চার্জ</span><span>৳{bn(delivery)}</span></div>
            <div className="mt-1 flex justify-between border-t border-gold-500/30 pt-2 text-lg text-gold-400"><span>সর্বমোট</span><span>৳{bn(total)}</span></div>
          </div>
          <Err k="cart" />
          <button className="btn w-full" disabled={busy}>{busy ? "অপেক্ষা করুন…" : "WhatsApp-এ অর্ডার করুন"}</button>
          <p className="text-center text-sm text-white/60">পণ্য হাতে পাওয়ার পর মূল্য পরিশোধ করুন — কোনো অগ্রিম পেমেন্ট লাগবে না</p>
        </form>
      </section>

      <section id="faq" className="mx-auto max-w-3xl px-5 py-16">
        <h2 className="font-display text-3xl md:text-4xl">সচরাচর জিজ্ঞাসিত প্রশ্ন</h2>
        <div className="mt-6 divide-y divide-gold-500/20 border-y border-gold-500/20">
          {FAQ.map(([q, a], i) => (
            <div key={q}>
              <button className="flex w-full items-center justify-between py-4 text-left" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>{q}<span aria-hidden>{open === i ? "−" : "+"}</span></button>
              {open === i && <p className="pb-4 text-white/75">{a}</p>}
            </div>
          ))}
        </div>
      </section>

      <footer id="contact" className="border-t border-gold-500/20 px-5 py-12">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          <div><p className="font-display text-xl text-gold-400">Crave-Kartel</p><p className="mt-2 text-white/70">১০০% খাঁটি ও প্রাকৃতিক প্রিমিয়াম চা, সরাসরি আপনার দোরগোড়ায়। বাংলাদেশের বিশ্বস্ত চা ব্র্যান্ড।</p></div>
          <div><p className="text-gold-400">প্যাকেজ</p>{PACKAGES.map((p) => <p key={p.id}>{p.name} — ৳{bn(p.price)}/কেজি</p>)}</div>
          <div><p className="text-gold-400">যোগাযোগ</p>
            <a className="block hover:underline" href={`https://wa.me/${s.whatsapp}`} onClick={() => track("Contact")}>WhatsApp: +{s.whatsapp.replace(/^(880)(\d{4})(\d+)/, "$1 $2-$3")}</a>
            <a className="block hover:underline" href={`tel:${s.phone}`}>কল: {s.phone}</a>
            <a className="block hover:underline" href={`mailto:${s.email}`}>{s.email}</a><p>Dhaka, Bangladesh</p></div>
        </div>
        <p className="mt-8 text-center text-sm text-white/50">© 2026 Crave-Kartel. সর্বস্বত্ব সংরক্ষিত। | <a href="/admin" className="underline">Admin</a></p>
      </footer>

      <a href={`https://wa.me/${s.whatsapp}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp-এ যোগাযোগ করুন" onClick={() => track("Contact")}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-2xl shadow-lg">💬</a>
    </>
  );
}
