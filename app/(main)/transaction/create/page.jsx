import { getUserAccounts } from '@/actions/dashboard';
import React from 'react';
import AddTransactionForm from '../_components/transaction-form';
import { defaultCategories } from '@/data/categories';
import { getTransaction } from '@/actions/transaction';
import { getUserGoals } from '@/actions/goal';

const AddTransactionPage = async ({ searchParams }) => {
    const accounts = await getUserAccounts();
    const goals = await getUserGoals();
    const params = await searchParams;
    const editId = params?.edit;
    
    let initialData = null;
    if (editId) {
        const transaction = await getTransaction(editId);
        initialData = transaction;
    }

  return (
    <div className='max-w-3xl mx-auto px-5'>
        <h1 className='text-4xl sm:text-6xl gradient-title mb-5'>{editId ? "Edit" : "Add"} Transaction</h1>

         <AddTransactionForm
            accounts={accounts}
            categories={defaultCategories}
            editMode={!!editId}
            initialData={initialData}
            goals={goals}
        />
       
    </div>
  );
};

export default AddTransactionPage;