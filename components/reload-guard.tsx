"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * ブラウザリロード時にTOPページへリダイレクト
 * 除外: /, /admin, /auth/*, /signup/*
 */
export function ReloadGuard() {
  const pathname = usePathname();

  useEffect(() => {
    // TOP・admin・auth・signupは除外
    if (
      !pathname ||
      pathname === "/" ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/auth") ||
      pathname.startsWith("/signup")
    ) {
      return;
    }

    // リロード検出
    const navEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    if (navEntries.length > 0 && navEntries[0].type === "reload") {
      window.location.href = "/";
    }
  }, [pathname]);

  return null;
}
