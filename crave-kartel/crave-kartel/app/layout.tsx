import type { Metadata } from "next";
import { Hind_Siliguri, Noto_Serif_Bengali } from "next/font/google";
import "./globals.css";
import Tracking from "@/components/Tracking";

// FONT NOTE: the reference's exact fonts could not be read from its HTML. Swap these two here once confirmed.
const display = Noto_Serif_Bengali({ subsets: ["bengali", "latin"], variable: "--font-display", display: "swap" });
const body = Hind_Siliguri({ subsets: ["bengali", "latin"], weight: ["400", "500", "600"], variable: "--font-body", display: "swap" });

const site = process.env.NEXT_PUBLIC_SITE_URL || "https://cravekartel.com";
const title = "Crave-Kartel — বাংলাদেশের সেরা প্রিমিয়াম চা | ১০০% প্রাকৃতিক | ক্যাশ অন ডেলিভারি";
const description = "Crave-Kartel থেকে অর্ডার করুন ১০০% খাঁটি প্রিমিয়াম চা পাতা। Classic, Gold ও Premium — তিনটি মানের চা, সারা বাংলাদেশে ক্যাশ অন ডেলিভারি। ঢাকায় ৮০ টাকা, ঢাকার বাইরে ১৩০ টাকা ডেলিভারি চার্জ।";
export const metadata: Metadata = {
  metadataBase: new URL(site), title, description,
  keywords: ["চা", "প্রিমিয়াম চা", "khati cha", "tea bangladesh", "crave kartel", "cash on delivery tea", "best tea bd", "চা পাতা অর্ডার"],
  openGraph: { title: "Crave-Kartel — খাঁটি প্রিমিয়াম চা, সরাসরি আপনার দোরগোড়ায়", description: "১০০% প্রাকৃতিক ও খাঁটি চা পাতা। এখনই অর্ডার করুন — ক্যাশ অন ডেলিভারি সুবিধা সহ।", type: "website", images: ["/images/banner.png"] },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true }, alternates: { canonical: "/" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={`${display.variable} ${body.variable}`}>
      <body>{children}<Tracking /></body>
    </html>
  );
}
