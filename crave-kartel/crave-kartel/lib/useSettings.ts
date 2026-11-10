"use client";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { DEFAULT_SETTINGS, Settings } from "./content";

export function useSettings() {
  const [s, setS] = useState<Settings>(DEFAULT_SETTINGS);
  useEffect(() => {
    if (!db) return;
    getDoc(doc(db, "settings", "site")).then((d) => d.exists() && setS({ ...DEFAULT_SETTINGS, ...(d.data() as Partial<Settings>) })).catch(() => {});
  }, []);
  return s;
}
