requireLogin();

setupNav();

let beverages = [];


// =====================================================
// INITIALIZE
// =====================================================

async function init() {

    try {

        beverages = await api("/beverages/");

        addLine();

        await loadHistory();

    } catch (error) {

        console.error(
            "Failed to load sales page:",
            error
        );

        alert(
            error.message ||
            "Unable to load sales page."
        );
    }
}


// =====================================================
// ADD BEVERAGE LINE
// =====================================================

function addLine() {

    const d =
        document.createElement("div");

    d.className =
        "form-grid line";

    d.style.margin =
        "12px 0";

    d.style.alignItems =
        "end";


    d.innerHTML = `

        <div class="form-group">

            <label>
                Beverage
            </label>

            <select class="bev">

                <option
                    value=""
                    selected
                    disabled
                    hidden
                >
                    Select beverage
                </option>

                ${
                    beverages.map(
                        x => `
                            <option
                                value="${x.id}"
                                data-price="${x.unit_price}"
                            >
                                ${x.beverage_name}
                            </option>
                        `
                    ).join("")
                }

            </select>

        </div>


        <div class="form-group">

            <label>
                Quantity
            </label>

            <input
                class="qty"
                type="number"
                min="1"
                value="1"
            >

        </div>


        <div class="form-group">

            <label>
                Amount
            </label>

            <input
                class="amount"
                type="number"
                step="0.01"
                min="0"
                value="0.00"
            >

        </div>


        <div class="form-group">

            <button
                type="button"
                class="btn btn-danger remove-line-btn"
            >
                Remove
            </button>

        </div>

    `;


    const bevSelect =
        d.querySelector(".bev");

    const qtyInput =
        d.querySelector(".qty");

    const amountInput =
        d.querySelector(".amount");


    // =================================================
    // AUTOMATICALLY CALCULATE AMOUNT
    // =================================================

    function suggestAmount() {

        const selectedOption =
            bevSelect.options[
                bevSelect.selectedIndex
            ];


        const price =
            selectedOption
                ? Number(
                    selectedOption.dataset.price || 0
                )
                : 0;


        const qty =
            Number(
                qtyInput.value || 0
            );


        amountInput.value =
            (price * qty).toFixed(2);


        updateGrandTotal();
    }


    bevSelect.addEventListener(
        "change",
        suggestAmount
    );


    qtyInput.addEventListener(
        "input",
        suggestAmount
    );


    amountInput.addEventListener(
        "input",
        updateGrandTotal
    );


    d.querySelector(
        ".remove-line-btn"
    ).onclick = function () {

        removeLine(d);

        updateGrandTotal();

    };


    document
        .getElementById("lines")
        .appendChild(d);
}


// =====================================================
// UPDATE GRAND TOTAL
// =====================================================

function updateGrandTotal() {

    let total = 0;


    document
        .querySelectorAll(
            ".line .amount"
        )
        .forEach(
            function (el) {

                total += Number(
                    el.value || 0
                );

            }
        );


    const totalDisplay =
        document.getElementById(
            "grandTotal"
        );


    if (totalDisplay) {

        totalDisplay.textContent =
            total.toFixed(2);

    }
}


// =====================================================
// REMOVE LINE
// =====================================================

function removeLine(lineEl) {

    const lines =
        document.getElementById(
            "lines"
        );


    if (
        lines.children.length <= 1
    ) {

        alert(
            "A sale needs at least one beverage line."
        );

        return;
    }


    lineEl.remove();
}


// =====================================================
// CUSTOMER NAME VALIDATION
// =====================================================

function validateCustomerName() {

    // IMPORTANT:
    // HTML uses id="customer_name"
    // so JavaScript MUST use the same ID.

    const customerNameInput =
        document.getElementById(
            "customer_name"
        );


    const error =
        document.getElementById(
            "customerNameError"
        );


    if (!customerNameInput) {

        console.error(
            "Customer name input was not found."
        );

        return false;
    }


    const customerName =
        customerNameInput.value.trim();


    if (error) {

        error.textContent = "";

    }


    if (!customerName) {

        if (error) {

            error.textContent =
                "Customer name is required.";

        }

        customerNameInput.focus();

        return false;
    }


    // Only letters, spaces, dots,
    // apostrophes and hyphens.

    const namePattern =
        /^[A-Za-zÀ-ÖØ-öø-ÿ .'-]+$/;


    if (
        !namePattern.test(
            customerName
        )
    ) {

        if (error) {

            error.textContent =
                "Customer name can contain only letters.";

        }

        customerNameInput.focus();

        return false;
    }


    return true;
}


// =====================================================
// SAVE SALE
// =====================================================

async function saveSale() {

    console.log(
        "Save Sale button clicked."
    );


    // =================================================
    // VALIDATE CUSTOMER NAME
    // =================================================

    if (
        !validateCustomerName()
    ) {

        return;
    }


    // =================================================
    // GET CUSTOMER NAME
    // =================================================

    const customerName =
        document
            .getElementById(
                "customer_name"
            )
            .value
            .trim();


    // =================================================
    // GET PAYMENT METHOD
    // =================================================

    const paymentMethod =
        document.getElementById(
            "payment"
        ).value;


    // =================================================
    // GET SALE DETAILS
    // =================================================

    const lines =
        [
            ...document.querySelectorAll(
                ".line"
            )
        ];


    if (lines.length === 0) {

        alert(
            "Please add at least one beverage."
        );

        return;
    }


    const details =
        lines.map(
            function (line) {

                const beverage =
                    line.querySelector(
                        ".bev"
                    ).value;


                const quantity =
                    Number(
                        line.querySelector(
                            ".qty"
                        ).value
                    );


                const amount =
                    Number(
                        line.querySelector(
                            ".amount"
                        ).value
                    );


                return {

                    beverage:
                        Number(beverage),

                    quantity:
                        quantity,

                    amount:
                        amount

                };

            }
        );


    // =================================================
    // VALIDATE SALE DETAILS
    // =================================================

    const invalidLine =
        details.some(
            function (item) {

                return (
                    !item.beverage ||
                    !Number.isInteger(
                        item.quantity
                    ) ||
                    item.quantity <= 0 ||
                    !Number.isFinite(
                        item.amount
                    ) ||
                    item.amount <= 0
                );

            }
        );


    if (invalidLine) {

        alert(
            "Please select a beverage and enter a valid quantity and amount."
        );

        return;
    }


    // =================================================
    // PREPARE DATA
    // =================================================

    const saleData = {

        customer_name:
            customerName,

        payment_method:
            paymentMethod,

        details:
            details

    };


    console.log(
        "Sending sale:",
        saleData
    );


    // =================================================
    // SAVE TO SERVER
    // =================================================

    try {

        const data =
            await api(
                "/sales/",
                {

                    method: "POST",

                    body:
                        JSON.stringify(
                            saleData
                        )

                }
            );


        console.log(
            "Sale response:",
            data
        );


        // =================================================
        // SHOW BILL
        // =================================================

        showBill(data);


        alert(
            "Sale saved successfully. Inventory has been updated."
        );


        // =================================================
        // RESET SALES FORM
        // =================================================

        document
            .getElementById(
                "lines"
            )
            .innerHTML = "";


        addLine();


        updateGrandTotal();


        // =================================================
        // RESET CUSTOMER NAME
        // =================================================

        document
            .getElementById(
                "customer_name"
            )
            .value = "";


        // =================================================
        // CLEAR ERROR
        // =================================================

        const error =
            document.getElementById(
                "customerNameError"
            );


        if (error) {

            error.textContent = "";

        }


        // =================================================
        // REFRESH HISTORY
        // =================================================

        await loadHistory();

    }


    catch (error) {

        console.error(
            "SAVE SALE ERROR:",
            error
        );


        alert(
            error.message ||
            "Unable to save sale."
        );

    }
}


// =====================================================
// SHOW BILL
// =====================================================

function showBill(x) {

    const bill =
        document.getElementById(
            "bill"
        );


    if (!bill) {

        console.error(
            "Bill element not found."
        );

        return;
    }


    bill.style.display =
        "block";


    bill.innerHTML = `

        <h2>
            Bill #${x.id}
        </h2>


        <p>
            Date:
            ${new Date(
                x.sale_date
            ).toLocaleString()}
        </p>


        <p>
            Customer:
            <strong>
                ${x.customer_name}
            </strong>
        </p>


        <p>
            Payment:
            ${x.payment_method}
        </p>


        <table>

            <thead>

                <tr>

                    <th>
                        Beverage
                    </th>

                    <th>
                        Qty
                    </th>

                    <th>
                        Unit Price
                    </th>

                    <th>
                        Subtotal
                    </th>

                </tr>

            </thead>


            <tbody>

                ${
                    (x.details || [])
                    .map(
                        function (d) {

                            return `

                                <tr>

                                    <td>
                                        ${d.beverage_name}
                                    </td>

                                    <td>
                                        ${d.quantity}
                                    </td>

                                    <td>
                                        ${d.unit_price}
                                    </td>

                                    <td>
                                        ${d.subtotal}
                                    </td>

                                </tr>

                            `;

                        }
                    )
                    .join("")
                }

            </tbody>

        </table>


        <h3>
            Total:
            ${x.total_amount}
        </h3>
    `;
      const printBtn =
        document.getElementById("printBillBtn");

    if (printBtn) {
        printBtn.disabled = false;
    }

}


// =====================================================
// LOAD SALES HISTORY
// =====================================================

// =====================================================
// LOAD SALES HISTORY
// =====================================================

const HISTORY_PAGE_SIZE = 10;

let allSalesHistory = [];
let historyShowingAll = false;

async function loadHistory() {

    try {

        const data = await api("/sales/");

        allSalesHistory = data || [];
        historyShowingAll = false;

        renderHistory();

    } catch (error) {

        console.error("Could not load sales history:", error);

    }
}


function renderHistory() {

    const history = document.getElementById("history");
    const statusEl = document.getElementById("historyStatus");
    const toggleBtn = document.getElementById("toggleHistoryBtn");

    if (!history) return;

    if (allSalesHistory.length === 0) {
        history.innerHTML = `
            <tr>
                <td colspan="7" class="empty-row">No sales found.</td>
            </tr>
        `;
        if (statusEl) statusEl.textContent = "";
        if (toggleBtn) toggleBtn.style.display = "none";
        return;
    }

    const rowsToShow = historyShowingAll
        ? allSalesHistory
        : allSalesHistory.slice(0, HISTORY_PAGE_SIZE);

    history.innerHTML = rowsToShow.map(function (x) {
        return `
            <tr>
                <td>${x.id}</td>
                <td>${new Date(x.sale_date).toLocaleString()}</td>
                <td>${x.customer_name}</td>
                <td>${x.total_amount}</td>
                <td>${x.payment_method}</td>
                <td>${x.created_by_name || ""}</td>
                <td>
                    <button type="button" class="btn btn-secondary"
                        onclick='showBill(${JSON.stringify(x)})'>
                        View
                    </button>
                </td>
            </tr>
        `;
    }).join("");

    if (statusEl) {
        statusEl.textContent =
            `Showing ${rowsToShow.length} of ${allSalesHistory.length} sales`;
    }

    if (toggleBtn) {
        if (allSalesHistory.length <= HISTORY_PAGE_SIZE) {
            toggleBtn.style.display = "none";
        } else {
            toggleBtn.style.display = "inline-block";
            toggleBtn.textContent = historyShowingAll
                ? "Show less"
                : `Show more (${allSalesHistory.length - HISTORY_PAGE_SIZE} more)`;
        }
    }
}


function toggleHistoryView() {
    historyShowingAll = !historyShowingAll;
    renderHistory();
}

// =====================================================
// PRINT BILL
// =====================================================

function printBill() {

    document.body.classList.add(
        "printing-bill"
    );


    window.print();
}


window.addEventListener(
    "afterprint",
    function () {

        document.body.classList.remove(
            "printing-bill"
        );

    }
);


// =====================================================
// ROLE CHECK
// =====================================================

if (
    !requireRole(
        "ADMIN",
        "MANAGER",
        "STAFF"
    )
) {

    throw new Error(
        "Unauthorized"
    );
}


// =====================================================
// START
// =====================================================

init();