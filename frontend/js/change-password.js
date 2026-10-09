document.addEventListener("DOMContentLoaded", function () {

    const form =
        document.getElementById(
            "changePasswordForm"
        );

    const msg =
        document.getElementById("msg");

    const changePasswordButton =
        document.getElementById(
            "changePasswordButton"
        );


    if (!form) {

        console.error(
            "changePasswordForm was not found"
        );

        return;
    }


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const currentPassword =
                document.getElementById(
                    "current_password"
                ).value;

            const newPassword =
                document.getElementById(
                    "new_password"
                ).value;

            const confirmPassword =
                document.getElementById(
                    "confirm_password"
                ).value;


            // =========================================
            // VALIDATION FIRST
            // =========================================

            if (
                newPassword !==
                confirmPassword
            ) {

                msg.textContent =
                    "New password and confirm password do not match.";

                msg.style.display =
                    "block";

                return;
            }


            // =========================================
            // START LOADING
            // =========================================

            changePasswordButton.disabled =
                true;

            changePasswordButton.classList.add(
                "btn-loading"
            );

            changePasswordButton.innerHTML =
                '<span class="loading-spinner"></span> Changing Password...';


            try {

                await api(
                    "/auth/change-password/",
                    {

                        method: "POST",

                        body:
                            JSON.stringify({

                                current_password:
                                    currentPassword,

                                new_password:
                                    newPassword,

                                confirm_password:
                                    confirmPassword

                            })

                    }
                );


                msg.textContent =
                    "Password changed successfully. Redirecting to login...";

                msg.style.display =
                    "block";


                // Keep button disabled during redirect

                setTimeout(
                    () => {

                        window.location.href =
                            "login.html";

                    },
                    1500
                );

            }


            catch (error) {

                msg.textContent =
                    error.message ||
                    "Could not change password.";

                msg.style.display =
                    "block";


                // =====================================
                // ENABLE BUTTON AGAIN AFTER ERROR
                // =====================================

                changePasswordButton.disabled =
                    false;

                changePasswordButton.classList.remove(
                    "btn-loading"
                );

                changePasswordButton.innerHTML =
                    "Change Password";

            }

        }
    );

});
