// Content taken from the live reference site. Editable settings override these via Firestore (settings/site).
export type Pkg = { id: string; name: string; price: number; image: string };
export const PACKAGES: Pkg[] = [
  { id: "classic", name: "Classic", price: 600, image: "/images/classic.png" },
  { id: "gold", name: "Gold", price: 800, image: "/images/green.png" },
  { id: "premium", name: "Premium", price: 1400, image: "/images/black.png" },
];
export type Settings = {
  whatsapp: string; phone: string; email: string; deliveryDhaka: number; deliveryOutside: number;
  videoUrl: string; metaPixelId: string; ga4Id: string; adsId: string; adsLabel: string; tiktokId: string;
};
export const DEFAULT_SETTINGS: Settings = {
  whatsapp: "8801736044189", phone: "01314-862703", email: "cravekartel9@gmail.com",
  deliveryDhaka: 80, deliveryOutside: 130, videoUrl: "",
  metaPixelId: "", ga4Id: "", adsId: "", adsLabel: "", tiktokId: "",
};
export const FAQ = [
  ["ডেলিভারি চার্জ কত?", "ঢাকার ভিতরে ডেলিভারি চার্জ ৳৮০ এবং ঢাকার বাইরে ৳১৩০। পণ্য হাতে পাওয়ার সময় ক্যাশ অন ডেলিভারিতে পরিশোধ করতে পারবেন।"],
  ["পণ্য পেতে কত সময় লাগবে?", "ঢাকার ভিতরে সাধারণত ১-২ দিন এবং ঢাকার বাইরে ২-৪ দিনের মধ্যে পণ্য পৌঁছে যায়।"],
  ["চা কি ১০০% খাঁটি ও প্রাকৃতিক?", "হ্যাঁ, আমাদের সব চা পাতা সরাসরি বাগান থেকে সংগ্রহ করা হয় এবং কোনো ধরনের ক্ষতিকর কেমিক্যাল বা ভেজাল মেশানো হয় না।"],
  ["কীভাবে অর্ডার করব?", "উপরের অর্ডার ফর্ম পূরণ করুন অথবা সরাসরি WhatsApp/কল করে অর্ডার করতে পারেন।"],
];
export const WHY = [
  ["১০০% প্রাকৃতিক", "কোনো কেমিক্যাল বা ভেজাল ছাড়াই সরাসরি বাগান থেকে সংগ্রহ করা চা পাতা"],
  ["প্রিমিয়াম কোয়ালিটি", "উন্নত মানের প্যাকেজিং ও কড়া কোয়ালিটি চেকের মাধ্যমে আপনার হাতে পৌঁছায়"],
  ["ক্যাশ অন ডেলিভারি", "অর্ডার করুন নিশ্চিন্তে, পণ্য হাতে পেয়ে তারপর মূল্য পরিশোধ করুন"],
  ["দ্রুত ডেলিভারি", "ঢাকায় ও ঢাকার বাইরে সারা দেশে দ্রুততম সময়ে পণ্য পৌঁছে দেওয়া হয়"],
];
export const bn = (n: number) => n.toLocaleString("bn-BD");
