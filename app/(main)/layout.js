"use client";

import { usePathname } from "next/navigation";
import React from "react";

const MainLayout = ({ children }) => {
  const pathname = usePathname();
  const isChaChing = pathname.startsWith("/cha-ching");

  return (
    <div className={`container mx-auto ${isChaChing ? "my-0 mb-0" : "my-32"}`}>
      {children}
    </div>
  );
};

export default MainLayout;
