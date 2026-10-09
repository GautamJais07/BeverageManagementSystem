const API_BASE_URL =
    "http://127.0.0.1:8000/api";


async function api(
    endpoint,
    options = {}
) {

    const token =
        localStorage.getItem("token");


    const headers = {

        "Content-Type":
            "application/json",

        ...(options.headers || {})

    };


    if (token) {

        headers["Authorization"] =
            "Token " + token;

    }


    const response =
        await fetch(
            API_BASE_URL + endpoint,
            {
                ...options,
                headers: headers
            }
        );


    if (response.status === 204) {

        return null;

    }


    let data = {};

    try {

        data =
            await response.json();

    } catch {

        data = {};

    }


    if (response.status === 401) {

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "user"
        );

        window.location.href =
            "login.html";

        throw new Error(
            "Please login again."
        );
    }


    if (!response.ok) {

        let message =
            "Something went wrong.";


        if (data.detail) {

            message =
                data.detail;

        }

        else if (data.error) {

            message =
                data.error;

        }

        else if (data.message) {

            message =
                data.message;

        }

        else if (
            typeof data === "object"
        ) {

            const errors =
                Object.values(data)
                    .flat()
                    .join(" ");

            if (errors) {

                message =
                    errors;

            }

        }


        throw new Error(message);

    }


    return data;
}


function isLoggedIn() {

    return !!localStorage.getItem(
        "token"
    );

}


function requireLogin() {

    if (!isLoggedIn()) {

        window.location.href =
            "login.html";

    }

}


function getCurrentUser() {

    const value =
        localStorage.getItem("user");


    if (!value) {

        return null;

    }


    try {

        return JSON.parse(value);

    } catch {

        return null;

    }

}


/**
 * Checks whether the logged-in user's role is one of the allowed
 * roles passed in, e.g. requireRole("ADMIN", "MANAGER").
 * Returns true/false - it does NOT redirect by itself, so pages
 * that use it decide what to do (usually: throw/block the page).
 */
function requireRole(...allowedRoles) {

    const user = getCurrentUser();

    if (!user) {
        return false;
    }

    return allowedRoles.includes(user.role);

}

function roleInitial(role) {
    switch (role) {
        case "ADMIN":   return "A";
        case "MANAGER": return "M";
        case "STAFF":   return "S";
        default:        return "U";
    }
}

// Maps a role code to the friendly label shown under the user's name.
function roleLabel(role) {
    switch (role) {
        case "ADMIN":   return "Admin";
        case "MANAGER": return "Beverage Manager";
        case "STAFF":   return "Staff";
        default:        return "";
    }
}


function displayUser() {

    const user =
        getCurrentUser();


    if (!user) {

        return;

    }


    document
        .querySelectorAll("[data-user]")
        .forEach(element => {

            element.textContent =
                user.full_name ||
                user.username;

        });


    document
        .querySelectorAll(
            "[data-role-display]"
        )
        .forEach(element => {

            element.textContent =
                user.role || "";

        });

}


function setupNav() {

    const user =
        getCurrentUser();


    if (!user) {

        return;

    }


    const role =
        user.role;


    document
        .querySelectorAll("[data-role]")
        .forEach(element => {

            const roles =
                element
                    .getAttribute(
                        "data-role"
                    )
                    .split(",")
                    .map(
                        value =>
                            value.trim()
                    );


            if (
                !roles.includes(role)
            ) {

                element.style.display =
                    "none";

            }

        });


    displayUser();

}


async function logout() {

    try {

        if (isLoggedIn()) {

            await api(
                "/auth/logout/",
                {
                    method: "POST"
                }
            );

        }

    } catch(error) {

        console.error(
            error
        );

    }


    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "user"
    );


    window.location.href =
        "login.html";
}


document.addEventListener(
    "DOMContentLoaded",
    function() {

        document
            .querySelectorAll(
                "[data-logout]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    function(event) {

                        event.preventDefault();

                        logout();

                    }
                );

            });

    }
    
);

