import { useState } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { parseEther } from 'viem';
import { abi as ExpenseTrackerABI } from '../utils/abi';

const CONTRACT_ADDRESS = '0xYOUR_CONTRACT_ADDRESS';

export default function Home() {
  const { address } = useAccount();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');


  const { writeContract } = useWriteContract()

  const { data: expenses } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ExpenseTrackerABI,
    functionName: 'getUserExpenses',
    account: address,
  });

  const { data: tags } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ExpenseTrackerABI,
    functionName: 'getUserTags',
    account: address,
  });

  const handleAddExpense = () => {
    if (!description || !amount || selectedTags.length === 0) return;
    
    writeContract({
        abi: ExpenseTrackerABI,
        address: CONTRACT_ADDRESS, // `address` is valid in `useWriteContract`
        functionName: 'addExpense',
        args: [description, parseEther(amount), selectedTags],
    })
  };

  const handleCreateTag = () => {
    if (!newTag) return;
    
    writeContract({
        abi: ExpenseTrackerABI,
        address: CONTRACT_ADDRESS,
        functionName: 'createTag',
        args: [description, parseEther(amount), selectedTags],
    });
  };

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-3xl font-bold mb-8'>Expense Tracker</h1>
      
      {/* Add Tag Section */}
      <div className='mb-8'>
        <h2 className='text-xl font-semibold mb-4'>Create New Tag</h2>
        <div className='flex gap-4'>
          <input
            type='text'
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className='border p-2 rounded'
            placeholder='Tag name'
          />
          <button
            onClick={handleCreateTag}
            className='bg-blue-500 text-white px-4 py-2 rounded'
          >
            Create Tag
          </button>
        </div>
      </div>

      {/* Add Expense Section */}
      <div className='mb-8'>
        <h2 className='text-xl font-semibold mb-4'>Add New Expense</h2>
        <div className='flex flex-col gap-4'>
          <input
            type='text'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className='border p-2 rounded'
            placeholder='Description'
          />
          <input
            type='number'
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className='border p-2 rounded'
            placeholder='Amount (ETH)'
          />
          <select
            multiple
            value={selectedTags}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions, option => option.value);
              setSelectedTags(values);
            }}
            className='border p-2 rounded'
          >
            {(tags as any)?.map((tag: string) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddExpense}
            className='bg-green-500 text-white px-4 py-2 rounded'
          >
            Add Expense
          </button>
        </div>
      </div>

      {/* Expenses List */}
      <div>
        <h2 className='text-xl font-semibold mb-4'>Your Expenses</h2>
        <div className='grid gap-4'>
          {(expenses as any)?.map((expense: any) => (
            <div key={expense.id} className='border p-4 rounded'>
              <p className='font-semibold'>{expense.description}</p>
              <p>{parseFloat(expense.amount) / 1e18} ETH</p>
              <div className='flex gap-2'>
                {expense.tags.map((tag: string) => (
                  <span key={tag} className='bg-gray-200 px-2 py-1 rounded text-sm'>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}