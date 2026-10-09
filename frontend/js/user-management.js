document.addEventListener(
    "DOMContentLoaded",
    function () {

        // -----------------------------------------
        // LOGIN CHECK
        // -----------------------------------------

        requireLogin();


        // -----------------------------------------
        // ADMIN CHECK
        // -----------------------------------------

        const user = getCurrentUser();

        if (!user || user.role !== "ADMIN") {

            alert(
                "Access denied. Only Admin can manage users."
            );

            window.location.href =
                "dashboard.html";

            return;
        }


        const form =
            document.getElementById(
                "userForm"
            );

        const message =
            document.getElementById(
                "message"
            );

        const usersTable =
            document.getElementById(
                "usersTable"
            );

        const createButton =
            document.getElementById(
                "createButton"
            );


        // -----------------------------------------
        // SHOW MESSAGE
        // -----------------------------------------

        function showMessage(
            text,
            type
        ) {

            message.textContent =
                text;

            message.className =
                "message " + type;

        }


        // -----------------------------------------
        // LOAD USERS
        // -----------------------------------------

        async function loadUsers() {

            try {

                const data =
                    await api(
                        "/auth/users/"
                    );

                usersTable.innerHTML =
                    "";

                data.users.forEach(
                    function (user) {

                        const row =
                            document.createElement(
                                "tr"
                            );


                        const deleteButton =
                            user.role === "ADMIN"

                                ? "<span>Protected</span>"

                                : `
                                    <button
                                        class="delete-btn"
                                        data-id="${user.id}"
                                    >
                                        Delete
                                    </button>
                                `;


                        row.innerHTML = `

                            <td>
                                ${user.full_name}
                            </td>

                            <td>
                                ${user.username}
                            </td>

                            <td>
                                ${user.email}
                            </td>

                            <td>
                                ${user.role}
                            </td>

                            <td>
                                ${
                                    user.is_active
                                        ? "Active"
                                        : "Inactive"
                                }
                            </td>

                            <td>
                                ${deleteButton}
                            </td>

                        `;


                        usersTable.appendChild(
                            row
                        );

                    }
                );


                // ---------------------------------
                // DELETE BUTTONS
                // ---------------------------------

                document
                    .querySelectorAll(
                        ".delete-btn"
                    )
                    .forEach(
                        function (button) {

                            button.addEventListener(
                                "click",
                                function () {

                                    const userId =
                                        this.dataset.id;

                                    deleteUser(
                                        userId
                                    );

                                }
                            );

                        }
                    );

            }

            catch (error) {

                console.error(
                    error
                );

                showMessage(
                    error.message,
                    "error"
                );

            }

        }


        // -----------------------------------------
        // CREATE USER
        // -----------------------------------------

        form.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const fullName =
                    document
                        .getElementById(
                            "full_name"
                        )
                        .value
                        .trim();


                const username =
                    document
                        .getElementById(
                            "username"
                        )
                        .value
                        .trim();


                const email =
                    document
                        .getElementById(
                            "email"
                        )
                        .value
                        .trim();


                const password =
                    document
                        .getElementById(
                            "password"
                        )
                        .value;


                const confirmPassword =
                    document
                        .getElementById(
                            "confirm_password"
                        )
                        .value;


                const role =
                    document
                        .getElementById(
                            "role"
                        )
                        .value;


// -----------------------------------------
// NAME VALIDATION
// -----------------------------------------

const namePattern =
    /^[A-Za-z]+(?:\s+[A-Za-z]+)*$/;


if (!namePattern.test(fullName)) {

    showMessage(
        "Name must contain letters and spaces only.",
        "error"
    );

    return;

}


// -----------------------------------------
// EMAIL VALIDATION
// -----------------------------------------

const emailPattern =
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;


if (!emailPattern.test(email)) {

    showMessage(
        "Please enter a valid email address.",
        "error"
    );

    return;

}


// -----------------------------------------
// PASSWORD LENGTH
// -----------------------------------------

if (password.length < 8) {

    showMessage(
        "Password must contain at least 8 characters.",
        "error"
    );

    return;

}


// -----------------------------------------
// UPPERCASE
// -----------------------------------------

if (!/[A-Z]/.test(password)) {

    showMessage(
        "Password must contain at least one uppercase letter.",
        "error"
    );

    return;

}


// -----------------------------------------
// LOWERCASE
// -----------------------------------------

if (!/[a-z]/.test(password)) {

    showMessage(
        "Password must contain at least one lowercase letter.",
        "error"
    );

    return;

}


// -----------------------------------------
// NUMBER
// -----------------------------------------

if (!/[0-9]/.test(password)) {

    showMessage(
        "Password must contain at least one number.",
        "error"
    );

    return;

}


// -----------------------------------------
// SPECIAL CHARACTER
// -----------------------------------------

if (!/[^A-Za-z0-9]/.test(password)) {

    showMessage(
        "Password must contain at least one special character.",
        "error"
    );

    return;

}


// -----------------------------------------
// CONFIRM PASSWORD
// -----------------------------------------

if (password !== confirmPassword) {

    showMessage(
        "Passwords do not match.",
        "error"
    );

    return;

}


                if (
                    password !==
                    confirmPassword
                ) {

                    showMessage(
                        "Passwords do not match.",
                        "error"
                    );

                    return;

                }


                createButton.disabled =
                    true;


                try {

                    const data =
                        await api(
                            "/auth/users/",
                            {
                                method: "POST",

                                body:
                                    JSON.stringify({

                                        full_name:
                                            fullName,

                                        username:
                                            username,

                                        email:
                                            email,

                                        password:
                                            password,

                                        confirm_password:
                                            confirmPassword,

                                        role:
                                            role

                                    })
                            }
                        );


                    showMessage(
                        data.message ||
                        "User created successfully.",
                        "success"
                    );


                    form.reset();


                    loadUsers();

                }

                catch (error) {

                    console.error(
                        error
                    );

                    showMessage(
                        error.message,
                        "error"
                    );

                }

                finally {

                    createButton.disabled =
                        false;

                }

            }
        );


        // -----------------------------------------
        // DELETE USER
        // -----------------------------------------

        async function deleteUser(
            userId
        ) {

            const confirmed =
                confirm(
                    "Are you sure you want to delete this user?"
                );


            if (!confirmed) {
                return;
            }


            try {

                const data =
                    await api(
                        `/auth/users/${userId}/`,
                        {
                            method: "DELETE"
                        }
                    );


                showMessage(
                    data.message ||
                    "User deleted successfully.",
                    "success"
                );


                loadUsers();

            }

            catch (error) {

                console.error(
                    error
                );

                showMessage(
                    error.message,
                    "error"
                );

            }

        }


        // -----------------------------------------
        // INITIAL LOAD
        // -----------------------------------------

        loadUsers();

    }
);