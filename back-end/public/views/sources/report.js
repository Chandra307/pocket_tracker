"use strict";
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const { data } = await axios.get('user/premiumInfo');
        console.log(data);
        data ? document.querySelector('.mt-4').classList.remove('d-none') :
            document.querySelector('.premium').classList.remove('d-none');
    }
    catch (err) {
        console.log(err);
        err.response.status === 401 ? alert('Please login again') : alert(err.response.data);
        window.location.href = '/login.html';
    }
})
document.querySelector('#premiumBtn').onclick = async (e) => {
    try {
        const { data: { order, key_id } } = await axios.get('/premium/purchase');

        var options = {
            "key": key_id,
            "name": "Pocket Tracker",
            "description": "Test Transaction",
            "order_id": order.id,
            "theme": {
                "color": "#3399cc"
            },
            "handler": async function (result) {
                try {
                    await axios.post('/premium/updateStatus', {
                        order_id: options.order_id,
                        payment_id: result.razorpay_payment_id
                    });

                    alert('Congrats, you are a premium user now!');
                    document.querySelector('.premium').classList.add('d-none');
                    document.querySelector('.mt-4').classList.remove('d-none');
                }
                catch (err) {
                    console.log(err);
                }
            }
        }
        const rzpt = new Razorpay(options);
        rzpt.open();
        e.preventDefault();

        rzpt.on('payment.failed', async function ({ error: { metadata } }) {
            try {
                await axios.post('/premium/updateStatus', {
                    status: "failed",
                    order_id: options.order_id,
                    payment_id: metadata.payment_id
                });
                alert('Sorry, payment failed!');
            }
            catch (err) {
                console.log(err);
            }
        })
    }
    catch (err) {
        console.log(err);
    }
}
document.getElementById('view').onchange = (e) => {
    const view = e.target.value;

    const dateElement = document.getElementById('date');
    const weekElement = document.getElementById('week');
    const monthElement = document.getElementById('month');

    view === 'DAILY' ? hideElements(dateElement, weekElement, monthElement) :
        view === 'WEEKLY' ? hideElements(weekElement, dateElement, monthElement) :
            hideElements(monthElement, dateElement, weekElement);
}

document.querySelector('#report').onclick = async (e) => {
    try {
        const view = document.getElementById('view').value;

        if (view === 'MONTHLY') {
            const month = document.querySelector('#month').value;
            const { data: { expenses, total } } = await axios
                .get(`/user/monthlyReport?month=${month}`);

            document.getElementById('shortTerm').innerHTML = `<tr><th>Date</th><th>Description</th>
            <th>Category</th><th>Expense (in ₹)</th></tr>`;
            expenses.forEach(expense => {
                document.getElementById('shortTerm').innerHTML += `<tr><th scope='row'>${(expense.date).slice(0, 10)}</th>
                <td>${expense.description}</td><td>${expense.category}</td>
                <td align='right' style='padding-right: 4px;'>${expense.amount}.00</td></tr>`;
            })
            document.getElementById('shortTerm').innerHTML += `<tr><td> </td><td> </td>
            <th scope='row'>Total expenses</th><td align='right'>${total}.00</td></tr>`;
        }
        else if (view === 'DAILY') {

            const date = document.getElementById('date').value;
            const { data: { expenses, total } } = await axios
                .get(`/user/dailyReport?date=${date}`);

            document.getElementById('shortTerm').innerHTML = `<tr><th>#</th><th>Description</th>
            <th>Category</th><th>Expense (in ₹)</th></tr>`;

            expenses.forEach((expense, index) => {
                document.getElementById('shortTerm').innerHTML += `<tr><th scope='row'>${index + 1}</th>
                <td>${expense.description}</td><td>${expense.category}</td>
            <td align='right'>${expense.amount}.00</td></tr>`;
            });

            document.getElementById('shortTerm').innerHTML += `<tr><td> </td><td> </td>
            <th scope='row'>Total expenses</th><td align='right'>${total}.00</td></tr>`;
        }
        else {
            const start = document.getElementById('start').value;
            const end = document.getElementById('end').value;

            const { data: { expenses, total } } = await axios
                .get(`/user/weeklyReport?start=${start}&end=${end}`);

            document.getElementById('shortTerm').innerHTML = `<tr><th>Date</th><th>Description</th>
            <th>Category</th><th>Expense (in ₹)</th></tr>`;

            expenses.forEach(expense => {
                document.getElementById('shortTerm').innerHTML += `<tr><th scope='row'>${(expense.date).slice(0, 10)}</th>
                <td>${expense.description}</td><td>${expense.category}</td>
                <td align='right'>${expense.amount}.00</td></tr>`;
            })

            document.getElementById('shortTerm').innerHTML += `<tr><td> </td><td> </td>
            <th scope='row'>Total expenses</th><td align='right'>${total}.00</td></tr>`;
        }
    }
    catch (err) {
        console.log(err);
        if (err.response.status === 401) {
            alert('Please login again!');
            return window.location.href = '/login.html';
        }
        alert(err.response.data);
    }
}

document.getElementById('year').oninput = async (e) => {
    try {
        const year = document.getElementById('year').value;
        const { data: { expenses } } = await axios.get(`/user/annualReport?year=${year}`);
        document.getElementById('annual').innerHTML = `<tr><th>Month</th><th>Expense (in ₹)</th></tr>`;
        let total = 0;
        expenses.forEach(expense => {
            total += expense.amount;
            document.getElementById('annual').innerHTML += `<tr><td>${getMonth(expense._id)}</td>
                <td align='right'>${expense.amount}.00</td></tr>`
        });

        document.getElementById('annual').innerHTML += `<tr><th scope='row'>Total expenses</th>
        <td align='right'>${total}.00</td></tr>`;
    }
    catch (err) {
        console.log(err);
        if (err.response.status === 401) {
            alert('Please login again!')
            return window.location.href = 'login.html';
        }
        alert(err.response.data);
    }
}

document.getElementById('downloadBtn').onclick = () => downloadReport();
document.getElementById('downloadIcon').onclick = () => downloadReport();

async function downloadReport() {
    try {
        const { data } = await axios.get('/user/downloadfile');
        console.log(data);
        window.print();
        const a = document.createElement('a');
        a.href = data;
        a.download = 'expenses.csv';
        a.click();

    }
    catch (err) {
        console.log(err);
    }
}

function hideElements(selectedElement, elementNotSelected_1, elementNotSelected_2) {
    selectedElement.classList.remove('d-none');
    elementNotSelected_1.classList.add('d-none');
    elementNotSelected_2.classList.add('d-none');
}

function getMonth(value) {
    switch (value) {
        case 1:
            return "January";
        case 2:
            return 'February';
        case 3:
            return 'March';
        case 4:
            return 'April';
        case 5:
            return 'May';
        case 6:
            return 'June';
        case 7:
            return 'July';
        case 8:
            return 'August';
        case 9:
            return 'September';
        case 10:
            return 'October';
        case 11:
            return 'November';
        case 12:
            return 'December';
        default:
            return 'nil'
    }
}

document.querySelector('a[role = "button"]').onclick = async () => {
    try {
        await axios.get('/user/logout');
        window.location.href = '/login.html';
    } catch (err) {
        console.log(err);
    }
}