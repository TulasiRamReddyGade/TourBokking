/*eslint-disable*/

'usestrict';
import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:8080/api/v1/users/login',
            data: { email, password }
        });
        console.log(res);
        if (res.data.status === 'success') {
            showAlert('success', 'Login Success!');
            setTimeout(() => {
                location.assign('/');
            }, 1500);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};

export const logout = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: 'http://127.0.0.1:8080/api/v1/users/logout'
        });
        if (res.data.status === 'success') {
            showAlert('success', 'Logout Success!');
            setTimeout(() => {
                location.reload(true);
            }, 1000);
        }
    } catch (err) {
        showAlert('error', 'failed to logout');
    }
};
