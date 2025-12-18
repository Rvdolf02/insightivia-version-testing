"use server";
import { aj, ajTips, ajSpendsense } from "@/lib/arcjet";
import { db } from "@/lib/prisma";
import { request } from "@arcjet/next";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const serializeAmount = (obj) => ({
    ...obj,
    amount: obj.amount.toNumber(),
});

export async function createTransaction(data) {
    try {
        const { userId } = await auth();   
        if (!userId) throw new Error("Unauthorized");
    
        // Arcjet to add rate limiting (arcjet.js)
        const req = await request();

        // Check rate limit
        const decision = await aj.protect(req, {
            userId,
            requested: 1, // Specify how many tokens to consume
        });

        if (decision.isDenied()){
            if (decision.reason.isRateLimit()) {
                const { remaining, reset } = decision.reason;
                console.error({
                    code: "RATE_LIMIT_EXCEEDED",
                    details: {
                        remaining,
                        resetInSeconds: reset,
                    },
                });

                throw new Error("Too many requests. Please try again later.");
            }

            throw new Error("Request Blocked");
        }

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });
    
        if (!user) {
            throw new Error("User not found");
        }

        const account = await db.account.findUnique({
            where: {
                id: data.accountId,
                userId: user.id,
            },
        });

        if (!account) {
            throw new Error("Account not found");
        }

        
    const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;
    const newBalance = Number(account.balance) + balanceChange;

    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          type: data.type,
          amount: data.amount,
          description: data.description,
          date: data.date,
          accountId: data.accountId,
          category: data.category,
          isRecurring: data.isRecurring,
          userId: user.id,
          goalId: data.goalId || null,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: newBalance },
      });

      if (data.type === "INCOME" && data.goalId) {
        await tx.goal.update({
          where: { id: data.goalId },
          data: { currentAmount: { increment: data.amount } },
        });
      }

      return newTransaction;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${transaction.accountId}`);

        return { success: true, data: serializeAmount(transaction) };
        
    } catch (error) {
        console.error("Transaction creation failed:", error); 
        return { success: false, error: error.message };
    }
};

// Helper function to calculate next recurring date
function calculateNextRecurringDate(startDate, interval) {
    const date = new Date(startDate);

    switch (interval) {
        case "DAILY":
            date.setDate(date.getDate() + 1);
            break;
        case "WEEKLY":
            date.setDate(date.getDate() + 7);
            break;
        case "MONTHLY":
            date.setMonth(date.getMonth() + 1);
            break;
        case "YEARLY":
            date.setFullYear(date.getFullYear() + 1);
            break;
    }
    
    return date;
}

export async function scanReceipt(file) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Convert file to array buffer
        const arrayBuffer = await file.arrayBuffer();
        const base64String = Buffer.from(arrayBuffer).toString("base64");

        const prompt = `Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number)
      - Date (in ISO format)
      - Description or items purchased (brief summary)
      - Merchant/store name
      - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal care,travel,insurance,gifts,bills,other-expense )
      
      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      If its not a recipt, return an empty object`;

        const result = await model.generateContent([
            {
                inlineData: {
                    data: base64String,
                    mimeType: file.type,
                },
            },
            prompt,
        ]);

        const response = await result.response;
        const text = response.text();
        const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

        try {
            const data = JSON.parse(cleanedText);
            return {
                amount: parseFloat(data.amount),
                date: new Date(data.date),
                description: data.description,
                category: data.category,
                merchantName: data.merchantName,
            };
        } catch (parseError) {
            console.error("Error parsing JSON reponse:", parseError);
            throw new Error("Invalid response format from Gemini");
        }
    } catch (error) {
        console.error("Error scanning receipt:", error.message);
        throw new Error("Failed to scan receipt");
    }
}

export async function getTransaction(id) {
        const { userId } = await auth();   
        if (!userId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!user) {
            throw new Error("User not found");
        }

        const transaction = await db.transaction.findUnique({
            where: {
                id,
                userId: user.id,
            },
        });

        if (!transaction) throw new Error("Transaction not found");
        return serializeAmount(transaction);
}

export async function updateTransaction(id, data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Get original transaction
    const originalTransaction = await db.transaction.findUnique({
      where: {
        id,
        userId: user.id,
      },
      include: {
        account: true,
      },
    });

    if (!originalTransaction) throw new Error("Transaction not found");

    // --- BALANCE CHANGE ---
    const oldBalanceChange =
      originalTransaction.type === "EXPENSE"
        ? -originalTransaction.amount.toNumber()
        : originalTransaction.amount.toNumber();

    const newBalanceChange =
      data.type === "EXPENSE" ? -data.amount : data.amount;

    const netBalanceChange = newBalanceChange - oldBalanceChange;

    const transaction = await db.$transaction(async (tx) => {
      // Update transaction
      const updated = await tx.transaction.update({
        where: {
          id,
          userId: user.id,
        },
        data: {
          type: data.type,
          amount: data.amount,
          description: data.description,
          date: data.date,
          account: { connect: { id: data.accountId } },
          category: data.category,
          isRecurring: data.isRecurring,
          goal: data.goalId
            ? { connect: { id: data.goalId } }
            : { disconnect: true },


          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      // --- ACCOUNT BALANCE UPDATE ---
      await tx.account.update({
        where: { id: data.accountId },
        data: {
          balance: {
            increment: netBalanceChange,
          },
        },
      });

      // --- GOAL ADJUSTMENT ---
      if (originalTransaction.type === "INCOME" || data.type === "INCOME") {
        // CASE 1: Same goal → adjust by difference
        if (
          originalTransaction.goalId &&
          data.goalId &&
          originalTransaction.goalId === data.goalId
        ) {
          const diff = data.amount - originalTransaction.amount.toNumber();
          if (diff !== 0) {
            await tx.goal.update({
              where: { id: data.goalId },
              data: {
                currentAmount: { increment: diff },
              },
            });
          }
        }
        // CASE 2: Goal changed → revert old, apply new
        else if (
          originalTransaction.goalId &&
          data.goalId &&
          originalTransaction.goalId !== data.goalId
        ) {
          await tx.goal.update({
            where: { id: originalTransaction.goalId },
            data: {
              currentAmount: {
                decrement: originalTransaction.amount.toNumber(),
              },
            },
          });

          await tx.goal.update({
            where: { id: data.goalId },
            data: {
              currentAmount: { increment: data.amount },
            },
          });
        }
        // CASE 3: Was no goal → now has goal
        else if (!originalTransaction.goalId && data.goalId) {
          await tx.goal.update({
            where: { id: data.goalId },
            data: {
              currentAmount: { increment: data.amount },
            },
          });
        }
        // CASE 4: Had goal → now unlinked
        else if (originalTransaction.goalId && !data.goalId) {
          await tx.goal.update({
            where: { id: originalTransaction.goalId },
            data: {
              currentAmount: {
                decrement: originalTransaction.amount.toNumber(),
              },
            },
          });
        }
      }

      return updated;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${data.accountId}`);

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    throw new Error(error.message);
  }
}

