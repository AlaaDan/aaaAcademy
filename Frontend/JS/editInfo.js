export async function changeUserInfo(firstName, lastName, email, token) {
    const url = 'https://tjokvdi035.execute-api.eu-north-1.amazonaws.com/api/auth/changeInfo';
    let body = {};

    if (firstName) body.firstName = firstName;
    if (lastName) body.lastName = lastName;
    if (email) body.email = email;

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // assuming you're using Bearer token for authentication
        },
        body: JSON.stringify(body)
    };

    const response = await fetch(url, options);
    const data = await response.json();
    console.log(data);

    if (!response.ok) {
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
        let token = localStorage.getItem('token');
        let firstName = document.getElementById('firstName').value;
        let lastName = document.getElementById('lastName').value;
        let email = document.getElementById('email').value;
        console.log(token)

        try {
            let data = await changeUserInfo( firstName, lastName, email, token);
            console.log(data);
        } catch (error) {
            console.error(error);
        }
    }
});
