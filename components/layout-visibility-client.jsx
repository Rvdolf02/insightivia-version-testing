"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * This client component only hides header/footer when /cha-ching is active
 * It doesn’t import any server components.
 */
export default function LayoutVisibilityClient({ children, footer }) {
  const pathname = usePathname();
  const isChaChing = pathname.startsWith("/cha-ching");

  useEffect(() => {
    const header = document.querySelector("header");
    const footerEl = document.querySelector("footer");

    if (isChaChing) {
      if (header) header.style.display = "none";
      if (footerEl) footerEl.style.display = "none";
    } else {
      if (header) header.style.display = "";
      if (footerEl) footerEl.style.display = "";
    }
  }, [pathname, isChaChing]);

  return <>{children}</>;
}
