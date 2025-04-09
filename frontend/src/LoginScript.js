document.addEventListener("DOMContentLoaded", function () {
    document.querySelector("form").addEventListener("submit", async function (event) {
      event.preventDefault(); // Prevent default form submission

      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      const apiUrl = "http://localhost:3000/login"; 

      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            payload: {
              username: username, 
              password: password
            }
          })
        });

        const result = await response.json();

        if (response.ok) {
          alert("Login successful!");
          window.location.href = "landing.html"; 
        } else {
          alert(result.error || "Login failed. Please check your credentials.");
        }
      } catch (error) {
        console.error("Error logging in:", error);
        alert("Something went wrong. Please try again.");
      }
    });
  });