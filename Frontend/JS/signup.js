export async function signupUser() {

    let userName = document.querySelector('input[name="userName"]').value;
    let email = document.querySelector('input[name="email"]').value;
    let password = document.getElementById('signup-pass').value;
    let firstName = document.querySelector('input[name="firstName"]').value;
    let lastName = document.querySelector('input[name="lastName"]').value;


    let url = 'https://tjokvdi035.execute-api.eu-north-1.amazonaws.com/api/auth/signup';

    try {
        let response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                firstName: firstName,
                lastName: lastName,
                userName: userName,
                password: password,
                email: email
                
            })
        });

        let data = await response.json();

        console.log('Response from server:', data); // print the entire response from the server
        if (response.ok) {
            // Signup successful
            console.log('Signup successful:', data);
            let form = document.querySelector('.signup form');
            while (form.children.length > 1) {
                form.removeChild(form.lastChild);
            }
            let messageElement = document.createElement('p');
            form.appendChild(messageElement).textContent = "Account is under review by an admin. You will receive an email when your account is approved";
            document.querySelector('.signup p').classList.add('msg');
        } else {
            // Signup unsuccessful
            console.log('Signup unsuccessful:', data);
            let form = document.querySelector('.signup form');
            let messageElement = form.querySelector('.signup p');
            if (messageElement) {
                form.removeChild(messageElement);
            }
            let newMessageElement = document.createElement('p');
            newMessageElement.classList.add('msg');
            newMessageElement.textContent = data.msg ? data.msg : data;
            form.appendChild(newMessageElement);
            document.getElementById('signup').classList.add('buzz-animation')
            
        }
        
    } catch (error) {
        console.error('Error:', error);
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('signup').addEventListener('click', function(event) {
        console.log('Signup button clicked')
        event.preventDefault(); // prevent the form from submitting normally
        signupUser();
    });
});