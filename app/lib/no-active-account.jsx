"use client";

import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export default function NoAccount() {
  const router = useRouter();

  return (
    <Card className="p-10 flex flex-col items-center text-center gap-5 rounded-2xl shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800">
        No Accounts Found
      </h2>

      <p className="text-sm text-gray-600 max-w-xs leading-relaxed">
        You currently don’t have any accounts. Create your first one to start
        managing your finances.
      </p>

      <button
        onClick={() => {
            router.push("/dashboard?openCreateAccount=true")
        }}
        
        className="
          flex items-center gap-2 px-5 py-2.5 
          bg-yellow-500 hover:bg-yellow-600 
          text-white text-sm font-medium 
          rounded-lg transition-all duration-200
          shadow-sm hover:shadow-md
        "
      >
        <Plus size={16} /> Create Account
      </button>
    </Card>
  );
}
