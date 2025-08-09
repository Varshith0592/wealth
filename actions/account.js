"use server"

import { db } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"



const serializeTransaction = (obj) => {
    const serialized = { ...obj }
    if (obj.balance) {
        serialized.balance = obj.balance.toNumber()
    }

    if (obj.amount) {
        serialized.amount = obj.amount.toNumber()
    }

    return serialized
}

export async function updateDefaultAccount(accountId) {
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

        await db.account.updateMany({
            where: {
                userId: user.id,
                isDefault: true
            },
            data: { isDefault: false }
        })

        const account = await db.account.update({
            where: {
                id: accountId, userId: user.id
            },
            data: { isDefault: true }
        })

        revalidatePath("/dashboard")

        return {
            success: true,
            account: serializeTransaction(account),
        }

    } catch (error) {
        return {
            success: false,
            error: error.message
        }
    }
}

export async function getAccountWithTransactions(accountId) {
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

        const account = await db.account.findUnique({
            where: {
                id: accountId,
                userId: user.id
            },
            include: {
                transactions: {
                    orderBy: { date: "desc" }
                },
                _count: {
                    select: {
                        transactions: true
                    }
                }
            }
        })


        if (!account)
            return null;

        return {
            ...serializeTransaction(account),
            transactions: account.transactions.map(serializeTransaction),
        }


    } catch (error) {
        console.error(error)
        return {
            error: error.message
        }

    }
}

export async function bulkDeleteTransactions(transactionIds) {
    try {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) {
            throw new Error("Unauthorized: You must be logged in.");
        }

        const user = await db.user.findUnique({
            where: { clerkUserId },
        });

        if (!user) {
            throw new Error("User not found.");
        }

        const transactions = await db.transaction.findMany({
            where: {
                id: { in: transactionIds },
                userId: user.id,
            },
        });

        if (transactions.length !== transactionIds.length) {
            throw new Error("One or more transactions were not found or you do not have permission to delete them.");
        }

        const accountBalanceChanges = transactions.reduce((acc, transaction) => {
            const amount = parseFloat(transaction.amount);
            const change = transaction.type === "EXPENSE" ? amount : -amount;
            acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
            return acc;
        }, {});

        await db.$transaction(async (tx) => {
            await tx.transaction.deleteMany({
                where: {
                    id: { in: transactionIds },
                    userId: user.id,
                },
            });

            for (const [accountId, balanceChange] of Object.entries(accountBalanceChanges)) {
                await tx.account.update({
                    where: { id: accountId, userId: user.id },
                    data: {
                        balance: {
                            increment: balanceChange,
                        },
                    },
                });
            }
        });

        revalidatePath("/dashboard");
        revalidatePath("/transactions");

        for (const accountId of Object.keys(accountBalanceChanges)) {
            revalidatePath(`/account/${accountId}`);
        }

        return { success: true };

    } catch (error) {
        return {
            success: false,
            error: error.message || "An unexpected error occurred.",
        };
    }
}


