const loadButton = document.querySelector("#load-users");
const filterInput = document.querySelector("#filter-input");
const status = document.querySelector("#status");
const usersList = document.querySelector("#users-list");

let users = [];


/*
 * Loads users from the API.
 */
async function loadUsers() {
    loadButton.disabled = true;
    status.textContent = "Loading users...";

    try {
        const response = await fetch(
            "https://jsonplaceholder.typicode.com/users"
        );

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        users = await response.json();

        renderUsers(users);

        status.textContent = `${users.length} users loaded successfully.`;
    } catch (error) {
        status.textContent = "Failed to load users.";
        usersList.textContent = "";
        console.error(error);
    } finally {
        loadButton.disabled = false;
    }
}


/*
 * Draws any array of users on the page.
 */
function renderUsers(list) {
    usersList.textContent = "";

    if (list.length === 0) {
        status.textContent = "No users match your filter.";
        return;
    }

    list.forEach(function (user) {
        const listItem = document.createElement("li");

        const name = document.createElement("h2");
        name.textContent = user.name;

        const email = document.createElement("p");
        email.textContent = `Email: ${user.email}`;

        const city = document.createElement("p");
        city.textContent = `City: ${user.address.city}`;

        const company = document.createElement("p");
        company.textContent = `Company: ${user.company.name}`;

        listItem.appendChild(name);
        listItem.appendChild(email);
        listItem.appendChild(city);
        listItem.appendChild(company);

        usersList.appendChild(listItem);
    });
}


/*
 * Load users when the button is clicked.
 */
loadButton.addEventListener("click", loadUsers);


/*
 * Filter the already-loaded users whenever
 * the user types in the filter box.
 */
filterInput.addEventListener("input", function () {
    const searchText = filterInput.value.toLowerCase();

    const filteredUsers = users.filter(function (user) {
        return user.name.toLowerCase().includes(searchText);
    });

    renderUsers(filteredUsers);
});