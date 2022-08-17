/*eslint-disable*/
import { login, logout } from './login';
import { showMap } from './leaf';
import { updateData } from './updateSettings';
// import { doc } from 'prettier';

const form = document.querySelector('.form--login');
const locationDOM = document.getElementById('map');
const logoutButton = document.querySelector('.nav__el--logout');
const passwordChange = document.querySelector('.form-user-settings');
// const locations = JSON.parse(.dataset.locations);

// console.log(login);

const saveSettings = document.querySelector('.form-user-data');
// console.log(saveSettings);
// console.log(form);

if (locationDOM) showMap(JSON.parse(locationDOM.dataset.locations));

if (form) {
    // console.log(form);
    form.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });
}

if (logoutButton) logoutButton.addEventListener('click', logout);
if (saveSettings) {
    // console.log(saveSettings);
    saveSettings.addEventListener('submit', e => {
        e.preventDefault();
        // const email = document.getElementById('email').value;
        // const name = document.getElementById('name').value;
        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);
        updateData(form, 'data');
    });
}
if (passwordChange) {
    passwordChange.addEventListener('submit', e => {
        e.preventDefault();
        const passwordCurrent = document.getElementById('password-current')
            .value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm')
            .value;
        // console.log(password, passwordConfirm);
        updateData({ passwordCurrent, password, passwordConfirm }, 'password');
    });
}
