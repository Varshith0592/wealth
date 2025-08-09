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

export async function createAccount(data) {
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
        //Convert balance to float before saving
        const balanceFloat = parseFloat(data.balance)
        if (isNaN(balanceFloat)) {
            throw new Error("Invalid balance")
        }
        //Check if this is the user's first account
        const existingAccounts = await db.account.findMany({
            where: {
                userId: user.id
            }
        })

        const shouldBeDefault = existingAccounts.length === 0 ? true : data.isDefault

        if (shouldBeDefault) {
            await db.account.updateMany({
                where: { userId: user.id, isDefault: true },
                data: { isDefault: false }
            })
        }

        const account = await db.account.create({
            data: {
                ...data,
                balance: balanceFloat,
                userId: user.id,
                isDefault: shouldBeDefault
            }
        })

        const serializedAccount = serializeTransaction(account)

        revalidatePath("/dashboard")

        return {
            success: true,
            data: serializedAccount
        }


    } catch (error) {
        throw new Error(error.message)
    }
}

export async function getUserAccounts() {
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

    const accounts = await db.account.findMany({
        where: {
            userId: user.id
        },
        orderBy: {
            createdAt: "desc"
        },
        include: {
            _count: {
                select: {
                    transactions: true
                }
            }
        }
    })

    const serializedAccounts = accounts.map((account) => serializeTransaction(account))

    return serializedAccounts
}

export async function deleteAccount(accountId) {
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

        const deleteAcc = await db.account.delete({
            where: {
                id: accountId
            }
        })

        revalidatePath("/dashboard")
        revalidatePath(`/account/${accountId}`)
        return { success: true }

    } catch (error) {
        console.log("Error deleting account:", error)
        return {
            success: false,
            error: error.message || "An unexpected error occurred.",
        };
    }
}

export async function getDashboardData() {
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

        const transactions=await db.transaction.findMany({
            where:{
                userId:user.id
            },
            orderBy:{
                date:"desc"
            }
        })

        return transactions.map(serializeTransaction)



    } catch (error) {

    }
}

