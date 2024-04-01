// auth.js
let loginButton = document.getElementById('login');

export async function login(userName, password) {
    try {
        const response = await fetch('https://tjokvdi035.execute-api.eu-north-1.amazonaws.com/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userName: userName,
                password: password
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            //console.log(data)
            displayErrorMessage(data);
        } else if (response.status === 200) {
            storeUserData(data, userName);
            hideLoginForm();
            location.reload();
        } else {
            console.error(data);
        }

        return {response, data};
    } catch (error) {
        console.error('Error:', error);
    }
}

export function displayErrorMessage(message) {
    let form = document.querySelector('.login form');
    let p = document.createElement('p');
    p.textContent = message;
    p.classList.add('login_error');

    // Remove existing error message
    let existingError = form.querySelector('.login_error');
    if (existingError) {
        form.removeChild(existingError);
    }

    // Add new error message
    form.appendChild(p);
    loginButton.classList.add('buzz-animation');
}

function storeUserData(data, userName) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', userName);
    localStorage.setItem('userInfo', JSON.stringify(data.UserInfo));
}

function hideLoginForm() {
    let main = document.querySelector('.main');
    main.style.display = 'none';
}

loginButton.addEventListener('click', async (e) => {
    e.preventDefault();
    let userName = document.getElementById('username').value;
    let password = document.getElementById('password').value;
    await login(userName, password);
});

document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'logout') {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('userInfo');
        location.reload();
    }
});

document.getElementById('login-form').addEventListener('click', (e) => {
    e.preventDefault();
    let form = document.querySelector('.main');
    form.classList.add('slideDown');
    form.style.display = 'block';
});
