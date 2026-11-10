"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useSettings } from "@/lib/useSettings";

export default function Hero() {
  const { videoUrl } = useSettings();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [failed, setFailed] = useState(false);
  const [mobile, setMobile] = useState(false);
  useEffect(() => { setMobile(window.matchMedia("(max-width: 767px)").matches); }, []);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "15%"]);
  const showVideo = Boolean(videoUrl) && !reduce && !failed;

  return (
    <section ref={ref} className="relative flex min-h-[100svh] items-center overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url(/images/banner.png)" }} aria-hidden />
        {showVideo && (
          <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline
            preload={mobile ? "metadata" : "auto"} poster="/images/banner.png" onError={() => setFailed(true)} aria-hidden>
            <source src={videoUrl} type={videoUrl.endsWith(".webm") ? "video/webm" : "video/mp4"} />
          </video>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/55 to-forest-950/30" />
      </motion.div>
      <div className="mx-auto w-full max-w-6xl px-5 pt-24">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="mb-4 text-gold-400">১০০% খাঁটি ও প্রাকৃতিক — সরাসরি বাগান থেকে</motion.p>
        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.15 }} className="max-w-3xl font-display text-4xl leading-tight md:text-6xl">
          প্রতি কাপে খাঁটি চায়ের রাজকীয় স্বাদ
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.4 }} className="mt-5 max-w-xl text-lg text-white/85">
          Crave-Kartel এনেছে বাংলাদেশের সবচেয়ে বিশুদ্ধ প্রিমিয়াম চা পাতা। কোনো ভেজাল নেই, শুধু আসল স্বাদ ও সুবাস — যা প্রতিদিনের এক কাপ চা কে বানিয়ে তোলে বিশেষ মুহূর্ত।
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-8 flex flex-wrap gap-4">
          <a href="#order" className="btn">এখনই অর্ডার করুন</a>
          <a href="#pricing" className="rounded-full border border-gold-500/50 px-7 py-3 hover:bg-white/5">প্যাকেজ দেখুন</a>
        </motion.div>
      </div>
    </section>
  );
}
