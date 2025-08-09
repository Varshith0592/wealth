"use client"

import { Checkbox } from "@/components/ui/checkbox"
import {
    Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { categoryColors } from "@/data/categories"
import { format } from "date-fns"
import {
    Tooltip, TooltipContent, TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import {
    ChevronDown, ChevronLeft, ChevronRight, ChevronUp,
    Clock, MoreHorizontal, RefreshCw, Search, Trash, X
} from "lucide-react"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import useFetch from "@/hooks/usefetch"
import { bulkDeleteTransactions } from "@/actions/account"
import { toast } from "sonner"
import { BarLoader } from "react-spinners"

const RECURRING_INTERVALS = {
    "DAILY": "Daily",
    "WEEKLY": "Weekly",
    "MONTHLY": "Monthly",
    "YEARLY": "Yearly",
}

const ITEMS_PER_PAGE = 10

const TransactionTable = ({ transactions }) => {
    const router = useRouter()

    const [selectedIds, setSelectedIds] = useState([])
    const [sortConfig, setSortConfig] = useState({
        field: "date",
        direction: "desc"
    })
    const [currentPage, setCurrentPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState("")
    const [typeFilter, setTypeFilter] = useState("")
    const [recurringFilter, setRecurringFilter] = useState("")

    const {
        loading: deleteLoading,
        fn: deleteFn,
        data: deleted
    } = useFetch(bulkDeleteTransactions)

    // Filter + Sort
    const filteredAndSortedTransactions = useMemo(() => {
        let results = [...transactions]

        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase()
            results = results.filter(t =>
                t.description?.toLowerCase().includes(searchLower)
            )
        }

        if (recurringFilter) {
            results = results.filter(t =>
                recurringFilter === "recurring" ? t.isRecurring : !t.isRecurring
            )
        }

        if (typeFilter) {
            results = results.filter(t => t.type === typeFilter)
        }

        results.sort((a, b) => {
            let comparison = 0
            switch (sortConfig.field) {
                case "date":
                    comparison = new Date(a.date) - new Date(b.date)
                    break
                case "amount":
                    comparison = a.amount - b.amount
                    break
                case "category":
                    comparison = a.category.localeCompare(b.category)
                    break
                default:
                    return 0
            }
            return sortConfig.direction === "asc" ? comparison : -comparison
        })

        return results
    }, [transactions, searchTerm, typeFilter, recurringFilter, sortConfig])

    // Pagination
    const totalPages = Math.ceil(filteredAndSortedTransactions.length / ITEMS_PER_PAGE)
    const paginatedTransactions = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE
        return filteredAndSortedTransactions.slice(start, start + ITEMS_PER_PAGE)
    }, [filteredAndSortedTransactions, currentPage])

    const handleSort = (field) => {
        setSortConfig(current => ({
            field,
            direction:
                current.field === field && current.direction === "asc" ? "desc" : "asc"
        }))
    }

    const handleSelect = (id) => {
        setSelectedIds(current =>
            current.includes(id) ? current.filter(item => item !== id) : [...current, id]
        )
    }

    const handleSelectAll = () => {
        const allIds = paginatedTransactions.map(t => t.id)
        setSelectedIds(current =>
            current.length === allIds.length ? [] : allIds
        )
    }

    const handleBulkDelete = async () => {
        if (!window.confirm(`Delete ${selectedIds.length} transactions?`)) return
        deleteFn(selectedIds)
        setSelectedIds([])
    }

    useEffect(() => {
        if (deleted && !deleteLoading) {
            toast.success("Transactions deleted successfully")
        }
    }, [deleted, deleteLoading])

    const handleClearFilters = () => {
        setSearchTerm("")
        setTypeFilter("")
        setRecurringFilter("")
        setSelectedIds([])
        setCurrentPage(1)
    }

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage)
        setSelectedIds([])
    }

    return (
        <div className="space-y-4">
            {deleteLoading && <BarLoader className="mt-4" width="100%" color="#9333ea" />}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>

                <div className="flex gap-2">
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="INCOME">Income</SelectItem>
                            <SelectItem value="EXPENSE">Expense</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={recurringFilter} onValueChange={setRecurringFilter}>
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="All Transactions" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="recurring">Recurring Only</SelectItem>
                            <SelectItem value="non-recurring">Non-recurring Only</SelectItem>
                        </SelectContent>
                    </Select>

                    {selectedIds.length > 0 && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBulkDelete}
                        >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete Selected ({selectedIds.length})
                        </Button>
                    )}

                    {(searchTerm || typeFilter || recurringFilter) && (
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleClearFilters}
                            title="Clear Filters"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Transactions Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    onCheckedChange={handleSelectAll}
                                    checked={selectedIds.length === paginatedTransactions.length && paginatedTransactions.length > 0}
                                />
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort("date")}>
                                <div className="flex items-center">
                                    Date {sortConfig.field === "date" && (sortConfig.direction === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />)}
                                </div>
                            </TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort("category")}>
                                <div className="flex items-center">
                                    Category {sortConfig.field === "category" && (sortConfig.direction === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />)}
                                </div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort("amount")}>
                                <div className="flex items-center">
                                    Amount {sortConfig.field === "amount" && (sortConfig.direction === "asc" ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />)}
                                </div>
                            </TableHead>
                            <TableHead>Recurring</TableHead>
                            <TableHead className="w-[50px]" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedTransactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground">
                                    No transactions found
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedTransactions.map((transaction) => (
                                <TableRow key={transaction.id}>
                                    <TableCell>
                                        <Checkbox
                                            onCheckedChange={() => handleSelect(transaction.id)}
                                            checked={selectedIds.includes(transaction.id)}
                                        />
                                    </TableCell>
                                    <TableCell>{format(new Date(transaction.date), "PP")}</TableCell>
                                    <TableCell>{transaction.description}</TableCell>
                                    <TableCell className="capitalize">
                                        <span
                                            style={{ background: categoryColors[transaction.category] }}
                                            className="px-2 py-1 rounded-lg text-white text-sm"
                                        >
                                            {transaction.category}
                                        </span>
                                    </TableCell>
                                    <TableCell
                                        className="font-medium"
                                        style={{ color: transaction.type === "EXPENSE" ? "red" : "green" }}
                                    >
                                        {transaction.type === "EXPENSE" ? "-" : "+"}Rs.{transaction.amount.toFixed(2)}
                                    </TableCell>
                                    <TableCell>
                                        {transaction.isRecurring ? (
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Badge variant="outline" className="gap-1 bg-purple-100 text-purple-700 hover:bg-purple-200">
                                                        <RefreshCw className="h-3 w-3" />
                                                        {RECURRING_INTERVALS[transaction.recurringInterval]}
                                                    </Badge>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <div className="text-sm font-medium">Next Date</div>
                                                    <div className="text-sm">
                                                        {format(new Date(transaction.nextRecurringDate), "PP")}
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        ) : (
                                            <Badge variant="outline" className="gap-1">
                                                <Clock className="h-3 w-3" />
                                                One-Time
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => router.push(`/transaction/create?edit=${transaction.id}`)}>
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive" onClick={() => deleteFn([transaction.id])}>
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <div className="flex justify-between items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    )
}

export default TransactionTable
