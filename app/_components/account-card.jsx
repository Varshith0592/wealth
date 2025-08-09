"use client"

import { updateDefaultAccount } from "@/actions/account"
import { deleteAccount } from "@/actions/dashboard"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import useFetch from "@/hooks/usefetch"
import { ArrowDownRight, ArrowUpRight, Trash2 } from "lucide-react"
import Link from "next/link"
import React, { useEffect, useState } from 'react'
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const AccountCard = ({ account }) => {
    const { name, type, balance, id, isDefault } = account
    const [confirmOpen, setConfirmOpen] = useState(false)

    const {
        data: updatedAccount,
        error,
        fn: updateDefault,
        loading: updateDefaultLoading
    } = useFetch(updateDefaultAccount)

    const {
        data: deletedAccount,
        error: deleteError,
        fn: removeAccount,
        loading: deleteLoading
    } = useFetch(deleteAccount)

    const handleDefaultChange = async (event) => {
        event.preventDefault()
        if (isDefault) {
            toast.warning("You need at least 1 default account")
            return
        }
        await updateDefault(id)
    }

    const confirmDelete = async () => {
        setConfirmOpen(false)
        toast.promise(
            (async () => {
                await removeAccount(id)
            })(),
            {
                loading: "Deleting account...",
                success: () => "Account deleted successfully",
                error: () => deleteError?.message || "Failed to delete account",
            }
        )
    }

    useEffect(() => {
        if (updatedAccount?.success) {
            toast.success("Default account updated successfully")
        }
    }, [updatedAccount, updateDefaultLoading])

    useEffect(() => {
        if (error) {
            toast.error(error.message || "Failed to update default account")
        }
    }, [error])

    useEffect(() => {
        if (deletedAccount?.success) {
            // Optional: refresh UI here
        }
    }, [deletedAccount])

    return (
        <Card className="hover:shadow-md transition-shadow group relative">
            <div className="flex items-center justify-between p-4 pb-0">
                <Link href={`/account/${id}`} className="flex-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0">
                        <CardTitle className="text-xl font-medium capitalize">
                            {name}
                        </CardTitle>
                    </CardHeader>
                </Link>
                <Switch
                    checked={isDefault}
                    onClick={handleDefaultChange}
                    disabled={updateDefaultLoading}
                    className="cursor-pointer ml-3"
                />

                <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <AlertDialogTrigger asChild>
                        <button
                            disabled={deleteLoading}
                            className="ml-3 text-red-500 hover:text-red-600 transition-colors"
                            title="Delete account"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the
                                <span className="font-semibold"> {name} </span> account and remove its data.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={confirmDelete}
                                className="bg-red-500 hover:bg-red-600"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            <Link href={`/account/${id}`}>
                <CardContent>
                    <div className="text-2xl font-bold">
                        Rs.{parseFloat(balance).toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {type.charAt(0) + type.slice(1).toLowerCase()} Account
                    </p>
                </CardContent>
                <CardFooter className="flex justify-between text-sm text-muted-foreground pt-3">
                    <div className="flex items-center">
                        <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                        Income
                    </div>
                    <div className="flex items-center">
                        <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                        Expense
                    </div>
                </CardFooter>
            </Link>
        </Card>
    )
}

export default AccountCard

