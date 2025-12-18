"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ITEMS } from "./items-library";

export default function RulesCard({ onClose }) {
  const incomeItems = ITEMS.filter((item) => item.type === "income");
  const expenseItems = ITEMS.filter((item) => item.type === "expense");
  const specialItems = ITEMS.filter((item) => item.type === "special");

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      {/* Responsive scrollable modal */}
      <Card className="w-full max-w-lg bg-white shadow-2xl rounded-2xl overflow-hidden animate-fadeIn">
        <div className="max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <CardContent className="p-5 space-y-6 text-gray-700">
            <h2 className="text-xl sm:text-2xl font-bold text-center text-emerald-600">
              How to Play
            </h2>
            <p className="text-center text-sm sm:text-base text-gray-600 leading-relaxed">
              Catch income items to earn points and avoid expenses to keep your
              score high! Special items give rare bonuses.
            </p>

            {/* 💰 Income Section */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-green-600 mb-2 text-center">
                Income Items (+ Points)
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {incomeItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col items-center bg-green-50 p-2 sm:p-3 rounded-xl shadow-sm hover:shadow-md transition-all"
                  >
                    <Image
                      src={item.icon}
                      alt={item.id}
                      width={40}
                      height={40}
                      className="mb-1 sm:mb-2"
                    />
                    <p className="text-xs sm:text-sm font-medium capitalize">
                      {item.id}
                    </p>
                    <p className="text-[11px] sm:text-xs text-green-700 font-semibold">
                      +{item.points}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 💸 Expense Section */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-red-600 mb-2 text-center">
                Expense Items (− Points)
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {expenseItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col items-center bg-red-50 p-2 sm:p-3 rounded-xl shadow-sm hover:shadow-md transition-all"
                  >
                    <Image
                      src={item.icon}
                      alt={item.id}
                      width={40}
                      height={40}
                      className="mb-1 sm:mb-2"
                    />
                    <p className="text-xs sm:text-sm font-medium capitalize">
                      {item.id}
                    </p>
                    <p className="text-[11px] sm:text-xs text-red-700 font-semibold">
                      {item.points}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 🌟 Special Section */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-yellow-600 mb-2 text-center">
                Special Items (Rare)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {specialItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col items-center bg-yellow-50 p-2 sm:p-3 rounded-xl shadow-sm hover:shadow-md transition-all"
                  >
                    <Image
                      src={item.icon}
                      alt={item.id}
                      width={40}
                      height={40}
                      className="mb-1 sm:mb-2"
                    />
                    <p className="text-xs sm:text-sm font-medium capitalize">
                      {item.id}
                    </p>
                    <p className="text-[11px] sm:text-xs text-yellow-700 font-semibold">
                      +{item.points}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ✅ Button */}
            <div className="flex justify-center pt-3 pb-2">
              <Button
                onClick={onClose}
                className="px-5 py-2 text-sm sm:text-base text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md"
              >
                Got it!
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>

      <style jsx>{`
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
