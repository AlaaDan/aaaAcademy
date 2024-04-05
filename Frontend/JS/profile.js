// profile.js
let menu_login = document.getElementById('login-form');
let main = document.querySelector('.main');
import { displayChangePasswordForm } from './passChange.js';


menu_login.addEventListener('click', function() {
    let token = localStorage.getItem('token');
    if (token) {
        try {
            let userInfo = JSON.parse(localStorage.getItem('userInfo')); // Retrieve user info from local storage
            displayProfile(userInfo);
        } catch (error) {
            console.error('Error parsing user info:', error);
        }
    }
});

document.querySelector('.close_login_form').addEventListener('click', hideProfile);

export function displayProfile(userInfo) {
    let close = document.querySelector('.close_login_form');
    if (main && userInfo) {
        main.style.display = 'block';
        main.innerHTML = `
        <h4 class="user_info-h4">Profile</h4>
        <div class="main-2">
            <h3 class="user_info-h3">Hello!</h3>
            <p class="user_info"> ${userInfo.firstName} ${userInfo.lastName}</p>
            <p class="user_info"> ${userInfo.email}</p>
            <p class="user_info"> Balance: $(WIP)</p>
            <button class="user_info" id="edit">Edit info</button>
            <button class="user_info" id="changePassword">Change Password</button>
            <button id="logout" class="user_info">Logout</button>
            </div>
            `;
        main.appendChild(close);
        main.classList.remove('slideUp'); // Remove the slideUp class
        main.classList.add('slideDown'); // Add the slideDown class
        const changePasswordButton = document.getElementById('changePassword');
        if (changePasswordButton) {
            changePasswordButton.addEventListener('click', displayChangePasswordForm);
        } else {
            console.error("Element with id 'changePassword' not found");
        }

    }
}

export function hideProfile() {
    main.classList.remove('slideDown'); // Remove the slideDown class
    main.classList.add('slideUp'); // Add the slideUp class

    // Define the animationend event handler
    let handleAnimationEnd = () => {
        // Set the display property to 'none' when the animation has completed
        main.style.display = 'none';
        // Remove the slideUp class so the slideDown animation can run the next time the form is displayed
        main.classList.remove('slideUp');
        // Remove the animationend event listener
        main.removeEventListener('animationend', handleAnimationEnd);
    };

    // Listen for the animationend event
    main.addEventListener('animationend', handleAnimationEnd);
}
