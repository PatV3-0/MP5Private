import MPDBClient from "../../../js-lib/src/mpdbjs.js";

document.addEventListener("DOMContentLoaded", () => {
    const apiUrl = "http://localhost:3000";
    const client = new MPDBClient(apiUrl);

  const form = document.querySelector('.form-section');
  form.addEventListener('submit', async (event) => {
      await handleFormSubmit(event, client);
  });

});

async function handleFormSubmit(event, client) {
  event.preventDefault();

  // Grab all the form fields
  const userData = {
      username: document.querySelector('#username').value,
      name: document.querySelector('#firstname').value,
      surname: document.querySelector('#lastname').value,
      email: document.querySelector('#email').value,
      password: document.querySelector('#password').value,
      profileImage: null // Optional profile image
  };

  try {
      // Use the MPDBClient's register method
      const response1 = await client.getAPIKey(username,password,email);
      const response = await client.register(userData);
      console.log(response1.data);
      localStorage.setItem('apiKey', response1.data);
      
      if (response.status === 200) {
          console.log('Registration successful:', response.data);
          window.location.href = "/frontend/src/library.html";
          
      } else {
          // Handle specific error messages from your API
          const errorMsg = response.data?.error || 'Registration failed';
          alert(errorMsg);
      }
  } catch (error) {
      console.error('Registration error:', error);
      alert(error.message || 'An error occurred during registration.');
  }
}