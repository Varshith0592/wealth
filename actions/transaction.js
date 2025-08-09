"use server"

import { aj } from "@/lib/arcjet";
import { db } from "@/lib/prisma"
import { request } from "@arcjet/next";
import { auth } from "@clerk/nextjs/server"
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const serializeAmount = (obj) => ({
    ...obj,
    amount: obj.amount.toNumber(),
});

export async function createTransaction(data) {
    try {
        const { userId } = await auth()
        if (!userId)
            throw new Error("Unauthorized")
        //Rate limiting
        const req = await request()
        const decision = await aj.protect(req, {
            userId,
            requested: 1
        })

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                const { remaining, reset } = decision.reason
                console.error({
                    code: "Rate Limit Exceeded",
                    details: {
                        remaining,
                        resetInSeconds: reset
                    }
                })

                throw new Error("Too many requests. Please try again later.")
            }
            throw new Error("Request Blocked")
        }
        const user = await db.user.findUnique({
            where: {
                clerkUserId: userId
            }
        })
        if (!user) {
            throw new Error("User not found")
        }



        const account = await db.account.findUnique({
            where: {
                id: data.accountId,
                userId: user.id
            }
        })
        if (!account) {
            throw new Error("Account not found")
        }

        const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;
        const newBalance = account.balance.toNumber() + balanceChange

        const transaction = await db.$transaction(async (tx) => {
            const newTransaction = await tx.transaction.create({
                data: {
                    ...data,
                    userId: user.id,
                    nextRecurringDate: data.isRecurring && data.recurringInterval ? calculateNextRecurringDate(data.date, data.recurringInterval) : null,
                }
            })

            await tx.account.update({
                where: { id: data.accountId },
                data: { balance: newBalance }
            })
            return newTransaction;
        })

        revalidatePath("/dashboard")
        revalidatePath(`/account/${transaction.accountId}`)

        return {
            success: true,
            data: serializeAmount(transaction)
        }
    } catch (error) {
        throw new Error(error.message)
    }

}

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
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" })

        const arrayBuffer = await file.arrayBuffer()

        const base64String = Buffer.from(arrayBuffer).toString("base64")

        const prompt = `
            Analyze this receipt image and extract the following information in JSON format:
            - Total amount (just the number)
            - Date (in ISO format)
            - Description or items purchased (brief summary)
            - Merchant/store name
            - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )
            
            Only respond with valid JSON in this exact format:
            {
                "amount": number,
                "date": "ISO date string",
                "description": "string",
                "merchantName": "string",
                "category": "string"
            }

            If its not a recipt, return an empty object
        `;

        const result = await model.generateContent([
            {
                inlineData: {
                    data: base64String,
                    mimeType: file.type
                },

            },
            prompt
        ])

        const response = await result.response
        const text = response.text()
        const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim()
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
            console.error("Error parsing JSON response:", parseError);
            throw new Error("Invalid response format from Gemini");
        }

    } catch (error) {
        console.error("Error processing receipt:", error.message);
        throw new Error("Failed to scan receipt")

    }

}

export async function getTransaction(id) {
    try {
        const { userId } = await auth()
        if (!userId)
            throw new Error("Unauthorized")
        const user = await db.user.findUnique({
            where: {
                clerkUserId: userId
            }
        })
        if (!user) {
            throw new Error("User not found")
        }

        const transaction = await db.transaction.findUnique({
            where: {
                id,
                userId: user.id
            }
        })

        if (!transaction)
            throw new Error("Transaction not found")

        return serializeAmount(transaction)

    } catch (error) {
        console.error("Error getting transaction:", error.message);
        throw new Error("Failed to get transaction");
    }
}

export async function updateTransaction(id, data) {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where: { clerkUserId: userId }
        });
        if (!user) throw new Error("User not found");

        const originalTransaction = await db.transaction.findUnique({
            where: { id, userId: user.id },
            include: { account: true }
        });

        if (!originalTransaction) throw new Error("Transaction not found");

        // Old balance change from original transaction
        const oldBalanceChange =
            originalTransaction.type === "EXPENSE"
                ? -originalTransaction.amount.toNumber()
                : originalTransaction.amount.toNumber();

        // New balance change from updated data
        const newBalanceChange =
            data.type === "EXPENSE" ? -data.amount : data.amount;

        // Start DB transaction
        const transaction = await db.$transaction(async (tx) => {
            // 1️⃣ If account changed, adjust both accounts separately
            if (data.accountId !== originalTransaction.accountId) {
                // Subtract from old account
                await tx.account.update({
                    where: { id: originalTransaction.accountId },
                    data: {
                        balance: {
                            decrement: oldBalanceChange
                        }
                    }
                });

                // Add to new account
                await tx.account.update({
                    where: { id: data.accountId },
                    data: {
                        balance: {
                            increment: newBalanceChange
                        }
                    }
                });
            } else {
                // 2️⃣ If same account, just adjust the net difference
                const netBalanceChange = newBalanceChange - oldBalanceChange;
                await tx.account.update({
                    where: { id: data.accountId },
                    data: {
                        balance: {
                            increment: netBalanceChange
                        }
                    }
                });
            }

            // 3️⃣ Update transaction
            const updated = await tx.transaction.update({
                where: { id, userId: user.id },
                data: {
                    ...data,
                    nextRecurringDate:
                        data.isRecurring && data.recurringInterval
                            ? calculateNextRecurringDate(
                                data.date,
                                data.recurringInterval
                            )
                            : null
                }
            });

            return updated;
        });

        // Revalidate relevant pages
        revalidatePath("/dashboard");
        revalidatePath(`/account/${data.accountId}`);
        if (data.accountId !== originalTransaction.accountId) {
            revalidatePath(`/account/${originalTransaction.accountId}`);
        }

        return {
            success: true,
            data: serializeAmount(transaction)
        };

    } catch (error) {
        console.error("Error updating transaction:", error);
        throw new Error(error.message || "Failed to update transaction");
    }
}

