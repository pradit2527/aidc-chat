"use client";

import { useEffect } from "react";
import { getProfile, saveProfile } from "@/lib/profileStore";
import type { Profile } from "@/lib/widget";

/** เก็บข้อมูลผู้ใช้ที่ล็อกอินไว้ใน localStorage — หน้าอื่น (สถานะรายงาน, รายงานของฉัน) ใช้ identifier ชุดเดียวกัน */
export default function SyncProfile({ profile }: { profile: Profile }) {
  useEffect(() => {
    if (JSON.stringify(getProfile()) !== JSON.stringify(profile)) saveProfile(profile);
  }, [profile]);
  return null;
}
