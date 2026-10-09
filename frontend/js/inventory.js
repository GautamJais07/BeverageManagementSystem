/* =====================================================
   INVENTORY MANAGEMENT
===================================================== */

requireLogin();
setupNav();


/* =====================================================
   VARIABLES
===================================================== */

let allInventory = [];

let displayedInventory = [];


/* =====================================================
   GET HTML ELEMENTS
===================================================== */

const searchInput =
    document.getElementById("inventorySearch");

const searchButton =
    document.getElementById("inventorySearchButton");

const clearButton =
    document.getElementById("inventoryClearButton");

const rowsElement =
    document.getElementById("rows");


/* =====================================================
   LOAD INVENTORY FROM DATABASE
===================================================== */

async function load() {

    try {

        console.log(
            "Loading inventory..."
        );


        /*
         * Get inventory from Django API.
         */

        const data =
            await api("/inventory/");


        console.log(
            "Inventory API response:",
            data
        );


        /*
         * Make sure the response is an array.
         */

        if (
            Array.isArray(data)
        ) {

            allInventory =
                data;

        }

        else {

            console.error(
                "Inventory API did not return an array:",
                data
            );

            allInventory = [];

        }


        /*
         * Initially display all inventory.
         */

        displayedInventory =
            [...allInventory];


        renderInventory();

    }

    catch (error) {

        console.error(
            "Inventory loading error:",
            error
        );


        rowsElement.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="empty-inventory"
                >

                    Failed to load inventory.

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
   DISPLAY INVENTORY
===================================================== */

function renderInventory() {

    /*
     * No inventory found.
     */

    if (
        displayedInventory.length === 0
    ) {

        rowsElement.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="empty-inventory"
                >

                    No inventory found.

                </td>

            </tr>

        `;

        return;

    }


    /*
     * Create table rows.
     */

    rowsElement.innerHTML =
        displayedInventory
            .map(
                function(item) {


                    /*
                     * Determine row class.
                     */

                    let rowClass = "";


                    if (
                        item.status ===
                        "LOW_STOCK"
                    ) {

                        rowClass =
                            "low-stock-row";

                    }


                    if (
                        item.status ===
                        "OUT_OF_STOCK"
                    ) {

                        rowClass =
                            "out-of-stock-row";

                    }


                    /*
                     * Determine status class.
                     */

                    let statusClass =
                        "ok";


                    if (
                        item.status ===
                        "LOW_STOCK"
                    ) {

                        statusClass =
                            "low";

                    }


                    if (
                        item.status ===
                        "OUT_OF_STOCK"
                    ) {

                        statusClass =
                            "out";

                    }


                    /*
                     * Create table row.
                     */

                    return `

                        <tr
                            class="${rowClass}"
                        >

                            <td>

                                ${escapeHtml(
                                    item.beverage_name
                                )}

                            </td>


                            <td>

                                ${escapeHtml(
                                    item.brand
                                )}

                            </td>


                            <td>

                                ${escapeHtml(
                                    item.category_name
                                )}

                            </td>


                            <td>

                                <span
                                    class="stock-value"
                                >

                                    ${item.quantity_in_stock}

                                </span>

                            </td>


                            <td>

                                <span
                                    class="reorder-level"
                                >

                                    ${item.reorder_level}

                                </span>

                            </td>


                            <td>

                                <span
                                    class="badge ${statusClass}"
                                >

                                    ${formatStatus(
                                        item.status
                                    )}

                                </span>

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");

}


/* =====================================================
   SEARCH INVENTORY
===================================================== */

function searchInventory() {

    /*
     * Get search text.
     */

    const searchText =
        searchInput.value
            .trim()
            .toLowerCase();


    console.log(
        "Inventory search:",
        searchText
    );


    /*
     * If search box is empty,
     * display everything.
     */

    if (
        searchText === ""
    ) {

        displayedInventory =
            [...allInventory];

        renderInventory();

        return;

    }


    /*
     * Search in:
     *
     * 1. Beverage name
     * 2. Brand
     * 3. Category
     * 4. Status
     */

    displayedInventory =
        allInventory.filter(
            function(item) {


                const beverageName =
                    (
                        item.beverage_name ||
                        ""
                    )
                    .toString()
                    .toLowerCase();


                const brand =
                    (
                        item.brand ||
                        ""
                    )
                    .toString()
                    .toLowerCase();


                const category =
                    (
                        item.category_name ||
                        ""
                    )
                    .toString()
                    .toLowerCase();


                const status =
                    (
                        item.status ||
                        ""
                    )
                    .toString()
                    .toLowerCase();


                return (

                    beverageName.includes(
                        searchText
                    )

                    ||

                    brand.includes(
                        searchText
                    )

                    ||

                    category.includes(
                        searchText
                    )

                    ||

                    status.includes(
                        searchText
                    )

                );

            }
        );


    /*
     * Display filtered inventory.
     */

    renderInventory();

}


/* =====================================================
   SEARCH BUTTON
===================================================== */

searchButton.addEventListener(
    "click",
    function(event) {

        event.preventDefault();


        console.log(
            "INVENTORY SEARCH BUTTON CLICKED"
        );


        searchInventory();

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
            "INVENTORY CLEAR BUTTON CLICKED"
        );


        /*
         * Empty search field.
         */

        searchInput.value = "";


        /*
         * Restore all inventory.
         */

        displayedInventory =
            [...allInventory];


        /*
         * Display everything.
         */

        renderInventory();


        /*
         * Put cursor back into search box.
         */

        searchInput.focus();

    }
);


/* =====================================================
   ENTER KEY
===================================================== */

searchInput.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter"
        ) {

            event.preventDefault();


            searchInventory();

        }

    }
);


/* =====================================================
   FORMAT STATUS
===================================================== */

function formatStatus(status) {

    if (
        status === "LOW_STOCK"
    ) {

        return "Low Stock";

    }


    if (
        status === "OUT_OF_STOCK"
    ) {

        return "Out of Stock";

    }


    if (
        status === "IN_STOCK"
    ) {

        return "In Stock";

    }


    return status || "";

}


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
   START INVENTORY PAGE
===================================================== */

load();