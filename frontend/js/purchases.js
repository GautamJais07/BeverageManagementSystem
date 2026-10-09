/* =========================================================
   PURCHASES.JS
   Beverage Management System
========================================================= */


/* =========================================================
   API BASE URL
========================================================= */
requireLogin();
setupNav();
const API_BASE = "http://127.0.0.1:8000/api";


/* =========================================================
   PAGE DATA
========================================================= */

let beverages = [];
let suppliers = [];

let lineNumber = 0;


/* =========================================================
   GET AUTH TOKEN
========================================================= */

function getToken() {

    return localStorage.getItem("token");

}


/* =========================================================
   COMMON API REQUEST
========================================================= */

async function apiRequest(url, options = {}) {

    const token = getToken();


    const headers = {

        "Content-Type": "application/json",

        ...options.headers

    };


    if (token) {

        headers["Authorization"] =
            `Token ${token}`;

    }


    const response = await fetch(

        `${API_BASE}${url}`,

        {
            ...options,
            headers: headers
        }

    );


    /*
     * If the token has expired or user is not logged in
     */

    if (response.status === 401) {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        window.location.href =
            "login.html";

        return;

    }


    /*
     * No content
     */

    if (response.status === 204) {

        return null;

    }


    const data = await response.json();


    if (!response.ok) {

        let errorMessage =
            "Something went wrong.";

        if (data.detail) {

            errorMessage = data.detail;

        } else if (data.message) {

            errorMessage = data.message;

        } else if (typeof data === "object") {

            errorMessage =
                Object.values(data)
                    .flat()
                    .join(" ");

        }


        throw new Error(errorMessage);

    }


    return data;

}


/* =========================================================
   PAGE LOAD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        load();

    }
);


/* =========================================================
   LOAD EVERYTHING
========================================================= */

async function load() {

    try {

        await Promise.all([

            loadSuppliers(),

            loadBeverages(),

            loadPurchaseHistory()

        ]);


        /*
         * If there is no purchase line yet,
         * create the first one.
         */

        const lines =
            document.getElementById("lines");


        if (
            lines &&
            lines.children.length === 0
        ) {

            addLine();

        }


    } catch (error) {

        console.error(
            "Purchase page loading error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to load purchase data.",
            "error"
        );

    }

}


/* =========================================================
   LOAD SUPPLIERS
========================================================= */

async function loadSuppliers() {

    const supplierSelect =
        document.getElementById("supplier");


    if (!supplierSelect) {

        return;

    }


    try {

        const data =
            await apiRequest(
                "/suppliers/"
            );


        /*
         * Django REST Framework can return either:
         *
         * [
         *   {...},
         *   {...}
         * ]
         *
         * OR:
         *
         * {
         *   "results": [...]
         * }
         */

        suppliers =
            Array.isArray(data)
                ? data
                : (data.results || []);


        supplierSelect.innerHTML = `

            <option value="">
                Select Supplier
            </option>

        `;


        suppliers.forEach(
            function (supplier) {

                const option =
                    document.createElement("option");


                option.value =
                    supplier.id;


                option.textContent =
                    supplier.name ||
                    supplier.supplier_name ||
                    supplier.company_name ||
                    `Supplier #${supplier.id}`;


                supplierSelect.appendChild(
                    option
                );

            }
        );


    } catch (error) {

        console.error(
            "Supplier loading error:",
            error
        );


        supplierSelect.innerHTML = `

            <option value="">
                Unable to load suppliers
            </option>

        `;


        throw error;

    }

}


/* =========================================================
   LOAD BEVERAGES
========================================================= */

async function loadBeverages() {

    try {

        const data =
            await apiRequest(
                "/beverages/"
            );


        beverages =
            Array.isArray(data)
                ? data
                : (data.results || []);


        console.log(
            "Beverages loaded:",
            beverages
        );


    } catch (error) {

        console.error(
            "Beverage loading error:",
            error
        );


        throw error;

    }

}


/* =========================================================
   ADD PURCHASE LINE
========================================================= */

function addLine() {

    const container =
        document.getElementById("lines");


    if (!container) {

        return;

    }


    lineNumber++;


    const line =
        document.createElement("div");


    line.className =
        "purchase-line";


    line.dataset.line =
        lineNumber;


    line.innerHTML = `

        <!-- BEVERAGE -->

        <div>

            <label>
                Beverage
            </label>

            <select
                class="beverage-select"
                required
            >

                <option value="">
                    Select Beverage
                </option>

                ${getBeverageOptions()}

            </select>

        </div>


        <!-- QUANTITY -->

        <div>

            <label>
                Quantity
            </label>

            <input
                type="number"
                class="quantity-input"
                min="1"
                step="1"
                placeholder="Quantity"
                required
            >

        </div>


        <!-- UNIT PRICE -->

        <div>

            <label>
                Unit Price
            </label>

            <input
                type="number"
                class="price-input"
                min="0"
                step="0.01"
                placeholder="Price"
                required
            >

        </div>


        <!-- REMOVE -->

        <button
            type="button"
            class="remove-line"
            onclick="removeLine(this)"
        >

            Remove

        </button>

    `;


    container.appendChild(line);


    /*
     * When beverage changes, optionally
     * load its price into the input.
     */

    const beverageSelect =
        line.querySelector(
            ".beverage-select"
        );


    beverageSelect.addEventListener(
        "change",
        function () {

            setBeveragePrice(line);

        }
    );

}


/* =========================================================
   CREATE BEVERAGE OPTIONS
========================================================= */

function getBeverageOptions() {

    if (!beverages.length) {

        return "";

    }


    return beverages.map(
        function (beverage) {

            const name =
                beverage.name ||
                beverage.beverage_name ||
                beverage.title ||
                `Beverage #${beverage.id}`;


            return `

                <option value="${beverage.id}">

                    ${escapeHTML(name)}

                </option>

            `;

        }
    ).join("");

}


/* =========================================================
   SET BEVERAGE PRICE
========================================================= */

function setBeveragePrice(line) {

    const select =
        line.querySelector(
            ".beverage-select"
        );


    const priceInput =
        line.querySelector(
            ".price-input"
        );


    if (!select || !priceInput) {

        return;

    }


    const beverageId =
        select.value;


    if (!beverageId) {

        priceInput.value = "";

        return;

    }


    const beverage =
        beverages.find(
            function (item) {

                return String(item.id) ===
                    String(beverageId);

            }
        );


    if (!beverage) {

        return;

    }


    /*
     * Try common price field names.
     */

    const price =
        beverage.purchase_price ??
        beverage.cost_price ??
        beverage.price ??
        beverage.unit_price;


    if (
        price !== undefined &&
        price !== null
    ) {

        priceInput.value =
            price;

    }

}


/* =========================================================
   REMOVE PURCHASE LINE
========================================================= */

function removeLine(button) {

    const line =
        button.closest(
            ".purchase-line"
        );


    if (!line) {

        return;

    }


    line.remove();


    /*
     * Keep at least one purchase row.
     */

    const container =
        document.getElementById("lines");


    if (
        container &&
        container.children.length === 0
    ) {

        addLine();

    }

}


/* =========================================================
   SAVE PURCHASE
========================================================= */

async function savePurchase() {

    const supplierSelect =
        document.getElementById("supplier");


    const container =
        document.getElementById("lines");


    if (!supplierSelect) {

        return;

    }


    /*
     * Validate supplier
     */

    const supplierId =
        supplierSelect.value;


    if (!supplierId) {

        showMessage(
            "Please select a supplier.",
            "error"
        );

        supplierSelect.focus();

        return;

    }


    /*
     * Get all purchase lines
     */

    const lines =
        container.querySelectorAll(
            ".purchase-line"
        );


    if (!lines.length) {

        showMessage(
            "Please add at least one beverage.",
            "error"
        );

        return;

    }


    const items = [];


    for (
        let i = 0;
        i < lines.length;
        i++
    ) {

        const line =
            lines[i];


        const beverageSelect =
            line.querySelector(
                ".beverage-select"
            );


        const quantityInput =
            line.querySelector(
                ".quantity-input"
            );


        const priceInput =
            line.querySelector(
                ".price-input"
            );


        const beverageId =
            beverageSelect.value;


        const quantity =
            Number(
                quantityInput.value
            );


        const unitPrice =
            Number(
                priceInput.value
            );


        /*
         * Validate beverage
         */

        if (!beverageId) {

            showMessage(
                `Please select a beverage for item ${i + 1}.`,
                "error"
            );

            beverageSelect.focus();

            return;

        }


        /*
         * Validate quantity
         */

        if (
            !quantity ||
            quantity <= 0
        ) {

            showMessage(
                `Enter a valid quantity for item ${i + 1}.`,
                "error"
            );

            quantityInput.focus();

            return;

        }


        /*
         * Validate price
         */

        if (
            isNaN(unitPrice) ||
            unitPrice < 0
        ) {

            showMessage(
                `Enter a valid price for item ${i + 1}.`,
                "error"
            );

            priceInput.focus();

            return;

        }


        items.push({

            beverage:
                Number(beverageId),

            quantity:
                quantity,

            unit_price:
                unitPrice

        });

    }


    /*
     * Purchase object
     */

        const purchaseData = {

        supplier:
            Number(supplierId),

        details:
            items

    };


    console.log(
        "Sending purchase:",
        purchaseData
    );


    try {

        /*
         * Disable save button
         */

        const saveButton =
            document.querySelector(
                ".purchase-actions .btn-primary"
            );


        if (saveButton) {

            saveButton.disabled = true;

            saveButton.textContent =
                "Saving...";

        }


        /*
         * POST purchase
         */

        await apiRequest(

            "/purchases/",

            {

                method: "POST",

                body:
                    JSON.stringify(
                        purchaseData
                    )

            }

        );


        /*
         * Success
         */

        showMessage(
            "Purchase saved successfully.",
            "success"
        );


        /*
         * Reset form
         */

        supplierSelect.value = "";

        container.innerHTML = "";

        lineNumber = 0;

        addLine();


        /*
         * Reload history
         */

        await loadPurchaseHistory();


    } catch (error) {

        console.error(
            "Save purchase error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to save purchase.",
            "error"
        );


    } finally {

        const saveButton =
            document.querySelector(
                ".purchase-actions .btn-primary"
            );


        if (saveButton) {

            saveButton.disabled = false;

            saveButton.textContent =
                "Save Purchase";

        }

    }

}


/* =========================================================
   LOAD PURCHASE HISTORY
========================================================= */

async function loadPurchaseHistory() {

    const history =
        document.getElementById("history");


    if (!history) {

        return;

    }


    try {

        const data =
            await apiRequest(
                "/purchases/"
            );


        let purchases =
            Array.isArray(data)
                ? data
                : (data.results || []);


        /*
         * Newest purchases first
         */

        purchases =
            purchases.slice().reverse();


        /*
         * Display only latest records
         */

        const recent =
            purchases.slice(0, 20);


        if (!recent.length) {

            history.innerHTML = `

                <tr>

                    <td
                        colspan="4"
                        class="empty-history"
                    >

                        No purchases found.

                    </td>

                </tr>

            `;

            return;

        }


        history.innerHTML =
            recent.map(
                function (purchase) {

                    return createHistoryRow(
                        purchase
                    );

                }
            ).join("");


    } catch (error) {

        console.error(
            "Purchase history error:",
            error
        );


        history.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="loading-cell"
                >

                    Unable to load purchase history.

                </td>

            </tr>

        `;

    }

}


/* =========================================================
   CREATE HISTORY ROW
========================================================= */

function createHistoryRow(purchase) {

    const id =
        purchase.id ??
        "-";


    const date =
        purchase.date ??
        purchase.purchase_date ??
        purchase.created_at ??
        purchase.created ??
        "-";


    const supplier =
        getSupplierName(
            purchase.supplier
        );


    const total =
        purchase.total ??
        purchase.total_amount ??
        purchase.grand_total ??
        calculatePurchaseTotal(
            purchase
        );


    return `

        <tr>

            <td>
                #${escapeHTML(String(id))}
            </td>

            <td class="purchase-date">
                ${formatDate(date)}
            </td>

            <td>
                ${escapeHTML(
                    String(supplier)
                )}
            </td>

            <td class="purchase-total">
                Rs. ${formatMoney(total)}
            </td>

        </tr>

    `;

}


/* =========================================================
   GET SUPPLIER NAME
========================================================= */

function getSupplierName(supplier) {

    /*
     * If API returns:
     *
     * supplier: {
     *    id: 1,
     *    name: "ABC Supplier"
     * }
     */

    if (
        supplier &&
        typeof supplier === "object"
    ) {

        return (
            supplier.name ||
            supplier.supplier_name ||
            supplier.company_name ||
            `Supplier #${supplier.id}`
        );

    }


    /*
     * If API returns supplier ID
     */

    const found =
        suppliers.find(
            function (item) {

                return String(item.id) ===
                    String(supplier);

            }
        );


    if (found) {

        return (
            found.name ||
            found.supplier_name ||
            found.company_name ||
            `Supplier #${found.id}`
        );

    }


    return supplier || "-";

}


/* =========================================================
   CALCULATE PURCHASE TOTAL
========================================================= */

function calculatePurchaseTotal(purchase) {

    /*
     * If the backend does not return total,
     * calculate it from items.
     */

    const items =
        purchase.items ||
        purchase.purchase_items ||
        purchase.details ||
        [];


    if (!Array.isArray(items)) {

        return 0;

    }


    return items.reduce(
        function (total, item) {

            const quantity =
                Number(
                    item.quantity || 0
                );


            const price =
                Number(
                    item.unit_price ||
                    item.price ||
                    item.cost_price ||
                    0
                );


            return total +
                (quantity * price);

        },
        0
    );

}


/* =========================================================
   FORMAT MONEY
========================================================= */

function formatMoney(value) {

    const number =
        Number(value);


    if (isNaN(number)) {

        return "0.00";

    }


    return number.toFixed(2);

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(value) {

    if (
        !value ||
        value === "-"
    ) {

        return "-";

    }


    const date =
        new Date(value);


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return escapeHTML(
            String(value)
        );

    }


    return date.toLocaleDateString(
        "en-NP",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );

}


/* =========================================================
   SHOW MESSAGE
========================================================= */

function showMessage(
    message,
    type = "error"
) {

    /*
     * If there is already a message
     * element in the page, use it.
     */

    let messageBox =
        document.getElementById(
            "purchaseMessage"
        );


    /*
     * Otherwise create one.
     */

    if (!messageBox) {

        messageBox =
            document.createElement("div");


        messageBox.id =
            "purchaseMessage";


        messageBox.style.marginBottom =
            "15px";


        messageBox.style.padding =
            "12px 15px";


        messageBox.style.borderRadius =
            "7px";


        messageBox.style.fontSize =
            "13px";


        const panel =
            document.querySelector(
                ".purchase-form-panel"
            );


        if (panel) {

            panel.insertBefore(
                messageBox,
                panel.children[1]
            );

        } else {

            document.body.prepend(
                messageBox
            );

        }

    }


    messageBox.textContent =
        message;


    messageBox.className =
        `purchase-message ${type}`;


    if (type === "success") {

        messageBox.style.background =
            "#e8f7ee";

        messageBox.style.color =
            "#176b37";

        messageBox.style.border =
            "1px solid #b7e5c8";

    } else {

        messageBox.style.background =
            "#fdecec";

        messageBox.style.color =
            "#a12626";

        messageBox.style.border =
            "1px solid #f2bcbc";

    }


    /*
     * Automatically remove message
     */

    setTimeout(
        function () {

            if (messageBox) {

                messageBox.remove();

            }

        },
        5000
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}