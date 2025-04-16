document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.form-section'); // The signup form
  form.addEventListener('submit', handleFormSubmit);
});

async function handleFormSubmit(event) {
  event.preventDefault(); // Prevent default form submission

  // Grab all the form fields
  const username = document.querySelector('#username').value;
  const name = document.querySelector('#firstname').value;
  const surname = document.querySelector('#lastname').value;
  const email = document.querySelector('#email').value;
  const password = document.querySelector('#password').value;
  const profileImage = null; // Optional profile image

  // Prepare the payload for the API request
  const payload = {
    username,
    name,
    surname,
    email,
    password,
    profileImage,
  };

  try {
    const response = await fetch('http://localhost:3000/register', {
      method: 'POST', // HTTP method
      headers: {
        'Content-Type': 'application/json', // Sending data as JSON
      },
      body: JSON.stringify({ payload }), // Wrap payload in a JSON object
    });

    // Check if the request was successful
    if (response.ok) {
      const responseData = await response.json();
      alert('Registration successful!');
      console.log(responseData);
      window.location.href="login.html" ;// Handle the response, e.g., show a message, redirect, etc.
    } else {
      const errorData = await response.json();
      alert('Registration failed: ' + errorData.error); // Handle error response
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred during registration.');
  }
}
