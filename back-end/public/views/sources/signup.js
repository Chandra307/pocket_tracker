"use strict";

const icon = document.querySelector('span i');
const passwordInput = document.querySelector('#password');

document.querySelector('form').onsubmit = async (e) => {
    try {
        e.preventDefault();

        if (document.querySelector('#error')) {
            document.querySelector('#error').remove();
        }

        let obj = {
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('mail').value,
            password: document.getElementById('password').value
        };
        e.target.reset();
        const response = await axios.post('/user/signup', obj);
        if (response.status === 201) {
            window.location.href = 'login.html';
        }
    } catch (err) {
        console.log(err);
        document.querySelector('form').innerHTML += `<p id='error' style='color: red;'>${err.response.data}</p>`;

    }
}

icon.onclick = function () {
    let inputType = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', inputType);
    this.classList.toggle('bi-eye');
}