"use client";

import NoAccount from "@/app/lib/no-active-account";
import NoTransactionData from "@/app/lib/no-transaction-data";
import CreateAccountDrawer from "@/components/create-account-drawer";
import { useSearchParams } from "next/navigation";


export default function DashboardWrapper({ children }) {
  const searchParams = useSearchParams();
  const noAccount = searchParams.get("noAccount");
  const noTransactions = searchParams.get("noTransactions");
  const openCreate = searchParams.get("openCreateAccount");
  
  if (noAccount === "true") {
    return <NoAccount />;
  }

  if (noTransactions === "true") {
    return <NoTransactionData />;
  }
   return (
    <>
      {/* Auto-open Create Account drawer */}
      {openCreate === "true" && (
        <CreateAccountDrawer openFromQuery={true} />
      )}

      {children}
    </>
  );
}
