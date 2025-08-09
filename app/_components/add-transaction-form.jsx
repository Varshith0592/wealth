"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { transactionSchema } from "../lib/schema"
import useFetch from "@/hooks/usefetch"
import { createTransaction, updateTransaction } from "@/actions/transaction"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import CreateAccountDrawer from "@/components/create-account-drawer"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Loader2, ScanQrCode } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Switch } from "@/components/ui/switch"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect } from "react"
import { toast } from "sonner"
import ReceiptScanner from "./receipt-scanner"


const AddTransactionForm = ({ accounts, categories, editMode = false, initialData = null }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId=searchParams.get("edit")


  const { register, setValue, handleSubmit, formState: { errors }, watch, getValues, reset } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: editMode && initialData ? {
      type: initialData.type,
      amount: initialData.amount.toString(),
      description: initialData.description,
      accountId: initialData.accountId,
      category: initialData.category,
      date: new Date(initialData.date),
      isRecurring: initialData.isRecurring,
      ...(initialData.recurringInterval && {
        recurringInterval: initialData.recurringInterval
      })

    } : {
      type: "EXPENSE",
      amount: "",
      description: "",
      accountId: accounts.find((ac) => ac.isDefault)?.id,
      date: new Date(),
      isRecurring: false,
    }
  })

  const type = watch("type")
  const isRecurring = watch("isRecurring")
  const date = watch("date")

  const {
    loading: transactionLoading,
    fn: transactionFn,
    data: transactionResult,
  } = useFetch(editMode ? updateTransaction : createTransaction)

  const onSubmit = async (data) => {
    const formData = {
      ...data,
      amount: parseFloat(data.amount)
    }
    if(editMode)
      transactionFn(editId,formData)
    else
      transactionFn(formData)
  }

  const handleScanComplete = useCallback((scannedData) => {
    if (scannedData) {
      setValue("amount", scannedData.amount.toString())
      setValue("date", new Date(scannedData.date))
      if (scannedData.description) {
        setValue("description", scannedData.description)
      }

      if (scannedData.category) {
        setValue("category", scannedData.category)
      }
    }
  }, [setValue])

  useEffect(() => {
    if (transactionResult?.success && !transactionLoading) {
      toast.success(
        editMode?
        "Transaction updated successfully":
        "Transaction created successfully"
      )
      reset()
      router.push(`/account/${transactionResult.data.accountId}`)
    }

  }, [transactionResult, transactionLoading,editMode])




  const filteredCategories = categories.filter((category) => category.type === type)

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      {/* AI Receipt Scanner */}
      {!editMode && <ReceiptScanner onScanComplete={handleScanComplete} />}

      <div className="space-y-2">
        <label className="text-sm font-medium">Type</label>
        <Select
          onValueChange={(value) => setValue("type", value)}
          defaultValue={type}
        >
          <SelectTrigger className={"w-full"}>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EXPENSE">Expense</SelectItem>
            <SelectItem value="INCOME">Income</SelectItem>
          </SelectContent>
        </Select>

        {
          errors.type && (
            <div className="text-red-500 text-sm">{errors.type.message}</div>
          )
        }
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount</label>
          <Input
            type={"number"}
            placeholder="0"
            step="1"
            {...register("amount")}
          />

          {
            errors.amount && (
              <div className="text-red-500 text-sm">{errors.amount.message}</div>
            )
          }
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Account</label>
          <Select
            onValueChange={(value) => setValue("accountId", value)}
          >
            <SelectTrigger className={"w-full"}>
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {
                accounts.map((account) => {
                  return <SelectItem key={account.id} value={account.id}>{account.name} (Rs.{parseFloat(account.balance).toFixed(2)})</SelectItem>
                })
              }
              <CreateAccountDrawer
              >
                <Button
                  variant={"ghost"}
                  className={"w-full select-none items-center text-sm outline-none"}
                >
                  Create Account

                </Button>
              </CreateAccountDrawer>
            </SelectContent>
          </Select>

          {
            errors.accountId && (
              <div className="text-red-500 text-sm">{errors.accountId.message}</div>
            )
          }
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <Select
          onValueChange={(value) => setValue("category", value)}
          defaultValue={getValues("category")}
        >
          <SelectTrigger className={"w-full"}>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {
              filteredCategories.map((category) => {
                return <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
              })
            }
          </SelectContent>
        </Select>

        {
          errors.category && (
            <div className="text-red-500 text-sm">{errors.category.message}</div>
          )
        }
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Date</label>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant={"outline"} className={"w-full pl-3 text-left font-normal"}>
              {date ? format(date, "PPP") : <span>Pick a date</span>}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className={"w-auto p-0"} align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => setValue("date", date)}
              disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {
          errors.date && (
            <div className="text-red-500 text-sm">{errors.date.message}</div>
          )
        }
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Input placeholder="Enter description" {...register("description")} />
        {
          errors.description && (
            <div className="text-red-500 text-sm">{errors.description.message}</div>
          )
        }
      </div>

      <div className="">
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="">
            <label className='text-sm font-medium cursor-pointer'>Recurring Transaction</label>
            <p className="text-sm text-muted-foreground">
              Set up a recurring schedule for this transaction
            </p>
          </div>
          <Switch
            onCheckedChange={(checked) => setValue("isRecurring", checked)}
            checked={isRecurring}
          />
          {
            isRecurring && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Recurring Interval</label>
                <Select
                  onValueChange={(value) => setValue("recurringInterval", value)}
                  defaultValue={getValues("recurringInterval")}
                >
                  <SelectTrigger className={"w-full"}>
                    <SelectValue placeholder="Select Interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={"DAILY"}>Daily</SelectItem>
                    <SelectItem value={"WEEKLY"}>Weekly</SelectItem>
                    <SelectItem value={"MONTHLY"}>Monthly</SelectItem>
                    <SelectItem value={"YEARLY"}>Yearly</SelectItem>
                  </SelectContent>
                </Select>

                {
                  errors.recurringInterval && (
                    <div className="text-red-500 text-sm">{errors.recurringInterval.message}</div>
                  )
                }
              </div>
            )
          }
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" className={"flex-1"} disabled={transactionLoading}>
          {
            transactionLoading?(
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                {editMode?"Updating...":"Creating..."}
              </>
            ):editMode?(
              "Update Transaction"):(
              "Create Transaction"
            )
            
          }
        </Button>
        <Button type="button" variant={"outline"} className={"flex-1"} onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

export default AddTransactionForm