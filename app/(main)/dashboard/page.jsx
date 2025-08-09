import { getCurrentBudget } from '@/actions/budget'
import { getDashboardData, getUserAccounts } from '@/actions/dashboard'
import AccountCard from '@/app/_components/account-card'
import BudgetProgress from '@/app/_components/budget-progress'
import {DashboardOverview} from '@/app/_components/dashboard-overview'
import CreateAccountDrawer from '@/components/create-account-drawer'
import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import React, { Suspense } from 'react'

const DashboardPage = async () => {

  const accounts = await getUserAccounts()

  let budgetData = await getCurrentBudget()

  const transactions=await getDashboardData()

  return (
    <div className="space-y-8">
      {/* Budget Progress */}

      {

          <BudgetProgress
            initialBudget={budgetData?.budget}
            currentExpenses={budgetData?.currentExpenses || 0}
          />
        
      }

      {/* Overview */}

      <Suspense fallback={"Loading overview..."}>
          <DashboardOverview 
            accounts={accounts}
            transactions={transactions||[]}
          />

      </Suspense>

      {/* Accounts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CreateAccountDrawer>
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed h-full pt-5">
            <CardContent>
              <Plus className='h-10 w-10 mb-2' />
              <p className="text-sm font-medium">Add New Account</p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>
        {
          accounts.length > 0 && accounts.map((account, index) => {
            return <AccountCard key={account.id} account={account} />
          })
        }
      </div>
    </div>
  )
}

export default DashboardPage