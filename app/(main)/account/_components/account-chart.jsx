"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { endOfDay, endOfMonth, format, startOfDay, startOfMonth, subDays, subMonths } from 'date-fns';
import React, { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { object } from 'zod';

const DATE_RANGES = {
  "7D": { label: "Last 7 Days", type: "days", value: 7 },
  "1M": { label: "Last Month", type: "month", value: 1 },
  "3M": { label: "Last 3 Months", type: "month", value: 3 },
  "6M": { label: "Last 6 Months", type: "month", value: 6 },
  ALL: { label: "All Time", type: "all" },
};


const AccountChart = ({transactions}) => {
    const [dateRange, setDateRange] = useState("1M");

    const filteredData = useMemo(() => {
        const range = DATE_RANGES[dateRange];
        const now = new Date();
        let startDate, endDate;

        if (range.type === "days") {
          // Rolling X days
          startDate = startOfDay(subDays(now, range.value));
          endDate = endOfDay(now);
        } else if (range.type === "month") {
          // Full past X months
          startDate = startOfMonth(subMonths(now, range.value));
          endDate = endOfMonth(subMonths(now, 1));
        } else {
          // All time
          startDate = startOfDay(new Date(0));
          endDate = endOfDay(now);
        }


        // Filter transactions within date range
        const filtered = transactions.filter(
          (t) => new Date(t.date) >= startDate && new Date(t.date) <= endDate
        );


        const grouped = filtered.reduce((acc, transaction) => {
            const date = format(new Date(transaction.date), "MMM dd");

            if (!acc[date]) {
                acc[date] = { date, income: 0, expense: 0 };
            }

            if (transaction.type === "INCOME") {
                acc[date].income += transaction.amount;
            } else {
                acc[date].expense += transaction.amount;
            }

            return acc;
        }, {});

        return Object.values(grouped).sort(
            (a, b) => new Date(a.date) - new Date(b.date)
        );
    }, [transactions, dateRange]);

    const totals = useMemo(() => {
        return filteredData.reduce(
            (acc, day) => ({
                income: acc.income + day.income,
                expense: acc.expense + day.expense,
            }),
            { income: 0, expense: 0}
        );
    }, [filteredData]);

 return (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
      <CardTitle className="text base font-normal">Transaction Overview</CardTitle>
      <Select defaultValue={dateRange} onValueChange={setDateRange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(DATE_RANGES).map(([key, { label }]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </CardHeader>

    <CardContent>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 mb-6">
  <div className="text-center py-1">
    <p className="text-xs sm:text-sm text-muted-foreground font-medium mb-2">
      Total Income
    </p>
    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-500">
      ₱{totals.income.toLocaleString(undefined, { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}
    </p>
  </div>
  
  <div className="text-center py-1">
    <p className="text-xs sm:text-sm text-muted-foreground font-medium mb-2">
      Total Expenses
    </p>
    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-red-500">
      ₱{totals.expense.toLocaleString(undefined, { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}
    </p>
  </div>
  
  <div className="text-center py-1">
    <p className="text-xs sm:text-sm text-muted-foreground font-medium mb-2">
      Net Balance
    </p>
    <p className={`text-lg sm:text-xl lg:text-2xl font-bold ${
      totals.income - totals.expense >= 0 ? "text-green-500" : "text-red-500"
    }`}>
      ₱{(totals.income - totals.expense).toLocaleString(undefined, { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}
    </p>
  </div>
</div>

      <div className="h-[300px]">
  <ResponsiveContainer width="100%" height="100%">
    <LineChart
      data={filteredData}
      margin={{
        top: 10,
        right: 10,
        left: 10,
        bottom: 0,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" vertical={false} />
      <XAxis dataKey="date" />
      <YAxis
        fontSize={12}
        tickLine={false}
        axisLine={false}
        tickFormatter={(value) =>
          `₱${value.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`
        }
      />
      <Tooltip
        formatter={(value) =>
          `₱${parseFloat(value).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`
        }
      />
      <Legend />
      <Line
        type="monotone"
        dataKey="income"
        name="Income"
        stroke="#22c55e"
        strokeWidth={3}
        dot={{ r: 4 }}
        activeDot={{ r: 6 }}
      />
      <Line
        type="monotone"
        dataKey="expense"
        name="Expense"
        stroke="#ef4444"
        strokeWidth={3}
        dot={{ r: 4 }}
        activeDot={{ r: 6 }}
      />
    </LineChart>
  </ResponsiveContainer>
</div>
{/* Backup copy
    <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={filteredData}
            margin={{
              top: 10,
              right: 10,
              left: 10,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date"/>
            <YAxis
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                `₱${value.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              }
            />
            <Tooltip
              formatter={(value) =>
                `₱${parseFloat(value).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              }
            />
            <Legend />
            <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
*/}
    </CardContent>
  </Card>
);

}

export default AccountChart;