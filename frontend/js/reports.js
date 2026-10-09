requireLogin();
setupNav();
/* =========================================================
   HELPER: CREATE TABLE
========================================================= */

function table(headers, rows) {

    return `
        <div class="report-table-wrapper">

            <table class="table report-table">

                <thead>

                    <tr>

                        ${headers.map(header => `
                            <th>
                                ${escapeHTML(header)}
                            </th>
                        `).join("")}

                    </tr>

                </thead>


                <tbody>

                    ${
                        rows.length

                        ? rows.map(row => `
                            <tr>

                                ${row.map(value => `
                                    <td>
                                        ${escapeHTML(
                                            value ?? ""
                                        )}
                                    </td>
                                `).join("")}

                            </tr>
                        `).join("")

                        : `
                            <tr>

                                <td
                                    colspan="${headers.length}"
                                    style="text-align:center;"
                                >
                                    No records found.
                                </td>

                            </tr>
                        `
                    }

                </tbody>

            </table>

        </div>
    `;
}


/* =========================================================
   HELPER: ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


/* =========================================================
   HELPER: FORMAT NUMBER
========================================================= */

function formatNumber(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "0";

    }


    const number =
        Number(value);


    if (Number.isNaN(number)) {

        return escapeHTML(value);

    }


    return number.toLocaleString(
        "en-US",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}


/* =========================================================
   SALES REPORT
========================================================= */

async function loadSalesReport() {

    try {
        setActiveReportTab("btn-sales");

        const selectedPeriod =
            document.getElementById("period").value;


        const data = await api(

            "/reports/sales/?period=" +
            encodeURIComponent(
                selectedPeriod
            )

        );


        document.getElementById(
            "title"
        ).textContent =
            "Sales Report - " +
            selectedPeriod;


        let html = "";


        /* ==========================================
           SUMMARY
        ========================================== */

        html += `

            <h3>
                Sales Summary
            </h3>

        `;


        if (
            Array.isArray(
                data.summary
            )
        ) {

            html += table(

                [
                    "Period",
                    "Total",
                    "Count"
                ],

                data.summary.map(
                    item => [

                        item.period,

                        formatNumber(
                            item.total
                        ),

                        item.count

                    ]
                )

            );

        }


        /* ==========================================
           SALES BY BEVERAGE
        ========================================== */

        html += `

            <h3 style="margin-top:25px;">
                Sales by Beverage
            </h3>

        `;


        if (
            Array.isArray(
                data.by_beverage
            )
        ) {

            html += table(

                [
                    "Beverage",
                    "Quantity",
                    "Total"
                ],

                data.by_beverage.map(
                    item => [

                        item.beverage__beverage_name,

                        item.quantity,

                        formatNumber(
                            item.total
                        )

                    ]
                )

            );

        }


        /* ==========================================
           SALES BY CATEGORY
        ========================================== */

        html += `

            <h3 style="margin-top:25px;">
                Sales by Category
            </h3>

        `;


        if (
            Array.isArray(
                data.by_category
            )
        ) {

            html += table(

                [
                    "Category",
                    "Quantity",
                    "Total"
                ],

                data.by_category.map(
                    item => [

                        item.beverage__category__category_name,

                        item.quantity,

                        formatNumber(
                            item.total
                        )

                    ]
                )

            );

        }


        /* ==========================================
           SALES BY USER
        ========================================== */

        html += `

            <h3 style="margin-top:25px;">
                Sales by User
            </h3>

        `;


        if (
            Array.isArray(
                data.by_user
            )
        ) {

            html += table(

                [
                    "User",
                    "Total",
                    "Count"
                ],

                data.by_user.map(
                    item => [

                        item.created_by__username,

                        formatNumber(
                            item.total
                        ),

                        item.count

                    ]
                )

            );

        }


        document.getElementById(
            "output"
        ).innerHTML = html;


    }

    catch (error) {

        console.error(
            "Sales report error:",
            error
        );


        document.getElementById(
            "output"
        ).innerHTML = `

            <div class="report-error">

                ${escapeHTML(
                    error.message ||
                    "Unable to load sales report."
                )}

            </div>

        `;

    }

}


/* =========================================================
   PURCHASE REPORT
========================================================= */

/* =========================================================
   PURCHASE REPORT
========================================================= */

async function loadPurchaseReport() {

    try {

        setActiveReportTab("btn-purchase");


        // Get the selected report period
        const selectedPeriod =
            document.getElementById("period").value;


        // Send the selected period to Django
        const data = await api(
            "/reports/purchases/?period=" +
            encodeURIComponent(selectedPeriod)
        );


        // Update report title
        document.getElementById(
            "title"
        ).textContent =
            "Purchase Report - " +
            selectedPeriod;


        let html = "";


        /* ==========================================
           PURCHASE SUMMARY
        ========================================== */

        html += `

            <h3>
                Purchase Summary
            </h3>

        `;


        if (
            Array.isArray(data.summary)
        ) {

            html += table(

                [
                    "Period",
                    "Total",
                    "Count"
                ],

                data.summary.map(
                    item => [

                        item.period,

                        formatNumber(
                            item.total
                        ),

                        item.count

                    ]
                )

            );

        }


        /* ==========================================
           PURCHASE BY SUPPLIER
        ========================================== */

        html += `

            <h3 style="margin-top:25px;">
                Purchases by Supplier
            </h3>

        `;


        if (
            Array.isArray(
                data.by_supplier
            )
        ) {

            html += table(

                [
                    "Supplier",
                    "Total",
                    "Count"
                ],

                data.by_supplier.map(
                    item => [

                        item.supplier__supplier_name,

                        formatNumber(
                            item.total
                        ),

                        item.count

                    ]
                )

            );

        }

        else {

            html += `

                <p>
                    No purchase report data available.
                </p>

            `;

        }


        document.getElementById(
            "output"
        ).innerHTML = html;


    }

    catch (error) {

        console.error(
            "Purchase report error:",
            error
        );


        document.getElementById(
            "output"
        ).innerHTML = `

            <div class="report-error">

                ${escapeHTML(
                    error.message ||
                    "Unable to load purchase report."
                )}

            </div>

        `;

    }

}


/* =========================================================
   STOCK REPORT
========================================================= */

async function loadStockReport() {

    try {
        setActiveReportTab("btn-stock"); 

        const data = await api(
            "/reports/stock/"
        );


        document.getElementById(
            "title"
        ).textContent =
            "Stock Report";


        let html = "";


        /* ==========================================
           STOCK REPORT
        ========================================== */

        html += `

            <h3>
                Current Inventory Stock
            </h3>

        `;


        if (
            Array.isArray(
                data.stock
            )
        ) {

            html += table(

                [
                    "Beverage",
                    "Brand",
                    "Category",
                    "Stock",
                    "Reorder",
                    "Status"
                ],

                data.stock.map(
                    item => [

                        item.beverage__beverage_name,

                        item.beverage__brand,

                        item.beverage__category__category_name,

                        item.quantity_in_stock,

                        item.reorder_level,

                        item.status

                    ]
                )

            );

        }

        else {

            html += `

                <p>
                    No stock report data available.
                </p>

            `;

        }


        document.getElementById(
            "output"
        ).innerHTML = html;


    }

    catch (error) {

        console.error(
            "Stock report error:",
            error
        );


        document.getElementById(
            "output"
        ).innerHTML = `

            <div class="report-error">

                ${escapeHTML(
                    error.message ||
                    "Unable to load stock report."
                )}

            </div>

        `;

    }

}


/* =========================================================
   INITIAL PAGE LOAD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /*
         * Load the Sales Report initially.
         *
         * The HTML buttons call:
         *
         * loadSalesReport()
         * loadPurchaseReport()
         * loadStockReport()
         */

        loadSalesReport();

    }
);
/* =========================================================
   HELPER: SET ACTIVE TAB BUTTON
========================================================= */

function setActiveReportTab(activeId) {

    const buttons = document.querySelectorAll(".report-tab-btn");

    buttons.forEach(btn => {
        btn.classList.remove("btn-primary");
        btn.classList.add("btn-secondary");
    });

    const activeBtn = document.getElementById(activeId);

    if (activeBtn) {
        activeBtn.classList.remove("btn-secondary");
        activeBtn.classList.add("btn-primary");
    }
}

document.getElementById("period").addEventListener(
    "change",
    function () {

        const salesBtn =
            document.getElementById("btn-sales");

        const purchaseBtn =
            document.getElementById("btn-purchase");

        const stockBtn =
            document.getElementById("btn-stock");


        if (
            salesBtn.classList.contains("btn-primary")
        ) {

            loadSalesReport();

        }
        else if (
            purchaseBtn.classList.contains("btn-primary")
        ) {

            loadPurchaseReport();

        }
        else if (
            stockBtn.classList.contains("btn-primary")
        ) {

            loadStockReport();

        }

    }
);