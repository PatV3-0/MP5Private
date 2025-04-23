// Initialize the MPDB client
const apiBaseUrl = "http://localhost:3000"; // Adjust this URL to match your API server
console.log("Initializing MPDB client with base URL:", apiBaseUrl);

let mpdbClient;
try {
  mpdbClient = new MPDBClient(apiBaseUrl);
  console.log("MPDB client initialized successfully");
} catch (error) {
  console.error("Failed to initialize MPDB client:", error);
}

// Store API key (in a real app, you would get this from login or local storage)
const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFsaWNlIiwiZW1haWwiOiJhbGljZUBleGFtcGxlLmNvbSIsImFkbWluIjpmYWxzZSwiZGF0ZSI6MTc0NDk2NDgzNTUxOSwiaWF0IjoxNzQ0OTY0ODM1LCJleHAiOjE3NDQ5Njc3MTV9.jAv09A8q3R3lqYFfNMyW8lcE5mLyt_z0e9iqT2LywSU";
console.log("Using API key:", apiKey.substring(0, 20) + "...");

// Fallback database data - use this if API calls fail
let fallbackUserDatabases = [
    { name: "Customer Data", description: "A database of customer information.", id: "db1" },
    { name: "Inventory", description: "Tracks product inventory levels.", id: "db2" },
    { name: "Sales Reports", description: "Sales performance data.", id: "db3" },
    { name: "HR Records", description: "Employee information database.", id: "db4" },
    { name: "Feedback", description: "Customer feedback collection.", id: "db5" }
];

// Template databases (these seem to be static examples)
let templateDatabases = [
    { name: "Project Tracker", description: "Manage tasks and projects." },
    { name: "Expense Reports", description: "Track business expenses." },
    { name: "Recipe Book", description: "Organize and share recipes." }
];

// Function to fetch user databases from the API
async function fetchUserDatabases() {
    try {
        console.log("Attempting to fetch user databases with API key");
        if (!mpdbClient) {
            throw new Error("MPDB client not initialized");
        }
        
        console.log("Calling mpdbClient.getDatabases()");
        const response = await mpdbClient.getDatabases(apiKey);
        console.log("Raw API response:", response);
        
        // Check if we have valid response data
        if (response && response.status === 200 && response.data) {
            console.log("Successfully parsed response data:", response.data);
            // Transform the API response into the format expected by your UI
            return response.data.map((db, index) => {
                return {
                    name: db.name || `Database ${index + 1}`,  // Corrected this line
                    description: db.description || "No description available",
                    id: db._id || `db${index + 1}`  // Corrected this line
                };
            });
        } else {
            console.error("Invalid database response format:", response);
            // Fall back to dummy data for testing
            console.log("Using fallback database data");
            return fallbackUserDatabases;
        }
    } catch (error) {
        console.error("Error fetching databases:", error);
        // For debugging - show details about the error
        let errorDetails = "Unknown error";
        if (error instanceof Error) {
            errorDetails = `${error.name}: ${error.message}`;
        }
        
        displayErrorMessage(`Failed to load your databases: ${errorDetails}. Using fallback data instead.`);
        
        // Return fallback data
        return fallbackUserDatabases;
    }
}

// Function to display error messages to the user
function displayErrorMessage(message) {
    console.error("Displaying error:", message);
    // Check if error container exists, if not create it
    let errorContainer = document.getElementById("errorContainer");
    if (!errorContainer) {
        errorContainer = document.createElement("div");
        errorContainer.id = "errorContainer";
        errorContainer.style.backgroundColor = "#ffcccc";
        errorContainer.style.color = "#cc0000";
        errorContainer.style.padding = "10px";
        errorContainer.style.borderRadius = "5px";
        errorContainer.style.margin = "10px 0";
        errorContainer.style.display = "none";
        
        // Insert at the top of the container
        const container = document.querySelector(".container");
        container.insertBefore(errorContainer, container.firstChild);
    }
    
    // Display the error message
    errorContainer.textContent = message;
    errorContainer.style.display = "block";
    
    // Auto-hide after 8 seconds
    setTimeout(() => {
        errorContainer.style.display = "none";
    }, 8000);
}

// Main function to load and display databases
async function loadDatabases() {
    console.log("Loading databases...");
    try {
        // Fetch user databases from API
        const userDatabases = await fetchUserDatabases();
        console.log("Processed user databases:", userDatabases);
        
        const dbCarousel = document.getElementById("databaseCarousel");
        const templateCarousel = document.getElementById("templateCarousel");
        const recentDbSection = document.getElementById("recentDatabase");
        const noDbSection = document.getElementById("noDatabases");
        const userDbSection = document.getElementById("userDatabases");

        if (userDatabases && userDatabases.length > 0) {
            console.log("Displaying user databases in UI");
            userDbSection.style.display = "block";
            dbCarousel.innerHTML = "";

            // Only show up to 4 databases
            const shownDatabases = userDatabases.slice(0, 4);
            shownDatabases.forEach(db => {
                let dbCard = document.createElement("div");
                dbCard.classList.add("database-card");
                dbCard.innerHTML = `<h3>${db.name}</h3><p>${db.description}</p>`;
                
            //     // Add delete button
            //     const deleteBtn = document.createElement("button");
            //     deleteBtn.textContent = "Delete";
            //     deleteBtn.classList.add("delete-btn");
            //     deleteBtn.style.marginTop = "10px";
            //     deleteBtn.style.padding = "5px 10px";
            //     deleteBtn.style.backgroundColor = "#f44336";
            //     deleteBtn.style.color = "white";
            //     deleteBtn.style.border = "none";
            //     deleteBtn.style.borderRadius = "4px";
                
            //     deleteBtn.onclick = (e) => {
            //         e.stopPropagation(); // Prevent card click when clicking delete
            //         if (confirm(`Are you sure you want to delete "${db.name}"?`)) {
            //             deleteUserDatabase(db.name);
            //         }
            //     };
            //     dbCard.appendChild(deleteBtn);
                
                // Set click handler for the card
                dbCard.onclick = () => {
                    console.log(`Navigating to database: ${db.id}`);
                    window.location.href = `/databases/${db.id}`;
                };
                dbCarousel.appendChild(dbCard);
             });

            // Set Recently Worked On (first DB as example)
            let recentDb = userDatabases[0];
            document.getElementById("recentDbName").textContent = recentDb.name;
            document.getElementById("recentDbDescription").textContent = recentDb.description;
            document.getElementById("openRecentDb").onclick = () => {
                console.log(`Opening recent database: ${recentDb.id}`);
                window.location.href = `/databases/${recentDb.id}`;
            };
            recentDbSection.style.display = "block";
            noDbSection.style.display = "none";
        } else {
            // No databases, show the create section
            console.log("No databases found, showing creation UI");
            noDbSection.style.display = "block";
            userDbSection.style.display = "none";
            recentDbSection.style.display = "none";
        }

        // Load templates (static data)
        console.log("Loading template databases");
        templateCarousel.innerHTML = "";
        templateDatabases.forEach(template => {
            let templateCard = document.createElement("div");
            templateCard.classList.add("database-card");
            templateCard.innerHTML = `<h3>${template.name}</h3><p>${template.description}</p>`;
            templateCard.onclick = () => {
                console.log(`Template selected: ${template.name}`);
                if (confirm(`Would you like to create a new database using the ${template.name} template?`)) {
                    createNewDatabase(template.name);
                }
            };
            templateCarousel.appendChild(templateCard);
        });
    } catch (error) {
        console.error("Error in loadDatabases:", error);
        displayErrorMessage("Failed to load database information. Please check the console for details.");
    }
}

// Function to create a new database
async function createNewDatabase(dbName) {
    console.log(`Creating new database: ${dbName}`);
    try {
        const response = await mpdbClient.createDatabase(dbName, apiKey);
        console.log("Database creation response:", response);
        
        if (response && response.status === 200) {
            // Refresh the database list after creation
            await loadDatabases();
            return true;
        } else {
            displayErrorMessage("Failed to create database. " + (response.error || ""));
            return false;
        }
    } catch (error) {
        console.error("Error creating database:", error);
        displayErrorMessage("Failed to create database: " + error.message);
        return false;
    }
}

// // Function to delete a database
// async function deleteUserDatabase(dbName) {
//     console.log(`Deleting database: ${dbName}`);
//     try {
//         const response = await mpdbClient.deleteDatabase(dbName, apiKey);
//         console.log("Database deletion response:", response);
        
//         if (response && response.status === 200) {
//             // Refresh the database list after deletion
//             await loadDatabases();
//             return true;
//         } else {
//             displayErrorMessage("Failed to delete database. " + (response.error || ""));
//             return false;
//         }
//     } catch (error) {
//         console.error("Error deleting database:", error);
//         displayErrorMessage("Failed to delete database: " + error.message);
//         return false;
//     }
// }

// Button handlers
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM content loaded, setting up event handlers");
    
    // Create database button
    const createDbBtn = document.getElementById("createDatabase");
    if (createDbBtn) {
        createDbBtn.onclick = () => {
            console.log("Create database button clicked");
            const dbName = prompt("Enter a name for your new database:");
            if (dbName) {
                createNewDatabase(dbName);
            }
        };
    }

    // View all button
    const viewAllBtn = document.getElementById("viewAllBtn");
    if (viewAllBtn) {
        viewAllBtn.onclick = () => {
            console.log("View all button clicked");
            window.location.href = "Library.html";
        };
    }

    // Load everything on page load
    console.log("Initiating database loading");
    loadDatabases();
});