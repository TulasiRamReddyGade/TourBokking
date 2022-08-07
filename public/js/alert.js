/* eslint-disable*/

export const hideAlert = () => {
    const el = document.querySelector('.alert');
    if (el) el.parentElement.removeChild(el);
};

export const showAlert = (type, message) => {
    // hideAlert();
    console.log(type, message);
    const markup = `<div class="alert alert--${type}">${message}</div>`;
    console.log(markup);
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
    // console.log('Hello');
    window.setTimeout(hideAlert, 5000);
};
