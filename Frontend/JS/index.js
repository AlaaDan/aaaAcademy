import './navigation.js';
import { login} from './auth.js';
import { displayProfile, hideProfile } from './profile.js';
import { changeUserInfo } from './editInfo.js';
// Stop the logout text from disappering when the page is refreshed
window.addEventListener('DOMContentLoaded', (event) => {
    let token = localStorage.getItem('token');
    let menu_login = document.getElementById('login-form');
    if (token) {
        menu_login.textContent = localStorage.getItem('username');
    }
});

