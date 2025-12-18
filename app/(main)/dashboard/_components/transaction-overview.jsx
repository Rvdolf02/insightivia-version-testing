"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
} from "recharts";
import React, { useEffect, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

const COLORS = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEEAD",
    "#D4A5A5",
    "#9FA8DA",
];

const DashboardOverview = ({ accounts, transactions }) => {
    const [selectedAccountId, setSelectedAccountId] = useState(
        accounts.find((a) => a.isDefault)?.id || accounts[0]?.id
    );

    // NEW: detect screen size safely
  const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
    if (typeof window === "undefined") return; // avoid SSR errors

    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile(); // run immediately
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

    // Filter transactions for selected account
    const accountTransactions = transactions.filter(
        (t) => t.accountId === selectedAccountId
    );

    const recentTransactions = accountTransactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    // Calculate expense breakdown for current month
    const currentDate = new Date();
    const currentMonthExpenses = accountTransactions.filter((t) => {
        const transactionDate = new Date(t.date);
        return (
            t.type === "EXPENSE" &&
            transactionDate.getMonth() === currentDate.getMonth() &&
            transactionDate.getFullYear() === currentDate.getFullYear()
        );
    });

    // Group expenses by category
    const expensesByCategory = currentMonthExpenses.reduce((acc, transaction) => {
        const category = transaction.category;
        if (!acc[category]) {
            acc[category] = 0;
        }
        acc[category] += transaction.amount;
        return acc
    }, {});

    // Formt data for pie chart
    const pieChartData = Object.entries(expensesByCategory).map(
        ([category, amount]) => ({
            name: category,
            value: amount,
        })
    );

    // Tooltip format
    const capitalize = (s) =>
    s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";

  const CustomRadarTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const datum = payload[0].payload ?? payload[0];
    const name = capitalize(datum.name);
    const value = Number(datum.value || 0);

    return (
      <div className="bg-white text-sm rounded shadow p-2">
        <div className="font-medium">{name}</div>
        <div>
          ₱
          {value.toLocaleString("en-PH", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      </div>
    );
  };
  return (
    <div className='grid gap-4 md:grid-cols-2'>
        <Card className="rounded-2xl">
    <CardHeader className="flex flex-row items-center justify-between pb-3">
      <CardTitle className="text-base font-semibold">
        Recent Transactions
      </CardTitle>
      <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
        <SelectTrigger className="w-[150px] text-sm">
          <SelectValue placeholder="Select account" />
        </SelectTrigger>
        <SelectContent>
          {accounts.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              {account.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </CardHeader>
    <CardContent>
      {recentTransactions.length === 0 ? (
        <p className="text-center text-muted-foreground py-6">
          No recent transactions
        </p>
      ) : (
        <ul className="space-y-4">
          {recentTransactions.map((transaction) => (
            <li
              key={transaction.id}
              className="flex items-center justify-between border-b last:border-0 pb-3"
            >
              <div>
                <p className="text-sm font-medium">
                  {transaction.description || "Untitled Transaction"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(transaction.date), "PP")}
                </p>
              </div>
              <div
                className={cn(
                  "text-sm font-semibold flex items-center",
                  transaction.type === "EXPENSE"
                    ? "text-red-500"
                    : "text-green-500"
                )}
              >
                {transaction.type === "EXPENSE" ? (
                  <ArrowDownRight className="mr-1 h-4 w-4" />
                ) : (
                  <ArrowUpRight className="mr-1 h-4 w-4" />
                )}
               ₱
                {Number(transaction.amount).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}

              </div>
            </li>
          ))}
        </ul>
      )}
    </CardContent>
  </Card>

      <Card>
  <CardHeader>
    <CardTitle>
      Monthly Expense Breakdown
    </CardTitle>
  </CardHeader>
  <CardContent className="sm:p-20 p-0 pb-5">
    {pieChartData.length === 0 ? (
      <p className="text-center text-muted-foreground py-4">
        No expenses this month
      </p>
    ) : (
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            cx="50%"
            cy="50%"
            outerRadius="80%"
            width={350}
            height={250}
            data={pieChartData}
            >
            <PolarGrid />
            <PolarAngleAxis
                dataKey="name"
                tick={{ 
                fill: "#555",
                fontSize: isMobile ? 7 : 13, // safe client-side check
                }}
                tickFormatter={(name) =>
                name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
            }
            />
            <PolarRadiusAxis tick={false} axisLine={false} />
            <Radar
                name="Value"
                dataKey="value"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
            />
            <Tooltip content={<CustomRadarTooltip />} />

            </RadarChart>

        </ResponsiveContainer>
      </div>
    )}
  </CardContent>
</Card>
    </div>
  )
};

export default DashboardOverview;