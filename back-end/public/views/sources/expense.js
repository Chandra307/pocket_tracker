"use strict";

const ul = document.getElementById('expenses');
const pages = document.getElementById('pages');
const selectNoOfExpenses = document.getElementById('per-page');
const categorySelect = document.getElementById('category');
let putId;

const table = document.querySelector('.table');

selectNoOfExpenses.oninput = () => {
    localStorage.setItem("number", selectNoOfExpenses.value);
    sendGetRequest(1);
}
categorySelect.oninput = () => {

    const classList = document.getElementById('custom').classList;
    categorySelect.value === 'Others' ? classList.remove('d-none') : classList.add('d-none');

}
async function sendGetRequest(page) {
    try {

        let number = 5;
        if (localStorage.getItem('number')) {
            number = localStorage.getItem('number');
        }
        const { data: { expenses, pageData, ...i } } = await axios.get(`/expense/getexpenses?page=${page}&number=${number}`);
        if (!expenses.length) {
            document.querySelector('.expenses').classList.add('d-none');
            document.querySelector('.welcome').classList.remove('d-none');
            document.querySelector('.welcome').innerHTML = `<p class='lead'>Hi, ${i.user}! 
            All your expenses show up here. If they didn't, click on the '+' button below to
            add expenses and you would find some :)</p>`
        }
        else {
            document.querySelector('.welcome').classList.add('d-none');
            document.querySelector('.expenses').classList.remove('d-none');
            if (table.querySelector('tbody')) {
                table.querySelector('tbody').remove();
            }
            let rows = '';
            expenses.forEach((expense, index) => {
                rows += displayExpenses(expense, index, pageData.limit, pageData.currentPage);
            });
            table.innerHTML += `<tbody>${rows}</tbody>`;
        }

        pages.innerHTML = '';
        if (pageData.previousPage > 0) {

            if (pageData.previousPage - 1 === 1) {
                pages.innerHTML = `<button class='btn' id='page1' onclick='sendGetRequest(1)'>1</button>`;
            }
            else if (pageData.previousPage - 1 > 1) {
                pages.innerHTML = `<button class='btn' id='page1' onclick='sendGetRequest(1)'>1</button>.. `;
            }
            pages.innerHTML += `<button class='btn' id='page${pageData.previousPage}' onclick='sendGetRequest(${pageData.previousPage})'>${pageData.previousPage}</button>`;
        }

        pages.innerHTML += `<button class='btn' id='page${pageData.currentPage}' onclick='sendGetRequest(${pageData.currentPage})'>${pageData.currentPage}</button>`;
        document.getElementById(`page${page}`).className = 'active';

        if (pageData.hasNextPage) {

            pages.innerHTML += `<button class='btn' id='page${pageData.nextPage}' onclick='sendGetRequest(${pageData.nextPage})'>${pageData.nextPage}</button>`;

            if (pageData.nextPage + 1 === pageData.lastPage) {
                pages.innerHTML += `<button class='btn' id='page${pageData.lastPage}' onclick='sendGetRequest(${pageData.lastPage})'>${pageData.lastPage}</button>`;
            }
            else if (pageData.nextPage + 1 < pageData.lastPage) {
                pages.innerHTML += `.. <button class='btn' id='page${pageData.lastPage}' onclick='sendGetRequest(${pageData.lastPage})'>${pageData.lastPage}</button>`;
            }
        }
    }
    catch (err) {
        console.log(err);
        if (err.response.status === 401) {
            alert('Please login again!');
            window.location.href = '/login.html';
        }
    }
}

document.querySelector('form').onsubmit = async (e) => {
    try {
        e.preventDefault();

        if (document.getElementById('error')) {
            document.getElementById('error').textContent = '';
        }

        let category = e.target.category.value;
        if (!document.getElementById('custom').classList.contains('d-none')) {
            category = e.target.custom.value;
            const newCategory = document.createElement('option');
            newCategory.textContent = category;
            categorySelect.insertAdjacentElement('afterbegin', newCategory);
        }

        const expenseDetails = {
            amount: e.target.amount.value,
            description: e.target.description.value,
            category,
            date: e.target.date.value
        };
        e.target.reset();

        if (!putId) {
            await axios.post('/expense/addexpense', expenseDetails);
        }
        else {
            await axios.put(`/expense/editexpense/${putId}`, expenseDetails);
            document.getElementById('submit').textContent = 'Add Expense';
            putId = '';
        }
        sendGetRequest(1);
        document.querySelector('dialog').close();
        document.getElementById('custom').classList.add('d-none');
    }
    catch (err) {
        document.querySelector('#error').textContent = `${err}`;
    }
}

window.addEventListener('DOMContentLoaded', async () => {
    try {
        document.getElementById('error').textContent = '';

        const page = 1;
        sendGetRequest(page);

        if (localStorage.getItem('number')) {
            selectNoOfExpenses.value = localStorage.getItem('number');
        }

        const { data: { files, premium } } = await axios.get('/user/downloads');
        if (premium) {
            showLeaderboard();
            if (files.length) { 
                document.getElementById('downloads').innerHTML = `<h2 style='font-family: arial;'>
                Downloads</h2>`;
                files.forEach(file => {
                    document.querySelector('#downloads').innerHTML += `<li><a href='${file.fileUrl}'>
                    ${new Date(file.time).toLocaleString()}</a></li>`;
                })
            } else {
                document.getElementById('downloads').innerHTML += `<p style='font-family: arial;'>
                No downloads yet!</p>`;
            }
        }
    }
    catch (err) {
        console.log(err);
        document.querySelector('#error').textContent = `${err}`
    }
})

function displayExpenses(obj, index, limit, page) {
    let number;

    if (limit && page) {
        number = ((page - 1) * limit) + index + 1;
    }

    return `<tr id="${obj._id}" onclick="displayMenu.call(this)" style="cursor: pointer;"><th scope='row'>${number}</th><td>${obj.date.slice(0, 10)}</td>
    <td>${obj.description}</td><td class='d-md-table-cell d-none'>${obj.category}</td>
    <td>${obj.amount}<div class="d-inline ms-2"><i class='bi bi-three-dots-vertical ms-5 d-none' data-bs-toggle='dropdown' 
    onclick='event.stopPropagation()'></i><div class='dropdown-menu'>
    <div class='btn-group'><button class='btn btn-outline-danger btn-sm mx-2'
    onclick='deleteExpense("${obj._id}")' title='Delete'><span class='bi bi-trash'></span>
    </button><button class='btn btn-outline-success btn-sm me-2'
    onclick='editExpense("${obj._id}")' title='Edit'><span class='bi bi-pencil'></span>
    </button></div></div></div></td></tr>`;
}

function displayMenu() {
    this?.querySelector('i').classList.toggle('d-none');
}

function showLeaderboard() {

    document.querySelector('.dashboard').classList.remove('d-none');

    document.querySelector('#leaderboard').onclick = async (e) => {
        try {
            document.getElementById('leaderboard').innerHTML = `<h2 style='font-family: arial;
            cursor: pointer;'>Leaderboard</h2>`;

            const { data: { users, loggedInUser } } = await axios.get('/premium/leaderboard');

            users.forEach((detail, index) => {
                let name;
                name = detail.name === loggedInUser ? detail.name + ' (You) ' : detail.name;
                document.getElementById('leaderboard').innerHTML += `<li id='${detail._id}}' style='font-size: 1.1rem;'>${index + 1}. ${name} - Total expenses: ₹${Number(detail.totalExpenses)}</li>`;
            });
        }
        catch (err) {
            console.log(err);
        }
    }
}

async function deleteExpense(id) {
    try {

        if (document.querySelector('#error')) {
            document.querySelector('#error').remove();
        }
        if (confirm('Delete this expense?')) {

            await axios.delete(`/expense/delete-expense/${id}`);
            document.getElementById(id).remove();
            sendGetRequest(1);
        }
    }
    catch (err) {
        console.log(err);
        ul.innerHTML += `<h3 id='error' style='color: red; font-family: sans-serif;'>${err.response.data}</h3>`;
    }
}

async function editExpense(id) {
    try {
        const li = document.getElementById('id');
        const { data: { expense } } = await axios.get(`/expense/getexpense/${id}`);
        const newOption = Array.from(document.getElementById('category').children).filter(option => option.textContent === expense.category);
        console.log(newOption.length);
        document.querySelector('dialog').showModal();
        document.getElementById('amount').focus();
        document.getElementById('amount').value = expense.amount;
        document.getElementById('desc').value = expense.description;
        if (!newOption.length) {
            const newCategory = document.createElement('option');
            newCategory.textContent = expense.category;
            document.getElementById('category').insertAdjacentElement('afterbegin', newCategory);
            console.log('desired functionality', document.getElementById('category').innerHTML);
        }
        document.getElementById('category').value = expense.category;
        document.getElementById('date').value = expense.date.slice(0, 10);
        document.getElementById('submit').textContent = 'Update Expense';
        putId = id;
    }
    catch (err) {
        console.log(err);
    }
}

document.getElementById('plus').onclick = () => {
    document.querySelector('dialog').showModal();
    document.getElementById('amount').focus();
}

document.querySelector('#close').onclick = () => {
    document.querySelector('form').reset();
    document.getElementById('submit').textContent = 'Add Expense';
    document.querySelector('dialog').close();
    putId = '';
}

document.querySelector('a[role = "button"]').onclick = async () => {
    try {
        await axios.get('/user/logout');
        window.location.href = '/login.html';
    } catch (err) {
        console.log(err);
    }
}