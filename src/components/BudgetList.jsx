import React, { useState } from 'react'
import { CATEGORIES } from '../data/categories';
import * as XLSX from 'xlsx';

const initialBudgetItems = CATEGORIES.map(item => ({
    name: item.value,
    expenses: []
}));

const BudgetList = () => {

    const [salary, setSalary] = useState(() => {
        const saved = localStorage.getItem('salary');
        return saved ? Number(saved) : 95400;
    });
    const [otherIncome, setOtherIncome] = useState(() => {
        const saved = localStorage.getItem('otherIncome');
        return saved ? Number(saved) : 6000;
    });
    const [budgetItems, setBudgetItems] = useState(() => {
        const saved = localStorage.getItem('budgetItems');
        if (saved) {
            const parsed = JSON.parse(saved);
            return parsed.map(item => ({
                name: item.name,
                expenses: item.expenses ? item.expenses :
                    [{ amount: item.amount || 0, date: new Date().toISOString() }]
            }));
        }
        return initialBudgetItems;
    });
    const [selectedCategory, setSelectedCategory] = useState('Food');
    const [expenseAmount, setExpenseAmount] = useState('');
    const [filterType, setFilterType] = useState('all'); // 'all', 'today', 'week', 'month'



    // Save to local storage whenever budgetItems changes

    React.useEffect(() => {
        localStorage.setItem('budgetItems', JSON.stringify(budgetItems));
    }, [budgetItems]);

    React.useEffect(() => {
        localStorage.setItem('salary', salary);
    }, [salary]);

    React.useEffect(() => {
        localStorage.setItem('otherIncome', otherIncome);
    }, [otherIncome]);

    const handleAddExpense = () => {
        if (!expenseAmount || expenseAmount <= 0) {
            alert('please enter a valid amount');
            return;
        }

        const newExpense = {
            amount: parseFloat(expenseAmount),
            date: new Date().toISOString()
        }

        setBudgetItems((prevItems) => prevItems.map((item) => item.name === selectedCategory ? { ...item, expenses: [...item.expenses,newExpense] } : item));

        setExpenseAmount('');
    }

    const filterByDate = (dateStr) => {
        const expenseDate = new Date(dateStr);
        const today = new Date();

        switch (filterType) {
            case 'today':
                return expenseDate.toDateString() === today.toDateString();
            case '4days':
                const fourDaysAgo = new Date(today.setDate(today.getDate() - 4));
                return expenseDate >= fourDaysAgo && expenseDate <= today;
            case 'week':
                const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
                return expenseDate >= startOfWeek && expenseDate <= today;
            case 'month':
                return expenseDate.getMonth() === today.getMonth() && expenseDate.getFullYear() === today.getFullYear();
            default:
                return true; // show all expenses
        }

    }

    const handleReset = () => {
        if (window.confirm('Are you sure you want to reset the budget?')) { }
        const resetItems = budgetItems.map(item => ({
            ...item,
            amount: 0
        }));
        setBudgetItems(resetItems);
        localStorage.setItem('budgetItems', JSON.stringify(resetItems));
    }

    const totalIncome = salary + otherIncome;
    const filteredItems = budgetItems.map(item => {
        const filteredExpenses = item.expenses.filter(exp => filterByDate(exp.date));
        const total = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        return { name: item.name, total };
    })

    const totalExpense = filteredItems.reduce((acc, item) => acc + item.total, 0);

    const remainingBalance = totalIncome - totalExpense;

    // Added Excel export function

    const handleExport = () =>{ 
        const exportData = budgetItems.flatMap(item => 
        (item.expenses || []).map(exp => {
            const expenseDate = new Date(exp.date);
            return {
                Category: item.name,
                Amount: exp.amount,
                Date: expenseDate.toLocaleDateString(),
                Time: expenseDate.toLocaleTimeString()
            };
        })
    );

const worksheet = XLSX.utils.json_to_sheet(exportData);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenses');

const now =new Date();
const fileName = `CashMentor_Expenses_${now.toLocaleDateString().replace(/\//g, '-')}_${now.getHours()}-${now.getMinutes()}.xlsx`;
XLSX.writeFile(workbook, fileName);

    };



    return (
        <div className='budget-container'>

            {/* Income inputs */}

            <div className="income-inputs">
                <h3>Update Income</h3>
                <label> Salary: <input type="number" value={salary} onChange={(e) => setSalary(Number(e.target.value))}/>
                </label>
                <label>Other Income: <input type="number" value={otherIncome} onChange={(e) => setOtherIncome(Number(e.target.value))}/>
                </label>

            </div>

            <div className='summary'>
                <h2>Total Income: Rs.{totalIncome}</h2>
                <h2>Total Expense: Rs.{totalExpense}</h2>
                <h2>Remaining Balance: Rs.{remainingBalance}</h2>
            </div>

            <div className='reset-btn-container'>
                <button className='reset-btn' onClick={handleReset}>Reset Budget</button>
            </div>

            <div className='export-btn-container'>
                <button className='export-btn' onClick={handleExport}>Export to Excel</button>
            </div>

            <div className='add-expense-form'>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                    {CATEGORIES.map((item, index) => (
                        <option key={index} value={item.value}>
                            {item.label}
                        </option>

                    ))}
                </select>

                <input type='number' placeholder='Enter Amount' value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} min="0" />

                <button onClick={handleAddExpense}>Add Expense</button>

                <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                    <option value="all">All</option>
                    <option value="today">Today</option>
                    <option value="4days">Last 4 Days</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>

                </select>

            </div>

            <div className='budget-list'>
                {filteredItems.map((item, index) => (
                    <div key={index} className='budget-item'>
                        <h3>{item.name}</h3>
                        <p>Rs.{item.total}</p>
                    </div>
                ))}
            </div>




        </div>
    )
}

export default BudgetList