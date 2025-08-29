// Variables globales
let movementTypes = [];
let costTypes = [];
let categories = [];
let subcategories = [];
let concepts = [];
let transactions = [];
let payments = [];
let expensesChart = null;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeData();
    loadView('dashboard');
    setupEventListeners();
});

// Inicializar datos desde localStorage
function initializeData() {
    // Cargar datos o inicializar con valores por defecto
    movementTypes = JSON.parse(localStorage.getItem('movementTypes')) || [
        { id: 1, name: 'Ingreso' },
        { id: 2, name: 'Gasto' }
    ];
    
    costTypes = JSON.parse(localStorage.getItem('costTypes')) || [
        { id: 1, name: 'Fijo', movementTypeId: 2 },
        { id: 2, name: 'Variable', movementTypeId: 2 },
        { id: 3, name: 'Salario', movementTypeId: 1 },
        { id: 4, name: 'Extra', movementTypeId: 1 }
    ];
    
    categories = JSON.parse(localStorage.getItem('categories')) || [
        { id: 1, name: 'Vivienda', movementTypeId: 2, costTypeId: 1 },
        { id: 2, name: 'Alimentación', movementTypeId: 2, costTypeId: 2 },
        { id: 3, name: 'Transporte', movementTypeId: 2, costTypeId: 2 },
        { id: 4, name: 'Salario', movementTypeId: 1, costTypeId: 3 },
        { id: 5, name: 'Freelance', movementTypeId: 1, costTypeId: 4 }
    ];
    
    subcategories = JSON.parse(localStorage.getItem('subcategories')) || [
        { id: 1, name: 'Renta', movementTypeId: 2, costTypeId: 1, categoryId: 1 },
        { id: 2, name: 'Servicios', movementTypeId: 2, costTypeId: 1, categoryId: 1 },
        { id: 3, name: 'Supermercado', movementTypeId: 2, costTypeId: 2, categoryId: 2 },
        { id: 4, name: 'Restaurante', movementTypeId: 2, costTypeId: 2, categoryId: 2 },
        { id: 5, name: 'Gasolina', movementTypeId: 2, costTypeId: 2, categoryId: 3 },
        { id: 6, name: 'Mantenimiento', movementTypeId: 2, costTypeId: 2, categoryId: 3 }
    ];
    
    concepts = JSON.parse(localStorage.getItem('concepts')) || [
        { id: 1, name: 'Renta Departamento', movementTypeId: 2, costTypeId: 1, categoryId: 1, subcategoryId: 1 },
        { id: 2, name: 'Luz', movementTypeId: 2, costTypeId: 1, categoryId: 1, subcategoryId: 2 },
        { id: 3, name: 'Agua', movementTypeId: 2, costTypeId: 1, categoryId: 1, subcategoryId: 2 },
        { id: 4, name: 'Despensa Semanal', movementTypeId: 2, costTypeId: 2, categoryId: 2, subcategoryId: 3 },
        { id: 5, name: 'Pago Nómina', movementTypeId: 1, costTypeId: 3, categoryId: 4, subcategoryId: null },
        { id: 6, name: 'Proyecto Cliente', movementTypeId: 1, costTypeId: 4, categoryId: 5, subcategoryId: null }
    ];
    
    transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    payments = JSON.parse(localStorage.getItem('payments')) || [];
    
    // Guardar datos inicializados
    saveAllData();
}

// Guardar todos los datos en localStorage
function saveAllData() {
    localStorage.setItem('movementTypes', JSON.stringify(movementTypes));
    localStorage.setItem('costTypes', JSON.stringify(costTypes));
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('subcategories', JSON.stringify(subcategories));
    localStorage.setItem('concepts', JSON.stringify(concepts));
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('payments', JSON.stringify(payments));
}

// Configurar event listeners
function setupEventListeners() {
    // Formulario de transacción
    document.getElementById('transaction-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveTransaction();
    });
    
    // Cambio en tipo de movimiento
    document.getElementById('transaction-type').addEventListener('change', function() {
        toggleTransactionFields();
        updateCascadingSelects();
    });
    
    // Formularios de base de datos
    document.getElementById('movement-type-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveMovementType();
    });
    
    document.getElementById('cost-type-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveCostType();
    });
    
    document.getElementById('category-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveCategory();
    });
    
    document.getElementById('subcategory-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveSubcategory();
    });
    
    document.getElementById('concept-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveConcept();
    });
    
    // Búsqueda en transacciones
    document.getElementById('transaction-search').addEventListener('input', function() {
        filterTransactions(this.value);
    });
    
    // Selectores en cascada para base de datos
    document.getElementById('cost-type-movement').addEventListener('change', function() {
        updateCostTypeSelect();
    });
    
    document.getElementById('category-movement').addEventListener('change', function() {
        updateCategorySelects();
    });
    
    document.getElementById('subcategory-movement').addEventListener('change', function() {
        updateSubcategorySelects();
    });
    
    document.getElementById('concept-movement').addEventListener('change', function() {
        updateConceptSelects();
    });
}

// Cargar vista
function loadView(viewName) {
    // Ocultar todas las vistas
    document.querySelectorAll('.view-container').forEach(view => {
        view.classList.add('hidden');
    });
    
    // Mostrar la vista seleccionada
    document.getElementById(`${viewName}-view`).classList.remove('hidden');
    
    // Actualizar la vista según sea necesario
    switch(viewName) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'transactions':
            loadTransactionsView();
            break;
        case 'database':
            loadDatabaseView();
            break;
    }
}

// Actualizar dashboard
function updateDashboard() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    // Calcular totales
    const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.period);
        return transactionDate.getMonth() + 1 === currentMonth && 
               transactionDate.getFullYear() === currentYear;
    });
    
    const totalIncomes = monthTransactions
        .filter(t => getMovementTypeName(t.movementTypeId) === 'Ingreso')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
    const totalExpenses = monthTransactions
        .filter(t => getMovementTypeName(t.movementTypeId) === 'Gasto')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
    const availableBalance = totalIncomes - totalExpenses;
    
    const paymentsMade = payments.filter(p => {
        const paymentDate = new Date(p.date);
        return paymentDate.getMonth() + 1 === currentMonth && 
               paymentDate.getFullYear() === currentYear;
    }).length;
    
    // Actualizar UI
    document.getElementById('total-incomes').textContent = `$${totalIncomes.toFixed(2)}`;
    document.getElementById('total-expenses').textContent = `$${totalExpenses.toFixed(2)}`;
    document.getElementById('available-balance').textContent = `$${availableBalance.toFixed(2)}`;
    document.getElementById('payments-made').textContent = paymentsMade;
    
    // Colorear el saldo disponible
    const balanceElement = document.getElementById('available-balance');
    balanceElement.classList.remove('positive-balance', 'negative-balance');
    if (availableBalance >= 0) {
        balanceElement.classList.add('positive-balance');
    } else {
        balanceElement.classList.add('negative-balance');
    }
    
    // Actualizar próximos vencimientos
    updateUpcomingDueTable();
    
    // Actualizar gráfico de gastos
    updateExpensesChart();
}

// Actualizar tabla de próximos vencimientos
function updateUpcomingDueTable() {
    const tableBody = document.getElementById('upcoming-due-table');
    tableBody.innerHTML = '';
    
    // Obtener transacciones con prioridad alta o media
    const highPriorityTransactions = transactions
        .filter(t => t.priority === 'Alta' && getMovementTypeName(t.movementTypeId) === 'Gasto')
        .sort((a, b) => new Date(a.limitDate) - new Date(b.limitDate))
        .slice(0, 5);
        
    highPriorityTransactions.forEach(transaction => {
        const concept = getConceptName(transaction.conceptId);
        const amount = parseFloat(transaction.amount).toFixed(2);
        const limitDate = formatDate(transaction.limitDate);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${concept}</td>
            <td>$${amount}</td>
            <td>${limitDate}</td>
            <td><span class="badge bg-danger">${transaction.priority}</span></td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Actualizar gráfico de gastos
function updateExpensesChart() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    // Filtrar gastos del mes actual
    const monthExpenses = transactions.filter(t => {
        const transactionDate = new Date(t.period);
        return getMovementTypeName(t.movementTypeId) === 'Gasto' &&
               transactionDate.getMonth() + 1 === currentMonth && 
               transactionDate.getFullYear() === currentYear;
    });
    
    // Agrupar por categoría
    const expensesByCategory = {};
    monthExpenses.forEach(expense => {
        const categoryId = getConcept(expense.conceptId).categoryId;
        const categoryName = getCategoryName(categoryId);
        
        if (!expensesByCategory[categoryName]) {
            expensesByCategory[categoryName] = 0;
        }
        
        expensesByCategory[categoryName] += parseFloat(expense.amount);
    });
    
    // Preparar datos para el gráfico
    const labels = Object.keys(expensesByCategory);
    const data = Object.values(expensesByCategory);
    
    // Colores para el gráfico
    const backgroundColors = [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)'
    ];
    
    // Destruir gráfico existente si hay uno
    if (expensesChart) {
        expensesChart.destroy();
    }
    
    // Crear nuevo gráfico
    const ctx = document.getElementById('expenses-chart').getContext('2d');
    expensesChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `$${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Cargar vista de transacciones
function loadTransactionsView() {
    // Cargar selectores
    loadMovementTypesSelect('transaction-type');
    loadCostTypesSelect('transaction-cost-type');
    loadConceptsSelect('transaction-concept');
    loadConceptsSelect('payment-concept');
    
    // Cargar tabla de transacciones
    loadTransactionsTable();
    
    // Establecer fecha actual por defecto
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('transaction-date').value = today;
    document.getElementById('transaction-period').value = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
}

// Alternar campos según tipo de movimiento
function toggleTransactionFields() {
    const movementTypeId = document.getElementById('transaction-type').value;
    const incomeFields = document.getElementById('income-fields');
    const expenseFields = document.getElementById('expense-fields');
    
    if (movementTypeId && getMovementTypeName(movementTypeId) === 'Ingreso') {
        incomeFields.classList.remove('hidden');
        expenseFields.classList.add('hidden');
        
        // Establecer fecha de hoy para ingreso
        document.getElementById('transaction-income-date').value = new Date().toISOString().split('T')[0];
    } else if (movementTypeId && getMovementTypeName(movementTypeId) === 'Gasto') {
        incomeFields.classList.add('hidden');
        expenseFields.classList.remove('hidden');
        
        // Establecer días por defecto para gastos
        document.getElementById('transaction-cut-day').value = '15';
        document.getElementById('transaction-limit-day').value = '5';
    } else {
        incomeFields.classList.add('hidden');
        expenseFields.classList.add('hidden');
    }
}

// Guardar transacción
function saveTransaction() {
    const transactionId = document.getElementById('transaction-id').value;
    const date = document.getElementById('transaction-date').value;
    const movementTypeId = document.getElementById('transaction-type').value;
    const costTypeId = document.getElementById('transaction-cost-type').value;
    const conceptId = document.getElementById('transaction-concept').value;
    const amount = document.getElementById('transaction-amount').value;
    const period = document.getElementById('transaction-period').value;
    const notes = document.getElementById('transaction-notes').value;
    
    // Validaciones básicas
    if (!date || !movementTypeId || !costTypeId || !conceptId || !amount || !period) {
        alert('Por favor, complete todos los campos obligatorios.');
        return;
    }
    
    const movementTypeName = getMovementTypeName(movementTypeId);
    let cutDate = null;
    let limitDate = null;
    let incomeDate = null;
    
    // Calcular fechas según tipo de movimiento
    if (movementTypeName === 'Gasto') {
        const cutDay = parseInt(document.getElementById('transaction-cut-day').value);
        const limitDay = parseInt(document.getElementById('transaction-limit-day').value);
        
        const periodDate = new Date(period);
        const year = periodDate.getFullYear();
        const month = periodDate.getMonth();
        
        // Calcular fecha de corte
        cutDate = new Date(year, month, cutDay);
        
        // Calcular fecha límite (si el día límite es menor que el día de corte, se suma un mes)
        if (limitDay < cutDay) {
            limitDate = new Date(year, month + 1, limitDay);
        } else {
            limitDate = new Date(year, month, limitDay);
        }
    } else if (movementTypeName === 'Ingreso') {
        incomeDate = document.getElementById('transaction-income-date').value;
    }
    
    // Calcular número de plazos y prioridad
    let numberOfTerms = 0;
    let priority = 'Baja';
    
    if (movementTypeName === 'Gasto' && limitDate) {
        numberOfTerms = calculateNumberOfTerms(new Date(), limitDate);
        priority = calculatePriority(numberOfTerms);
    }
    
    // Crear o actualizar transacción
    if (transactionId) {
        // Modo edición
        const index = transactions.findIndex(t => t.id == transactionId);
        if (index !== -1) {
            transactions[index] = {
                ...transactions[index],
                date,
                movementTypeId,
                costTypeId,
                conceptId,
                amount,
                period,
                cutDate: cutDate ? cutDate.toISOString() : null,
                limitDate: limitDate ? limitDate.toISOString() : null,
                incomeDate,
                notes,
                numberOfTerms,
                priority
            };
        }
    } else {
        // Modo nuevo
        const newTransaction = {
            id: generateId(transactions),
            date,
            movementTypeId,
            costTypeId,
            conceptId,
            amount,
            period,
            cutDate: cutDate ? cutDate.toISOString() : null,
            limitDate: limitDate ? limitDate.toISOString() : null,
            incomeDate,
            notes,
            numberOfTerms,
            priority,
            status: 'Pendiente'
        };
        
        transactions.push(newTransaction);
    }
    
    // Guardar y actualizar
    saveAllData();
    loadTransactionsTable();
    resetTransactionForm();
    
    alert('Transacción guardada correctamente.');
}

// Calcular número de plazos
function calculateNumberOfTerms(currentDate, limitDate) {
    let terms = 0;
    const current = new Date(currentDate);
    const limit = new Date(limitDate);
    
    // Mientras la fecha actual sea anterior a la fecha límite
    while (current < limit) {
        // Día 15 del mes
        const midMonth = new Date(current.getFullYear(), current.getMonth(), 15);
        if (midMonth <= limit && midMonth >= currentDate) {
            terms++;
        }
        
        // Fin de mes (último día del mes)
        const endOfMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0);
        if (endOfMonth <= limit && endOfMonth >= currentDate) {
            terms++;
        }
        
        // Avanzar al siguiente mes
        current.setMonth(current.getMonth() + 1);
        current.setDate(1);
    }
    
    return terms;
}

// Calcular prioridad
function calculatePriority(numberOfTerms) {
    if (numberOfTerms <= 1) return 'Alta';
    if (numberOfTerms === 2) return 'Media';
    return 'Baja';
}

// Cargar tabla de transacciones
function loadTransactionsTable() {
    const tableBody = document.getElementById('transactions-table');
    tableBody.innerHTML = '';
    
    transactions.forEach(transaction => {
        const movementType = getMovementTypeName(transaction.movementTypeId);
        const costType = getCostTypeName(transaction.costTypeId);
        const concept = getConceptName(transaction.conceptId);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(transaction.date)}</td>
            <td>${movementType}</td>
            <td>${concept}</td>
            <td>$${parseFloat(transaction.amount).toFixed(2)}</td>
            <td>${formatPeriod(transaction.period)}</td>
            <td>${transaction.cutDate ? formatDate(transaction.cutDate) : '-'}</td>
            <td>${transaction.limitDate ? formatDate(transaction.limitDate) : '-'}</td>
            <td>${transaction.status}</td>
            <td><span class="badge ${getPriorityBadgeClass(transaction.priority)}">${transaction.priority}</span></td>
            <td>${transaction.numberOfTerms}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="editTransaction(${transaction.id})">Editar</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteTransaction(${transaction.id})">Eliminar</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Filtrar transacciones
function filterTransactions(searchTerm) {
    const tableBody = document.getElementById('transactions-table');
    const rows = tableBody.getElementsByTagName('tr');
    
    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        let found = false;
        
        for (let j = 0; j < cells.length; j++) {
            if (cells[j].textContent.toLowerCase().includes(searchTerm.toLowerCase())) {
                found = true;
                break;
            }
        }
        
        rows[i].style.display = found ? '' : 'none';
    }
}

// Editar transacción
function editTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;
    
    // Llenar formulario
    document.getElementById('transaction-id').value = transaction.id;
    document.getElementById('transaction-date').value = transaction.date;
    document.getElementById('transaction-type').value = transaction.movementTypeId;
    document.getElementById('transaction-cost-type').value = transaction.costTypeId;
    document.getElementById('transaction-concept').value = transaction.conceptId;
    document.getElementById('transaction-amount').value = transaction.amount;
    document.getElementById('transaction-period').value = transaction.period;
    document.getElementById('transaction-notes').value = transaction.notes || '';
    
    // Mostrar campos según tipo de movimiento
    toggleTransactionFields();
    
    if (getMovementTypeName(transaction.movementTypeId) === 'Ingreso') {
        document.getElementById('transaction-income-date').value = transaction.incomeDate || '';
    } else {
        if (transaction.cutDate) {
            const cutDate = new Date(transaction.cutDate);
            document.getElementById('transaction-cut-day').value = cutDate.getDate();
        }
        
        if (transaction.limitDate) {
            const limitDate = new Date(transaction.limitDate);
            document.getElementById('transaction-limit-day').value = limitDate.getDate();
        }
    }
    
    // Scroll al formulario
    document.getElementById('transaction-form').scrollIntoView();
}

// Eliminar transacción
function deleteTransaction(id) {
    if (confirm('¿Está seguro de que desea eliminar esta transacción?')) {
        transactions = transactions.filter(t => t.id !== id);
        saveAllData();
        loadTransactionsTable();
    }
}

// Reiniciar formulario de transacción
function resetTransactionForm() {
    document.getElementById('transaction-form').reset();
    document.getElementById('transaction-id').value = '';
    document.getElementById('income-fields').classList.add('hidden');
    document.getElementById('expense-fields').classList.add('hidden');
    
    // Establecer valores por defecto
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('transaction-date').value = today;
    document.getElementById('transaction-period').value = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
}

// Guardar pago
function savePayment() {
    const conceptId = document.getElementById('payment-concept').value;
    const amount = document.getElementById('payment-amount').value;
    const date = document.getElementById('payment-date').value;
    
    if (!conceptId || !amount || !date) {
        alert('Por favor, complete todos los campos.');
        return;
    }
    
    const newPayment = {
        id: generateId(payments),
        conceptId: parseInt(conceptId),
        amount: parseFloat(amount),
        date: date
    };
    
    payments.push(newPayment);
    saveAllData();
    
    // Cerrar modal y limpiar formulario
    const paymentModal = bootstrap.Modal.getInstance(document.getElementById('paymentModal'));
    paymentModal.hide();
    document.getElementById('payment-form').reset();
    
    alert('Pago registrado correctamente.');
}

// Cargar vista de base de datos
function loadDatabaseView() {
    // Cargar tablas
    loadMovementTypesTable();
    loadCostTypesTable();
    loadCategoriesTable();
    loadSubcategoriesTable();
    loadConceptsTable();
    
    // Cargar selectores
    loadMovementTypesSelect('cost-type-movement');
    loadMovementTypesSelect('category-movement');
    loadMovementTypesSelect('subcategory-movement');
    loadMovementTypesSelect('concept-movement');
    
    // Actualizar selectores en cascada
    updateCostTypeSelect();
    updateCategorySelects();
    updateSubcategorySelects();
    updateConceptSelects();
}

// Guardar tipo de movimiento
function saveMovementType() {
    const id = document.getElementById('movement-type-id').value;
    const name = document.getElementById('movement-type-name').value;
    
    if (!name) {
        alert('Por favor, ingrese un nombre para el tipo de movimiento.');
        return;
    }
    
    if (id) {
        // Editar
        const index = movementTypes.findIndex(mt => mt.id == id);
        if (index !== -1) {
            movementTypes[index].name = name;
        }
    } else {
        // Nuevo
        movementTypes.push({
            id: generateId(movementTypes),
            name: name
        });
    }
    
    saveAllData();
    loadMovementTypesTable();
    document.getElementById('movement-type-form').reset();
    document.getElementById('movement-type-id').value = '';
}

// Cargar tabla de tipos de movimiento
function loadMovementTypesTable() {
    const tableBody = document.getElementById('movement-type-table');
    tableBody.innerHTML = '';
    
    movementTypes.forEach(movementType => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${movementType.id}</td>
            <td>${movementType.name}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="editMovementType(${movementType.id})">Editar</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteMovementType(${movementType.id})">Eliminar</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Editar tipo de movimiento
function editMovementType(id) {
    const movementType = movementTypes.find(mt => mt.id === id);
    if (!movementType) return;
    
    document.getElementById('movement-type-id').value = movementType.id;
    document.getElementById('movement-type-name').value = movementType.name;
}

// Eliminar tipo de movimiento
function deleteMovementType(id) {
    // Verificar si está siendo usado
    const usedInCostTypes = costTypes.some(ct => ct.movementTypeId === id);
    const usedInCategories = categories.some(c => c.movementTypeId === id);
    const usedInSubcategories = subcategories.some(s => s.movementTypeId === id);
    const usedInConcepts = concepts.some(c => c.movementTypeId === id);
    
    if (usedInCostTypes || usedInCategories || usedInSubcategories || usedInConcepts) {
        alert('No se puede eliminar este tipo de movimiento porque está siendo utilizado en otros registros.');
        return;
    }
    
    if (confirm('¿Está seguro de que desea eliminar este tipo de movimiento?')) {
        movementTypes = movementTypes.filter(mt => mt.id !== id);
        saveAllData();
        loadMovementTypesTable();
    }
}

// Guardar tipo de costo
function saveCostType() {
    const id = document.getElementById('cost-type-id').value;
    const name = document.getElementById('cost-type-name').value;
    const movementTypeId = document.getElementById('cost-type-movement').value;
    
    if (!name || !movementTypeId) {
        alert('Por favor, complete todos los campos.');
        return;
    }
    
    if (id) {
        // Editar
        const index = costTypes.findIndex(ct => ct.id == id);
        if (index !== -1) {
            costTypes[index].name = name;
            costTypes[index].movementTypeId = parseInt(movementTypeId);
        }
    } else {
        // Nuevo
        costTypes.push({
            id: generateId(costTypes),
            name: name,
            movementTypeId: parseInt(movementTypeId)
        });
    }
    
    saveAllData();
    loadCostTypesTable();
    document.getElementById('cost-type-form').reset();
    document.getElementById('cost-type-id').value = '';
}

// Cargar tabla de tipos de costo
function loadCostTypesTable() {
    const tableBody = document.getElementById('cost-type-table');
    tableBody.innerHTML = '';
    
    costTypes.forEach(costType => {
        const movementType = getMovementTypeName(costType.movementTypeId);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${costType.id}</td>
            <td>${costType.name}</td>
            <td>${movementType}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="editCostType(${costType.id})">Editar</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteCostType(${costType.id})">Eliminar</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Editar tipo de costo
function editCostType(id) {
    const costType = costTypes.find(ct => ct.id === id);
    if (!costType) return;
    
    document.getElementById('cost-type-id').value = costType.id;
    document.getElementById('cost-type-name').value = costType.name;
    document.getElementById('cost-type-movement').value = costType.movementTypeId;
}

// Eliminar tipo de costo
function deleteCostType(id) {
    // Verificar si está siendo usado
    const usedInCategories = categories.some(c => c.costTypeId === id);
    const usedInSubcategories = subcategories.some(s => s.costTypeId === id);
    const usedInConcepts = concepts.some(c => c.costTypeId === id);
    
    if (usedInCategories || usedInSubcategories || usedInConcepts) {
        alert('No se puede eliminar este tipo de costo porque está siendo utilizado en otros registros.');
        return;
    }
    
    if (confirm('¿Está seguro de que desea eliminar este tipo de costo?')) {
        costTypes = costTypes.filter(ct => ct.id !== id);
        saveAllData();
        loadCostTypesTable();
    }
}

// Actualizar selector de tipos de costo según tipo de movimiento
function updateCostTypeSelect() {
    const movementTypeId = document.getElementById('cost-type-movement').value;
    const costTypeSelect = document.getElementById('cost-type-name');
    
    // Esta función se implementaría de manera similar a otras funciones de actualización de selectores
    // Por brevedidad, no se ha implementado completamente en este ejemplo
}

// Guardar categoría
function saveCategory() {
    const id = document.getElementById('category-id').value;
    const name = document.getElementById('category-name').value;
    const movementTypeId = document.getElementById('category-movement').value;
    const costTypeId = document.getElementById('category-cost-type').value;
    
    if (!name || !movementTypeId || !costTypeId) {
        alert('Por favor, complete todos los campos.');
        return;
    }
    
    if (id) {
        // Editar
        const index = categories.findIndex(c => c.id == id);
        if (index !== -1) {
            categories[index].name = name;
            categories[index].movementTypeId = parseInt(movementTypeId);
            categories[index].costTypeId = parseInt(costTypeId);
        }
    } else {
        // Nuevo
        categories.push({
            id: generateId(categories),
            name: name,
            movementTypeId: parseInt(movementTypeId),
            costTypeId: parseInt(costTypeId)
        });
    }
    
    saveAllData();
    loadCategoriesTable();
    document.getElementById('category-form').reset();
    document.getElementById('category-id').value = '';
}

// Cargar tabla de categorías
function loadCategoriesTable() {
    const tableBody = document.getElementById('category-table');
    tableBody.innerHTML = '';
    
    categories.forEach(category => {
        const movementType = getMovementTypeName(category.movementTypeId);
        const costType = getCostTypeName(category.costTypeId);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${category.id}</td>
            <td>${category.name}</td>
            <td>${movementType}</td>
            <td>${costType}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="editCategory(${category.id})">Editar</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteCategory(${category.id})">Eliminar</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Editar categoría
function editCategory(id) {
    const category = categories.find(c => c.id === id);
    if (!category) return;
    
    document.getElementById('category-id').value = category.id;
    document.getElementById('category-name').value = category.name;
    document.getElementById('category-movement').value = category.movementTypeId;
    document.getElementById('category-cost-type').value = category.costTypeId;
}

// Eliminar categoría
function deleteCategory(id) {
    // Verificar si está siendo usado
    const usedInSubcategories = subcategories.some(s => s.categoryId === id);
    const usedInConcepts = concepts.some(c => c.categoryId === id);
    
    if (usedInSubcategories || usedInConcepts) {
        alert('No se puede eliminar esta categoría porque está siendo utilizada en otros registros.');
        return;
    }
    
    if (confirm('¿Está seguro de que desea eliminar esta categoría?')) {
        categories = categories.filter(c => c.id !== id);
        saveAllData();
        loadCategoriesTable();
    }
}

// Actualizar selectores de categoría
function updateCategorySelects() {
    const movementTypeId = document.getElementById('category-movement').value;
    const costTypeSelect = document.getElementById('category-cost-type');
    
    // Limpiar y cargar tipos de costo según el tipo de movimiento
    costTypeSelect.innerHTML = '<option value="">Seleccionar...</option>';
    
    if (movementTypeId) {
        const filteredCostTypes = costTypes.filter(ct => ct.movementTypeId == movementTypeId);
        filteredCostTypes.forEach(ct => {
            const option = document.createElement('option');
            option.value = ct.id;
            option.textContent = ct.name;
            costTypeSelect.appendChild(option);
        });
    }
}

// Guardar subcategoría
function saveSubcategory() {
    const id = document.getElementById('subcategory-id').value;
    const name = document.getElementById('subcategory-name').value;
    const movementTypeId = document.getElementById('subcategory-movement').value;
    const costTypeId = document.getElementById('subcategory-cost-type').value;
    const categoryId = document.getElementById('subcategory-category').value;
    
    if (!name || !movementTypeId || !costTypeId || !categoryId) {
        alert('Por favor, complete todos los campos.');
        return;
    }
    
    if (id) {
        // Editar
        const index = subcategories.findIndex(s => s.id == id);
        if (index !== -1) {
            subcategories[index].name = name;
            subcategories[index].movementTypeId = parseInt(movementTypeId);
            subcategories[index].costTypeId = parseInt(costTypeId);
            subcategories[index].categoryId = parseInt(categoryId);
        }
    } else {
        // Nuevo
        subcategories.push({
            id: generateId(subcategories),
            name: name,
            movementTypeId: parseInt(movementTypeId),
            costTypeId: parseInt(costTypeId),
            categoryId: parseInt(categoryId)
        });
    }
    
    saveAllData();
    loadSubcategoriesTable();
    document.getElementById('subcategory-form').reset();
    document.getElementById('subcategory-id').value = '';
}

// Cargar tabla de subcategorías
function loadSubcategoriesTable() {
    const tableBody = document.getElementById('subcategory-table');
    tableBody.innerHTML = '';
    
    subcategories.forEach(subcategory => {
        const movementType = getMovementTypeName(subcategory.movementTypeId);
        const costType = getCostTypeName(subcategory.costTypeId);
        const category = getCategoryName(subcategory.categoryId);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${subcategory.id}</td>
            <td>${subcategory.name}</td>
            <td>${movementType}</td>
            <td>${costType}</td>
            <td>${category}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="editSubcategory(${subcategory.id})">Editar</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteSubcategory(${subcategory.id})">Eliminar</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Editar subcategoría
function editSubcategory(id) {
    const subcategory = subcategories.find(s => s.id === id);
    if (!subcategory) return;
    
    document.getElementById('subcategory-id').value = subcategory.id;
    document.getElementById('subcategory-name').value = subcategory.name;
    document.getElementById('subcategory-movement').value = subcategory.movementTypeId;
    document.getElementById('subcategory-cost-type').value = subcategory.costTypeId;
    document.getElementById('subcategory-category').value = subcategory.categoryId;
}

// Eliminar subcategoría
function deleteSubcategory(id) {
    // Verificar si está siendo usado
    const usedInConcepts = concepts.some(c => c.subcategoryId === id);
    
    if (usedInConcepts) {
        alert('No se puede eliminar esta subcategoría porque está siendo utilizada en otros registros.');
        return;
    }
    
    if (confirm('¿Está seguro de que desea eliminar esta subcategoría?')) {
        subcategories = subcategories.filter(s => s.id !== id);
        saveAllData();
        loadSubcategoriesTable();
    }
}

// Actualizar selectores de subcategoría
function updateSubcategorySelects() {
    const movementTypeId = document.getElementById('subcategory-movement').value;
    const costTypeSelect = document.getElementById('subcategory-cost-type');
    const categorySelect = document.getElementById('subcategory-category');
    
    // Limpiar selectores
    costTypeSelect.innerHTML = '<option value="">Seleccionar...</option>';
    categorySelect.innerHTML = '<option value="">Seleccionar...</option>';
    
    if (movementTypeId) {
        // Cargar tipos de costo según el tipo de movimiento
        const filteredCostTypes = costTypes.filter(ct => ct.movementTypeId == movementTypeId);
        filteredCostTypes.forEach(ct => {
            const option = document.createElement('option');
            option.value = ct.id;
            option.textContent = ct.name;
            costTypeSelect.appendChild(option);
        });
        
        // Cargar categorías según el tipo de movimiento
        const filteredCategories = categories.filter(c => c.movementTypeId == movementTypeId);
        filteredCategories.forEach(c => {
            const option = document.createElement('option');
            option.value = c.id;
            option.textContent = c.name;
            categorySelect.appendChild(option);
        });
    }
}

// Guardar concepto
function saveConcept() {
    const id = document.getElementById('concept-id').value;
    const name = document.getElementById('concept-name').value;
    const movementTypeId = document.getElementById('concept-movement').value;
    const costTypeId = document.getElementById('concept-cost-type').value;
    const categoryId = document.getElementById('concept-category').value;
    const subcategoryId = document.getElementById('concept-subcategory').value;
    
    if (!name || !movementTypeId || !costTypeId || !categoryId) {
        alert('Por favor, complete todos los campos obligatorios.');
        return;
    }
    
    if (id) {
        // Editar
        const index = concepts.findIndex(c => c.id == id);
        if (index !== -1) {
            concepts[index].name = name;
            concepts[index].movementTypeId = parseInt(movementTypeId);
            concepts[index].costTypeId = parseInt(costTypeId);
            concepts[index].categoryId = parseInt(categoryId);
            concepts[index].subcategoryId = subcategoryId ? parseInt(subcategoryId) : null;
        }
    } else {
        // Nuevo
        concepts.push({
            id: generateId(concepts),
            name: name,
            movementTypeId: parseInt(movementTypeId),
            costTypeId: parseInt(costTypeId),
            categoryId: parseInt(categoryId),
            subcategoryId: subcategoryId ? parseInt(subcategoryId) : null
        });
    }
    
    saveAllData();
    loadConceptsTable();
    document.getElementById('concept-form').reset();
    document.getElementById('concept-id').value = '';
}

// Cargar tabla de conceptos
function loadConceptsTable() {
    const tableBody = document.getElementById('concept-table');
    tableBody.innerHTML = '';
    
    concepts.forEach(concept => {
        const movementType = getMovementTypeName(concept.movementTypeId);
        const costType = getCostTypeName(concept.costTypeId);
        const category = getCategoryName(concept.categoryId);
        const subcategory = concept.subcategoryId ? getSubcategoryName(concept.subcategoryId) : '-';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${concept.id}</td>
            <td>${concept.name}</td>
            <td>${movementType}</td>
            <td>${costType}</td>
            <td>${category}</td>
            <td>${subcategory}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="editConcept(${concept.id})">Editar</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteConcept(${concept.id})">Eliminar</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Editar concepto
function editConcept(id) {
    const concept = concepts.find(c => c.id === id);
    if (!concept) return;
    
    document.getElementById('concept-id').value = concept.id;
    document.getElementById('concept-name').value = concept.name;
    document.getElementById('concept-movement').value = concept.movementTypeId;
    document.getElementById('concept-cost-type').value = concept.costTypeId;
    document.getElementById('concept-category').value = concept.categoryId;
    document.getElementById('concept-subcategory').value = concept.subcategoryId || '';
}

// Eliminar concepto
function deleteConcept(id) {
    // Verificar si está siendo usado
    const usedInTransactions = transactions.some(t => t.conceptId === id);
    
    if (usedInTransactions) {
        alert('No se puede eliminar este concepto porque está siendo utilizado en transacciones.');
        return;
    }
    
    if (confirm('¿Está seguro de que desea eliminar este concepto?')) {
        concepts = concepts.filter(c => c.id !== id);
        saveAllData();
        loadConceptsTable();
    }
}

// Actualizar selectores de concepto
function updateConceptSelects() {
    const movementTypeId = document.getElementById('concept-movement').value;
    const costTypeSelect = document.getElementById('concept-cost-type');
    const categorySelect = document.getElementById('concept-category');
    const subcategorySelect = document.getElementById('concept-subcategory');
    
    // Limpiar selectores
    costTypeSelect.innerHTML = '<option value="">Seleccionar...</option>';
    categorySelect.innerHTML = '<option value="">Seleccionar...</option>';
    subcategorySelect.innerHTML = '<option value="">Seleccionar...</option>';
    
    if (movementTypeId) {
        // Cargar tipos de costo según el tipo de movimiento
        const filteredCostTypes = costTypes.filter(ct => ct.movementTypeId == movementTypeId);
        filteredCostTypes.forEach(ct => {
            const option = document.createElement('option');
            option.value = ct.id;
            option.textContent = ct.name;
            costTypeSelect.appendChild(option);
        });
        
        // Cargar categorías según el tipo de movimiento
        const filteredCategories = categories.filter(c => c.movementTypeId == movementTypeId);
        filteredCategories.forEach(c => {
            const option = document.createElement('option');
            option.value = c.id;
            option.textContent = c.name;
            categorySelect.appendChild(option);
        });
        
        // Cargar subcategorías según el tipo de movimiento
        const filteredSubcategories = subcategories.filter(s => s.movementTypeId == movementTypeId);
        filteredSubcategories.forEach(s => {
            const option = document.createElement('option');
            option.value = s.id;
            option.textContent = s.name;
            subcategorySelect.appendChild(option);
        });
    }
}

// Actualizar selectores en cascada para transacciones
function updateCascadingSelects() {
    const movementTypeId = document.getElementById('transaction-type').value;
    const costTypeSelect = document.getElementById('transaction-cost-type');
    const conceptSelect = document.getElementById('transaction-concept');
    
    // Limpiar selectores
    costTypeSelect.innerHTML = '<option value="">Seleccionar...</option>';
    conceptSelect.innerHTML = '<option value="">Seleccionar...</option>';
    
    if (movementTypeId) {
        // Cargar tipos de costo según el tipo de movimiento
        const filteredCostTypes = costTypes.filter(ct => ct.movementTypeId == movementTypeId);
        filteredCostTypes.forEach(ct => {
            const option = document.createElement('option');
            option.value = ct.id;
            option.textContent = ct.name;
            costTypeSelect.appendChild(option);
        });
        
        // Cargar conceptos según el tipo de movimiento
        const filteredConcepts = concepts.filter(c => c.movementTypeId == movementTypeId);
        filteredConcepts.forEach(c => {
            const option = document.createElement('option');
            option.value = c.id;
            option.textContent = c.name;
            conceptSelect.appendChild(option);
        });
    }
}

// Cargar tipos de movimiento en un selector
function loadMovementTypesSelect(selectId) {
    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">Seleccionar...</option>';
    
    movementTypes.forEach(mt => {
        const option = document.createElement('option');
        option.value = mt.id;
        option.textContent = mt.name;
        select.appendChild(option);
    });
}

// Cargar tipos de costo en un selector
function loadCostTypesSelect(selectId) {
    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">Seleccionar...</option>';
    
    costTypes.forEach(ct => {
        const option = document.createElement('option');
        option.value = ct.id;
        option.textContent = ct.name;
        select.appendChild(option);
    });
}

// Cargar conceptos en un selector
function loadConceptsSelect(selectId) {
    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">Seleccionar...</option>';
    
    concepts.forEach(c => {
        const option = document.createElement('option');
        option.value = c.id;
        option.textContent = c.name;
        select.appendChild(option);
    });
}

// Funciones auxiliares
function generateId(array) {
    return array.length > 0 ? Math.max(...array.map(item => item.id)) + 1 : 1;
}

function getMovementTypeName(id) {
    const movementType = movementTypes.find(mt => mt.id == id);
    return movementType ? movementType.name : 'Desconocido';
}

function getCostTypeName(id) {
    const costType = costTypes.find(ct => ct.id == id);
    return costType ? costType.name : 'Desconocido';
}

function getCategoryName(id) {
    const category = categories.find(c => c.id == id);
    return category ? category.name : 'Desconocido';
}

function getSubcategoryName(id) {
    const subcategory = subcategories.find(s => s.id == id);
    return subcategory ? subcategory.name : 'Desconocido';
}

function getConceptName(id) {
    const concept = concepts.find(c => c.id == id);
    return concept ? concept.name : 'Desconocido';
}

function getConcept(id) {
    return concepts.find(c => c.id == id) || {};
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
}

function formatPeriod(periodString) {
    if (!periodString) return '-';
    const date = new Date(periodString);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
}

function getPriorityBadgeClass(priority) {
    switch(priority) {
        case 'Alta': return 'bg-danger';
        case 'Media': return 'bg-warning';
        case 'Baja': return 'bg-info';
        default: return 'bg-secondary';
    }
}