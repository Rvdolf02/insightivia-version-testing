import arcjet, { tokenBucket } from "@arcjet/next";

// This code is for the limiting of adding transaction
export const aj = arcjet({
    key: process.env.ARCJET_KEY,
    characteristics: ["userId"], // Track based on Clerk userId
    rules: [
        tokenBucket({
            mode: "LIVE",
            refillRate: 1000, // Increase based on requirement
            interval: 3600,
            capacity: 1000,   // Increase based on requirement
            
            
            
            
            // SaaS
            // To do: Add condition for the limit based on Subscription: Class1: Perday 15, Class2: Perday 35, Class3: 50 Perday (or possibly unlimited)
            // Retrieve the Subscription type from prisma use accounts.js server
            // Modify the (/actions/transaction.js) add the condition error handling for creation of transaction limiter
        }),
    ],
});

// Create a limiter for daily tips: allow once per day
export const ajTips = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: ["userId"],
  rules: [
    // Daily tips limiter
    tokenBucket({
      mode: "LIVE",
      refillRate: 2,      // 1 request per interval
      interval: 86400,    // every 24 hours (86400 seconds)
      capacity: 2,        // max 1 per day
    }),
  ],
});

// Create a limiter for spendsense: limit the output once per week
export const ajSpendsense = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: ["userId"],
  rules: [
    // Spendsense limiter
    tokenBucket({
      mode: "LIVE",
      refillRate: 9,
       interval: 7 * 24 * 3600, // 7 days
      capacity: 9,
    }),
  ],
})