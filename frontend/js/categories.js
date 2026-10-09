/* =====================================================
   CATEGORY MANAGEMENT
===================================================== */

requireLogin();
setupNav();


/* =====================================================
   VARIABLES
===================================================== */

let allCategories = [];

let displayedCategories = [];


/* =====================================================
   GET ELEMENTS
===================================================== */

const searchInput =
    document.getElementById("search");

const searchButton =
    document.getElementById("searchButton");

const clearButton =
    document.getElementById("clearButton");

const rowsElement =
    document.getElementById("rows");

const categoryForm =
    document.getElementById("f");

const idInput =
    document.getElementById("id");

const categoryNameInput =
    document.getElementById("category_name");

const descriptionInput =
    document.getElementById("description");

const formTitle =
    document.getElementById("formTitle");

const cancelButton =
    document.getElementById("cancelButton");


/* =====================================================
   LOAD ALL CATEGORIES
===================================================== */

async function loadCategories() {

    try {

        console.log(
            "Loading all categories..."
        );


        /*
         * Get all categories from Django.
         *
         * IMPORTANT:
         * We are NOT sending ?search here.
         *
         * We get everything first and then
         * search using JavaScript.
         */

        const response =
            await api("/categories/");


        console.log(
            "API response:",
            response
        );


        /*
         * Make sure response is an array.
         */

        if (
            Array.isArray(response)
        ) {

            allCategories =
                response;

        }

        else {

            console.error(
                "Category API did not return an array:",
                response
            );

            allCategories = [];

        }


        /*
         * Initially show all categories.
         */

        displayedCategories =
            [...allCategories];


        renderCategories();


    }

    catch (error) {

        console.error(
            "Loading categories failed:",
            error
        );


        rowsElement.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="empty-state"
                >

                    Failed to load categories.

                    <br><br>

                    ${escapeHtml(
                        error.message ||
                        "Unknown error"
                    )}

                </td>

            </tr>

        `;

    }

}


/* =====================================================
   RENDER CATEGORIES
===================================================== */

function renderCategories() {

    /*
     * No results
     */

    if (
        displayedCategories.length === 0
    ) {

        rowsElement.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="empty-state"
                >

                    No categories found.

                </td>

            </tr>

        `;

        return;

    }


    /*
     * Create table rows.
     */

    rowsElement.innerHTML =
        displayedCategories
            .map(
                (category, index) => `

                <tr>

                    <td>
                        ${category.id}
                    </td>

                    <td>
                        ${escapeHtml(
                            category.category_name
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            category.description || ""
                        )}
                    </td>

                    <td>

                        <button
                            type="button"
                            class="btn btn-secondary"
                            onclick="editItem(${category.id})"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            class="btn btn-danger"
                            onclick="delItem(${category.id})"
                        >
                            Delete
                        </button>

                    </td>

                </tr>

            `
            )
            .join("");

}


/* =====================================================
   SEARCH FUNCTION
===================================================== */

function searchCategories() {

    /*
     * Get text from search box.
     */

    const searchText =
        searchInput.value
            .trim()
            .toLowerCase();


    console.log(
        "Searching for:",
        searchText
    );


    /*
     * If search box is empty,
     * show everything.
     */

    if (
        searchText === ""
    ) {

        displayedCategories =
            [...allCategories];

        renderCategories();

        return;

    }


    /*
     * Filter category name OR description.
     */

    displayedCategories =
        allCategories.filter(
            function(category) {

                const categoryName =
                    (
                        category.category_name ||
                        ""
                    )
                    .toString()
                    .toLowerCase();


                const description =
                    (
                        category.description ||
                        ""
                    )
                    .toString()
                    .toLowerCase();


                return (

                    categoryName.includes(
                        searchText
                    )

                    ||

                    description.includes(
                        searchText
                    )

                );

            }
        );


    /*
     * Display search result.
     */

    renderCategories();

}


/* =====================================================
   SEARCH BUTTON
===================================================== */

searchButton.addEventListener(
    "click",
    function(event) {

        event.preventDefault();


        console.log(
            "SEARCH BUTTON CLICKED"
        );


        searchCategories();

    }
);


/* =====================================================
   CLEAR BUTTON
===================================================== */

clearButton.addEventListener(
    "click",
    function(event) {

        event.preventDefault();


        console.log(
            "CLEAR BUTTON CLICKED"
        );


        /*
         * Clear search input.
         */

        searchInput.value = "";


        /*
         * Restore every category.
         */

        displayedCategories =
            [...allCategories];


        /*
         * Display all categories.
         */

        renderCategories();


        /*
         * Focus search box.
         */

        searchInput.focus();

    }
);


/* =====================================================
   ENTER KEY SEARCH
===================================================== */

searchInput.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter"
        ) {

            event.preventDefault();


            searchCategories();

        }

    }
);


/* =====================================================
   EDIT CATEGORY
===================================================== */

window.editItem = function(id) {

    const category =
        allCategories.find(
            function(item) {

                return item.id === id;

            }
        );


    if (!category) {

        alert(
            "Category not found."
        );

        return;

    }


    idInput.value =
        category.id;


    categoryNameInput.value =
        category.category_name;


    descriptionInput.value =
        category.description || "";


    formTitle.textContent =
        "Edit Category";


    /*
     * Scroll to form.
     */

    categoryForm.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

};


/* =====================================================
   DELETE CATEGORY
===================================================== */

window.delItem = async function(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this category?"
        );


    if (!confirmed) {

        return;

    }


    try {

        await api(
            "/categories/" +
            id +
            "/",
            {
                method: "DELETE"
            }
        );


        alert(
            "Category deleted successfully."
        );


        /*
         * Reload all categories.
         */

        await loadCategories();


        /*
         * If a search was active,
         * search again after reload.
         */

        searchCategories();

    }

    catch (error) {

        console.error(
            "Delete category error:",
            error
        );


        alert(
            error.message ||
            "Could not delete category."
        );

    }

};


/* =====================================================
   SAVE CATEGORY
===================================================== */

categoryForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const id =
            idInput.value.trim();


        const categoryName =
            categoryNameInput.value.trim();


        const description =
            descriptionInput.value.trim();


        /*
         * Validate category name.
         */

        if (
            categoryName === ""
        ) {

            alert(
                "Please enter a category name."
            );


            categoryNameInput.focus();


            return;

        }


        const body = {

            category_name:
                categoryName,

            description:
                description

        };


        try {

            /*
             * UPDATE
             */

            if (id) {

                await api(

                    "/categories/" +
                    id +
                    "/",

                    {

                        method:
                            "PUT",

                        body:
                            JSON.stringify(
                                body
                            )

                    }

                );

            }

            /*
             * CREATE
             */

            else {

                await api(

                    "/categories/",

                    {

                        method:
                            "POST",

                        body:
                            JSON.stringify(
                                body
                            )

                    }

                );

            }


            /*
             * Reset form.
             */

            categoryForm.reset();


            idInput.value =
                "";


            formTitle.textContent =
                "Add Category";


            /*
             * Reload categories.
             */

            await loadCategories();


            alert(
                id
                    ? "Category updated successfully."
                    : "Category added successfully."
            );

        }

        catch (error) {

            console.error(
                "Save category error:",
                error
            );


            alert(
                error.message ||
                "Could not save category."
            );

        }

    }
);


/* =====================================================
   CANCEL BUTTON
===================================================== */

cancelButton.addEventListener(
    "click",
    function() {

        categoryForm.reset();


        idInput.value =
            "";


        formTitle.textContent =
            "Add Category";

    }
);


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =====================================================
   START PAGE
===================================================== */

loadCategories();