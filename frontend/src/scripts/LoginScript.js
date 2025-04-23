import MPDBClient from "../../../js-lib/src/mpdbjs.js";

document.addEventListener("DOMContentLoaded", () => {
    const apiUrl = "http://localhost:3000";
    const client = new MPDBClient(apiUrl);

    document.getElementById("loginForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const errorElement = document.getElementById("errorMessage");

        try {
            errorElement.textContent = ""; // Clear previous errors
            
            // 1. Login the user
            const loginResponse = await client.login(username, password);
            console.log("Login response:", loginResponse);

            // Check if login was successful
            if (loginResponse.message === 'You have successfully logged in!') {
                // Save the apiKey to localStorage
                localStorage.setItem('apiKey', loginResponse.data.apiKey);

                // Redirect after successful login
                window.location.href = "/frontend/src/library.html";
            } else {
                // Handle failed login with clean message
                errorElement.textContent = "User login details incorrect";
            }
        } catch (error) {
            console.error("Login error:", error);
            // Handle different error cases
            if (error.message.includes("401")) {
                errorElement.textContent = "User login details incorrect";
            } else {
                errorElement.textContent = "Login failed. Please try again.";
            }
        }
    });
});