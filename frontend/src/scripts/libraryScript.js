import MPDBClient from "../../../js-lib/src/mpdbjs.js";

document.addEventListener("DOMContentLoaded", async () => {
    const apiUrl = "http://localhost:3000";
    const client = new MPDBClient(apiUrl);

    try {
        // Fetch real databases
        const response = await client.getDatabases(localStorage.getItem('apiKey'));
        console.log("API Response:", response);

        if (response.status !== 200) {

            throw new Error(response.message);
        }

        // Process database data
        const databases = response.data || [];
        
        // Separate owned vs saved databases
        
        const ownedDatabases = databases.filter(db => db.owner === currentUserId);
        const savedDatabases = databases.filter(db => db.owner !== currentUserId);

        // Load the library
        loadLibrary(ownedDatabases, savedDatabases);

    } catch (error) {
        console.error("Error loading databases:", error);
        // Show error to user
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = "User doesnt have databases yet ...";
        document.querySelector('.library-container').prepend(errorElement);
    }

    function loadLibrary(ownedDbs, savedDbs) {
        const ownedGrid = document.getElementById("ownedGrid");
        const savedGrid = document.getElementById("savedGrid");

        // Clear previous content
        ownedGrid.innerHTML = '';
        savedGrid.innerHTML = '';

        // Load owned databases
        if (ownedDbs.length === 0) {
            ownedGrid.appendChild(createEmptyCard("owned"));
        } else {
            ownedDbs.forEach(db => {
                ownedGrid.appendChild(createDatabaseCard(db, true));
            });
        }

        // Load saved databases
        if (savedDbs.length === 0) {
            savedGrid.appendChild(createEmptyCard("saved"));
        } else {
            savedDbs.forEach(db => {
                savedGrid.appendChild(createDatabaseCard(db, false));
            });
        }
    }

    function createDatabaseCard(db, isOwned) {
        const card = document.createElement("div");
        card.className = "database-card";
        card.innerHTML = `
            <div class="db-header">
                <h3>${db.name}</h3>
                <span class="db-status ${db.isPublic ? 'public' : 'private'}">
                    ${db.isPublic ? 'Public' : 'Private'}
                </span>
            </div>
            <p class="db-description">${db.description || "No description available"}</p>
            <div class="db-footer">
                <span class="db-date">Created: ${formatDate(db.createdAt)}</span>
                ${isOwned ? '<span class="db-owner-badge">Owned</span>' : ''}
            </div>
        `;
        card.onclick = () => openDatabase(db._id);
        return card;
    }

    function createEmptyCard(type) {
        const card = document.createElement("div");
        card.className = "database-card empty-card";
        card.innerHTML = `
            <div class="empty-card-content">
                <div class="plus-icon">+</div>
                <h3>Create New ${type === "owned" ? "Database" : "Saved View"}</h3>
            </div>
        `;
        card.onclick = () => window.location.href = type === "owned" ? "CreateDatabase.html" : "SaveDatabase.html";
        return card;
    }

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    function openDatabase(id) {
        console.log("Opening database:", id);
        window.location.href = `database.html?id=${id}`;
    }
});