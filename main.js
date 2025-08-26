document.addEventListener('DOMContentLoaded', () => {
    const balanceEl = document.getElementById('balance');
    const incomeEl = document.getElementById('income');
    const expensesEl = document.getElementById('expenses');
    const transactionForm = document.getElementById('transaction-form');
    const transactionsList = document.getElementById('transactions-list');
    const budgetForm = document.getElementById('budget-form');
    const budgetsList = document.getElementById('budgets-list');
    const categorySelect = document.getElementById('category');
    const budgetCategorySelect = document.getElementById('budget-category');

    const categories = ['hogar', 'transporte', 'alimentacion', 'entretenimiento', 'servicios', 'salud', 'otros'];

    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    let budgets = JSON.parse(localStorage.getItem('budgets')) || {};

    function populateCategories() {
        categories.forEach(category => {
            const option1 = document.createElement('option');
            option1.value = category;
            option1.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            categorySelect.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = category;
            option2.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            budgetCategorySelect.appendChild(option2);
        });
    }

    function saveTransactions() {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }

    function saveBudgets() {
        localStorage.setItem('budgets', JSON.stringify(budgets));
    }

    function renderTransactions() {
        transactionsList.innerHTML = '';
        let totalIncome = 0;
        let totalExpenses = 0;

        transactions.forEach((transaction, index) => {
            const li = document.createElement('li');
            li.classList.add(transaction.type);
            li.innerHTML = `
                <span>${transaction.description} (${transaction.category})</span>
                <span>${transaction.type === 'ingreso' ? '+' : '-'} $${Math.abs(transaction.amount).toFixed(2)}</span>
                <button class="delete-btn" data-index="${index}">x</button>
            `;
            transactionsList.appendChild(li);

            if (transaction.type === 'ingreso') {
                totalIncome += transaction.amount;
            } else {
                totalExpenses += Math.abs(transaction.amount);
            }
        });

        const totalBalance = totalIncome - totalExpenses;
        balanceEl.textContent = totalBalance.toFixed(2);
        incomeEl.textContent = totalIncome.toFixed(2);
        expensesEl.textContent = totalExpenses.toFixed(2);
        renderBudgets();
    }

    function renderBudgets() {
        budgetsList.innerHTML = '';
        const monthlyExpenses = transactions.filter(t => t.type === 'gasto')
            .reduce((acc, current) => {
                const category = current.category;
                acc[category] = (acc[category] || 0) + Math.abs(current.amount);
                return acc;
            }, {});

        for (const category in budgets) {
            const spent = monthlyExpenses[category] || 0;
            const budgetAmount = budgets[category];
            const progress = (spent / budgetAmount) * 100;

            const div = document.createElement('div');
            div.classList.add('budget-item');
            div.innerHTML = `
                <span>${category.charAt(0).toUpperCase() + category.slice(1)}: $${spent.toFixed(2)} de $${budgetAmount.toFixed(2)}</span>
                <div class="budget-progress">
                    <div class="budget-bar ${progress > 100 ? 'over' : ''}" style="width: ${Math.min(progress, 100)}%;"></div>
                </div>
            `;
            budgetsList.appendChild(div);
        }
    }

    function addTransaction(e) {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('amount').value);
        const type = document.getElementById('type').value;
        const description = document.getElementById('description').value;
        const category = document.getElementById('category').value;

        if (isNaN(amount) || amount <= 0 || type === '' || description === '' || (type === 'gasto' && category === '')) {
            alert('Por favor, complete todos los campos.');
            return;
        }

        const newTransaction = {
            id: Date.now(),
            amount: type === 'gasto' ? -amount : amount,
            type,
            description,
            category: type === 'gasto' ? category : null,
        };

        transactions.push(newTransaction);
        saveTransactions();
        renderTransactions();
        transactionForm.reset();
    }

    function deleteTransaction(e) {
        if (e.target.classList.contains('delete-btn')) {
            const index = e.target.getAttribute('data-index');
            transactions.splice(index, 1);
            saveTransactions();
            renderTransactions();
        }
    }

    function addBudget(e) {
        e.preventDefault();
        const category = document.getElementById('budget-category').value;
        const amount = parseFloat(document.getElementById('budget-amount').value);

        if (category && !isNaN(amount) && amount > 0) {
            budgets[category] = amount;
            saveBudgets();
            renderBudgets();
            budgetForm.reset();
        } else {
            alert('Por favor, selecciona una categoría y un monto válido.');
        }
    }

    // Event listeners
    transactionForm.addEventListener('submit', addTransaction);
    transactionsList.addEventListener('click', deleteTransaction);
    budgetForm.addEventListener('submit', addBudget);

    // Initial render
    populateCategories();
    renderTransactions();
});
