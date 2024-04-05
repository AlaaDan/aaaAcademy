// export async function changPassword(event, password, newPassword, retypePassword) {
//     const url = '';
//     let body = {
//         password: password,
//         newPassword: newPassword,
//         retypePassword: retypePassword
//     };


//     const options = {
//         method: 'PUT',
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${event.token}` // assuming you're using Bearer token for authentication
//         },
//         body: JSON.stringify(body)
//     };

//     const response = await fetch(url, options);
//     //console.log("TEST")
//     const data = await response.json();
//     //console.log("Error",data);

//     if (!response.ok) {
//         //console.log("Error",data);
//         throw new Error(data.error);
        
//     }

//     return data;
// }


// export function displayPassForm() {
//     let main = document.querySelector('.main');
//     let close = document.querySelector('.close_login_form');

//     main.innerHTML = `
//     <h6 class="user_info-h4">Change password</h6>
//     <div class="edit_info">
//         <input type="password" id="currentPass" placeholder="Current Password">
//         <input type="password" id="newPassword" placeholder="New password">
//         <input type="password" id="retypePassword" placeholder="Confirm Password">
//         <button id="submit" class="user_info">Submit</button>
//         <button id="cancel" class="user_info">Cancel</button>
//     </div>
//     `;
//     main.appendChild(close);
//     main.classList.remove('slideDown');
//     main.classList.add('fadeIn')
// }

// document.querySelector('.main').addEventListener('click', async (e) => {
//     if (e.target.id === 'submit') {
//         e.stopPropagation(); // Stop the click event from propagating up to the document level
//         let password = document.getElementById('password').value;
//         let newPassword = document.getElementById('newPassword').value;
//         let retypePassword = document.getElementById('confirmPassword').value;

//         try {
//             let data = await changPassword(event, password, newPassword, retypePassword);

//             // Display a success message
//             let main = document.querySelector('.edit_info');
//             main.innerHTML = `<p>${data}</p>`;

//             // Wait for 1 second, then fade back to the profile
//             setTimeout(() => {
//                 main.style.transition = 'opacity 1s';
//                 //main.style.opacity = 0;
//                 setTimeout(() => {
//                     // Display the profile here
//                     // You need to implement the displayProfile function
//                     displayPassForm(userInfo);
//                     main.style.transition = 'opacity 1s';
//                     //main.style.opacity = 1;
//                 }, 1000);
//             }, 1000);
//         } catch (error) {
//             console.error(error);
//         }
//     }
// });


// // Closes the edit form when clicking on the cancel button
// document.addEventListener('click', function(e) {
//     let main = document.querySelector('.main');
//     let button = document.getElementById('login-form');
//     let submitButton = document.getElementById('submit');
//     let editButton = document.getElementById('edit'); // Get the 'edit' button

//     // Check if the clicked target is outside of the .main element and not the 'submit' button or within the 'edit' button
//     if (!main.contains(e.target) && e.target !== submitButton && !editButton.contains(e.target)) {
//         // Close the .main element
//         main.style.display = 'none';
//     }

//     // Check if the clicked target is the button
//     if (button.contains(e.target)) {
//         // Open the .main element
//         main.style.display = 'block';
//     }
// });



export function displayChangePasswordForm(event) {
    event.preventDefault();

    let main = document.querySelector('.main');
    let close = document.querySelector('.close_login_form');

    main.innerHTML = `
        <h6 class="changePass-h4">Change password</h6>
        <div class="edit_info">
            <input type="password" id="currentPass" placeholder="Current Password">
            <input type="password" id="newPassword" placeholder="New password">
            <input type="password" id="retypePassword" placeholder="Confirm Password">
            <button id="submit" class="user_info">Submit</button>
            <button id="cancel" class="user_info">Cancel</button>
        </div>
    `;
    main.appendChild(close);
    main.classList.remove('slideDown');
    main.classList.add('fadeIn')

    const submitButton = document.getElementById('submit');
    submitButton.addEventListener('click', submitChangePasswordForm);
}

export async function submitChangePasswordForm(event) {
    event.preventDefault();

    const currentPass = document.getElementById('currentPass').value;
    const newPassword = document.getElementById('newPassword').value;
    const retypePassword = document.getElementById('retypePassword').value;

    const response = await fetch('https://tjokvdi035.execute-api.eu-north-1.amazonaws.com/api/auth/changePassword', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
            password: currentPass,
            newPassword: newPassword,
            retypePassword: retypePassword
        })
    });

    handlePasswordChangeResponse(response);
}

export async function handlePasswordChangeResponse(response) {
    const data = await response.json();
    const main = document.querySelector('.main .edit_info');
    const oldMessageElement = document.querySelector('.main .edit_info .msg');
    const messageElement = document.createElement('p');

    // Remove the old error message if it exists
    if (oldMessageElement) {
        main.removeChild(oldMessageElement);
    }

    if (response.ok) {
        // Clear the form
        main.innerHTML = '';
        // Add the success message
        messageElement.textContent = data.msg;
        main.appendChild(messageElement);
    } else {
        // Add the error message under the buttons
        console.log('Error:', data);
        messageElement.textContent = data.msg ? data.msg : data;
        messageElement.classList.add('msg')
        main.appendChild(messageElement);
        document.getElementById('submit').classList.add('buzz-animation')
    }
}