const API_BASE_URL =
    "http://127.0.0.1:8000/api";


document.addEventListener(
    "DOMContentLoaded",
    function () {

        const loginForm =
            document.getElementById("loginForm");

        const messageBox =
            document.getElementById("msg");

        const loginButton =
            document.getElementById("loginButton");


        if (!loginForm) {

            console.error(
                "loginForm not found."
            );

            return;
        }


        loginForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const username =
                    document
                        .getElementById("username")
                        .value
                        .trim();


                const password =
                    document
                        .getElementById("password")
                        .value;


                messageBox.textContent = "";


                // =========================================
                // START LOADING
                // =========================================

                loginButton.disabled = true;

                loginButton.classList.add(
                    "btn-loading"
                );

                loginButton.innerHTML =
                    '<span class="loading-spinner"></span> Logging in...';


                try {

                    const response =
                        await fetch(
                            `${API_BASE_URL}/auth/login/`,
                            {

                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({

                                        username:
                                            username,

                                        password:
                                            password

                                    })

                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            data.detail ||
                            data.error ||
                            "Invalid username or password."
                        );

                    }


                    // =====================================
                    // SAVE TOKEN
                    // =====================================

                    localStorage.setItem(
                        "token",
                        data.token
                    );


                    // =====================================
                    // SAVE USER
                    // =====================================

                    localStorage.setItem(
                        "user",
                        JSON.stringify(
                            data.user
                        )
                    );


                    messageBox.className =
                        "auth-message success";


                    messageBox.textContent =
                        "Login successful. Opening dashboard...";


                    setTimeout(
                        function () {

                            window.location.href =
                                "dashboard.html";

                        },
                        500
                    );

                }

                catch (error) {

                    console.error(
                        "Login error:",
                        error
                    );


                    messageBox.className =
                        "auth-message error";


                    messageBox.textContent =
                        error.message ||
                        "Unable to connect to server.";


                    // =====================================
                    // ENABLE BUTTON AGAIN AFTER ERROR
                    // =====================================

                    loginButton.disabled = false;

                    loginButton.classList.remove(
                        "btn-loading"
                    );

                    loginButton.innerHTML =
                        "Login";

                }

            }
        );

    }
);