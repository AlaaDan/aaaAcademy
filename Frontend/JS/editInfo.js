import { displayProfile } from "./profile.js";
export async function changeUserInfo(event, firstName, lastName, email) {
    const url = 'https://tjokvdi035.execute-api.eu-north-1.amazonaws.com/api/auth/changeInfo';
    let body = {};
    //body.userName = event.userName;
    if (firstName) body.firstName = firstName;
    if (lastName) body.lastName = lastName;
    if (email) body.email = email;
    //console.log(event.token);

    const options = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${event.token}` // assuming you're using Bearer token for authentication
        },
        body: JSON.stringify(body)
    };

    const response = await fetch(url, options);
    //console.log("TEST")
    const data = await response.json();
    //console.log("Error",data);

    if (!response.ok) {
        //console.log("Error",data);
        throw new Error(data.error);
        
    }

    return data;
}

// When clicking on the edit info button, display the edit form, and hide the profile info
document.querySelector('.main').addEventListener('click', (e) => {
    if (e.target.id === 'edit') {
        let userInfo = JSON.parse(localStorage.getItem('userInfo'));
        displayEditForm();
    }
});

// Create the form for editing user info
export function displayEditForm() {
    let main = document.querySelector('.main');
    let close = document.querySelector('.close_login_form');

    main.innerHTML = `
    <h6 class="user_info-h4">Edit info</h6>
    <div class="edit_info">
        <input type="text" id="firstName" placeholder="First Name">
        <input type="text" id="lastName" placeholder="Last Name">
        <input type="email" id="email" placeholder="Email">
        <button id="submit" class="user_info">Submit</button>
        <button id="cancel" class="user_info">Cancel</button>
    </div>
    `;
    main.appendChild(close);
    main.classList.remove('slideDown');
    main.classList.add('fadeIn')
}

// When clicking on the submit button, call the changeUserInfo function
document.querySelector('.main').addEventListener('click', async (e) => {
    if (e.target.id === 'submit') {
        e.stopPropagation(); // Stop the click event from propagating up to the document level

        let token = localStorage.getItem('token');
        let firstName = document.getElementById('firstName').value;
        let lastName = document.getElementById('lastName').value;
        let email = document.getElementById('email').value;

        // Create an event object
        let event = {
            userName: localStorage.getItem('username'),
            token: token
        };

        try {
            let data = await changeUserInfo(event, firstName, lastName, email);

            // If the request is successful, update the local storage
            let userInfo = JSON.parse(localStorage.getItem('userInfo'));
            if (firstName) userInfo.firstName = firstName;
            if (lastName) userInfo.lastName = lastName;
            if (email) userInfo.email = email;
            localStorage.setItem('userInfo', JSON.stringify(userInfo));

            // Display a success message
            let main = document.querySelector('.edit_info');
            main.innerHTML = '<p>Info has been updated successfully!</p>';

            // Wait for 1 second, then fade back to the profile
            setTimeout(() => {
                main.style.transition = 'opacity 1s';
                //main.style.opacity = 0;
                setTimeout(() => {
                    // Display the profile here
                    // You need to implement the displayProfile function
                    displayProfile(userInfo);
                    main.style.transition = 'opacity 1s';
                    //main.style.opacity = 1;
                }, 1000);
            }, 1000);
        } catch (error) {
            console.error(error);
        }
    }
});

// Closes the edit form when clicking on the cancel button
document.addEventListener('click', function(e) {
    let main = document.querySelector('.main');
    let button = document.getElementById('login-form');
    let submitButton = document.getElementById('submit');
    let editButton = document.getElementById('edit'); // Get the 'edit' button

    // Check if the clicked target is outside of the .main element and not the 'submit' button or within the 'edit' button
    if (!main.contains(e.target) && e.target !== submitButton && !editButton.contains(e.target)) {
        // Close the .main element
        main.style.display = 'none';
    }

    // Check if the clicked target is the button
    if (button.contains(e.target)) {
        // Open the .main element
        main.style.display = 'block';
    }
});
