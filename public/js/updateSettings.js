/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable import/prefer-default-export */
// const axios = require('axios');
import axios from 'axios';
import { showAlert } from './alert';

export const updateData = async (data, type) => {
    // console.log(data);
    try {
        console.log(data);
        await axios({
            method: 'PATCH',
            url:
                type === 'data'
                    ? 'http://127.0.0.1:8080/api/v1/users/updateMe'
                    : 'http://127.0.0.1:8080/api/v1/users/updateMyPassword',
            data
        });
        showAlert('success', 'Data updated successfully');
    } catch (err) {
        console.log(err);
        showAlert('error', err.response.data.message || 'Something went wrong');
    }
};
