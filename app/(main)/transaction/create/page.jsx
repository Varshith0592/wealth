import { getUserAccounts } from '@/actions/dashboard'
import { getTransaction } from '@/actions/transaction'
import AddTransactionForm from '@/app/_components/add-transaction-form'
import { defaultCategories } from '@/data/categories'
import React from 'react'

const AddTransactionPage = async ({ searchParams }) => {

    const params=await searchParams
    const accounts = await getUserAccounts()

    const editId = params?.edit

    let initialData = null;

    if (editId) {
        const transaction = await getTransaction(editId)
        initialData = transaction
    }

    return (
        <div className="max-w-3xl mx-auto px-5">
            <h1 className="text-5xl gradient-title mb-8">
                {
                    editId?"Edit Transaction":"Add Transaction"
                }
            </h1>

            <AddTransactionForm
                accounts={accounts}
                categories={defaultCategories}
                initialData={initialData}
                editMode={!!editId}
            />
        </div>
    )
}

export default AddTransactionPage