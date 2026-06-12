"use client";

import { useEffect } from "react";
import { BasicHome } from "@/components/basic-home";
import { useLanguage } from "@/lib/i18n";

export function DevBasicPreview() {
  const { setLanguage } = useLanguage();

  useEffect(() => {
    setLanguage("kr");
  }, [setLanguage]);

  return <BasicHome currentDay={1} streakCount={3} planKey="basic" membershipResolved />;
}
