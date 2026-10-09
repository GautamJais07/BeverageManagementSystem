requireLogin();

setupNav();


async function loadDashboard() {

    try {

        const data =
            await api("/dashboard/");


        document.getElementById("beverages")
            .textContent =
            data.total_beverages ?? 0;


        document.getElementById("categories")
            .textContent =
            data.total_categories ?? 0;


        document.getElementById("suppliers")
            .textContent =
            data.total_suppliers ?? 0;


        document.getElementById("purchases")
            .textContent =
            data.total_purchases ?? 0;


        document.getElementById("sales")
            .textContent =
            data.total_sales ?? 0;


        document.getElementById("inventory")
            .textContent =
            data.current_inventory ?? 0;


        document.getElementById("low")
            .textContent =
            data.low_stock ?? 0;


        document.getElementById("out")
            .textContent =
            data.out_of_stock ?? 0;


        loadRecentSales(
            data.recent_sales || []
        );


        loadRecentPurchases(
            data.recent_purchases || []
        );


    }

    catch(error) {

        console.error(
            "Dashboard error:",
            error
        );

    }

}


function loadRecentSales(sales) {

    const tbody =
        document.getElementById(
            "recentSales"
        );


    tbody.innerHTML = "";


    sales.forEach(sale => {

        const row =
            document.createElement("tr");


        row.innerHTML = `
    <td>${sale.id}</td>
    <td>${sale.items || "-"}</td>
    <td>${sale.total_quantity ?? "-"}</td>
    <td>${sale.total_amount}</td>
    <td>${new Date(sale.sale_date).toLocaleString()}</td>
`;

        tbody.appendChild(row);

    });

}


function loadRecentPurchases(purchases) {

    const tbody =
        document.getElementById(
            "recentPurchases"
        );


    tbody.innerHTML = "";


    purchases.forEach(purchase => {

        const row =
            document.createElement("tr");


row.innerHTML = `
    <td>${purchase.id}</td>
    <td>${purchase.items || "-"}</td>
    <td>${purchase.supplier_name || "-"}</td>
    <td>${purchase.total_quantity ?? "-"}</td>
    <td>${purchase.total_amount}</td>
    <td>${new Date(purchase.purchase_date).toLocaleString()}</td>
`;

        tbody.appendChild(row);

    });

}


loadDashboard();