document.addEventListener('DOMContentLoaded', () => {
    const balanceEl = document.getElementById('balance');
    const incomeEl = document.getElementById('income');
    const expensesEl = document.getElementById('expenses');
    const transactionForm = document.getElementById('transaction-form');
    const transactionsList = document.getElementById('transactions-list');

    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    function saveTransactions() {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }

    function renderTransactions() {
        transactionsList.innerHTML = '';
        let totalIncome = 0;
        let totalExpenses = 0;

        transactions.forEach((transaction, index) => {
            const li = document.createElement('li');
            li.classList.add(transaction.type);
            li.innerHTML = `
                <span>${transaction.description}</span>
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
    }

    function addTransaction(e) {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('amount').value);
        const type = document.getElementById('type').value;
        const description = document.getElementById('description').value;

        if (isNaN(amount) || amount === 0 || type === '' || description === '') {
            alert('Por favor, complete todos los campos.');
            return;
        }

        const newTransaction = {
            id: Date.now(),
            amount: type === 'gasto' ? -amount : amount,
            type,
            description,
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

    transactionForm.addEventListener('submit', addTransaction);
    transactionsList.addEventListener('click', deleteTransaction);

    renderTransactions();
});
