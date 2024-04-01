import './navigation.js';
import { login} from '../JS/auth.js';
import { displayProfile, hideProfile } from '../JS/profile.js';
import { changeUserInfo } from '../JS/editInfo.js';
import { signupUser } from './signup.js';
import { submitChangePasswordForm, handlePasswordChangeResponse } from './passChange.js';

// Stop the logout text from disappering when the page is refreshed
window.addEventListener('DOMContentLoaded', (event) => {
    let token = localStorage.getItem('token');
    let menu_login = document.getElementById('login-form');
    if (token) {
        menu_login.textContent = localStorage.getItem('username');
    }
});


document.getElementById("session").addEventListener("click", function() {
    let token = localStorage.getItem('token');
    fetch('https://tjokvdi035.execute-api.eu-north-1.amazonaws.com/api/session', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch((error) => console.error('Error:', error));

    document.querySelector('.calender').style.display = 'block';
    document.querySelector('.calender').classList.add('fadeIn');
});

