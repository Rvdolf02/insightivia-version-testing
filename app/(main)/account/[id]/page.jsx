import { getAccountWithTransactions } from '@/actions/accounts';
import { notFound } from 'next/navigation';
import React, { Suspense } from 'react';
import TransactionTable from '../_components/transaction-table';
import { BarLoader } from 'react-spinners';
import AccountChart from '../_components/account-chart';

const AccountsPage = async ({ params }) => {

   const { id } = await params;
   const accountData = await getAccountWithTransactions(id);
  
   if (!accountData) {
    notFound();
   }
   const { transactions, ...account } = accountData;

    return (
        <div className='space-y-8 px-5'>
          <div className='flex gap-4 items-end justify-between'>
            <div>
                <h1 className='text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight gradient-title capitalize leading-tight break-words'>{account.name}</h1>
                <p className='text-muted-foreground'> {account.type.charAt(0) + account.type.slice(1).toLowerCase()} Account</p>
            </div>

            <div className='text-right pb-2'>
                <div className='text-xl sm:text-2xl font-bold'> ₱{parseFloat(account.balance).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className='text-sm text-muted-foreground'>{account._count.transactions} Transactions</p>
            </div>
           </div>
        

            {/* Chart Section */}
              <Suspense
                fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
            >
               <AccountChart transactions={transactions}/>
            </Suspense>

            {/* Transaction Table */}
            <Suspense
                fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
            >
                <TransactionTable transactions={transactions}/>
            </Suspense>
        </div>
    );
  
};

export default AccountsPage;