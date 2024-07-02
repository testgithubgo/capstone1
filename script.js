document.addEventListener('DOMContentLoaded', function() {
    const addModal = document.getElementById("expense-modal");
    const editModal = document.getElementById("edit-modal");
    const addBtn = document.getElementById("add-expense-btn");
    const addClose = document.getElementsByClassName("close")[0];
    const editClose = document.getElementsByClassName("close")[1];

    let budget = parseFloat(document.getElementById('budget').value);

    // Show or hide the new category input field
    document.getElementById('category').addEventListener('change', function() {
        if (this.value === 'Other') {
            document.getElementById('new-category').style.display = 'block';
        } else {
            document.getElementById('new-category').style.display = 'none';
        }
    });

    document.getElementById('edit-category').addEventListener('change', function() {
        if (this.value === 'Other') {
            document.getElementById('edit-new-category').style.display = 'block';
        } else {
            document.getElementById('edit-new-category').style.display = 'none';
        }
    });

    addBtn.onclick = function() {
        addModal.style.display = "block";
    }

    addClose.onclick = function() {
        addModal.style.display = "none";
    }

    editClose.onclick = function() {
        editModal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == addModal) {
            addModal.style.display = "none";
        }
        if (event.target == editModal) {
            editModal.style.display = "none";
        }
    }

    document.getElementById('expense-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = {};
        formData.forEach((value, key) => { data[key] = value });

        if (data.category === 'Other') {
            data.category = data['new-category'];
        }

        delete data['new-category']; // Remove the new-category field

        fetch('http://127.0.0.1:8000/add_expense', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => response.json())
          .then(data => {
            if (data.success) {
                loadExpenses();
                addModal.style.display = "none";
                document.getElementById('expense-form').reset(); // Clear the modal form
                document.getElementById('new-category').style.display = 'none'; // Hide new category input
            } else {
                alert('Error adding expense');
            }
        }).catch(error => {
            console.error('Error:', error);
        });
    });

    document.getElementById('edit-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = {};
        formData.forEach((value, key) => { data[key] = value });

        if (data.category === 'Other') {
            data.category = data['new-category'];
        }

        delete data['new-category']; // Remove the new-category field

        fetch(`http://127.0.0.1:8000/update_expense/${data.id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => response.json())
          .then(data => {
            if (data.success) {
                loadExpenses();
                editModal.style.display = "none";
                document.getElementById('edit-form').reset(); // Clear the modal form
                document.getElementById('edit-new-category').style.display = 'none'; // Hide new category input
            } else {
                alert('Error updating expense');
            }
        }).catch(error => {
            console.error('Error:', error);
        });
    });

    function loadExpenses(filter = 'all', category = '') {
        fetch('http://127.0.0.1:8000/get_expenses')
        .then(response => response.json())
        .then(data => {
            const expensesList = document.getElementById('expenses-list');
            expensesList.innerHTML = '';
            let spent = 0;
            const now = new Date();

            const filteredExpenses = data.filter(expense => {
                const expenseDate = new Date(expense.date);
                if (category && expense.category !== category) {
                    return false;
                }
                switch(filter) {
                    case 'today':
                        return expenseDate.toDateString() === now.toDateString();
                    case 'week':
                        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
                        const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6));
                        return expenseDate >= weekStart && expenseDate <= weekEnd;
                    case 'month':
                        return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
                    case 'year':
                        return expenseDate.getFullYear() === now.getFullYear();
                    default:
                        return true;
                }
            });

            filteredExpenses.forEach(expense => {
                spent += expense.amount;
                const expenseItem = document.createElement('div');
                expenseItem.className = `expense-item category-${expense.category}`;
                expenseItem.innerHTML = `
                    <div>${expense.name}</div>
                    <div>$${expense.amount}</div>
                    <div>${expense.date}</div>
                    <div>${expense.category}</div>
                    <div><button class="edit-btn" onclick="editExpense(${expense.id}, '${expense.name}', ${expense.amount}, '${expense.date}', '${expense.category}')">Edit</button></div>
                `;
                expensesList.appendChild(expenseItem);
            });

            const savings = budget - spent;

            document.getElementById('spent').innerText = `Spent: $${spent}`;
            document.getElementById('savings').innerText = `Savings: $${savings}`;

            const spentElement = document.getElementById('spent');
            if (spent > budget) {
                spentElement.classList.add('over-budget');
            } else {
                spentElement.classList.remove('over-budget');
            }
        }).catch(error => {
            console.error('Error:', error);
        });
    }

    document.getElementById('budget').addEventListener('change', function() {
        budget = parseFloat(this.value);
        loadExpenses();
    });

    loadExpenses();

    window.filterExpenses = function(filter) {
        const category = document.getElementById('category-filter').value;
        loadExpenses(filter, category);
    };

    window.editExpense = editExpense;
});

function editExpense(id, name, amount, date, category) {
    const editModal = document.getElementById("edit-modal");
    editModal.style.display = "block";
    document.getElementById("edit-id").value = id;
    document.getElementById("edit-name").value = name;
    document.getElementById("edit-amount").value = amount;
    document.getElementById("edit-date").value = date;
    document.getElementById("edit-category").value = category;

    if (category === 'Other') {
        document.getElementById('edit-new-category').style.display = 'block';
    } else {
        document.getElementById('edit-new-category').style.display = 'none';
    }
}
