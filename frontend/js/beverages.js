requireLogin();
setupNav();

let items = [];

async function loadCategories() {
    let c = await api("/categories/");
    category.innerHTML = c
        .map(x => `<option value="${x.id}">${x.category_name}</option>`)
        .join("");
}

function statusClass(status) {
    if (status === "LOW_STOCK") return "status-low-stock";
    if (status === "OUT_OF_STOCK") return "status-out-of-stock";
    return "status-in-stock";
}

function statusLabel(status) {
    if (status === "LOW_STOCK") return "Low Stock";
    if (status === "OUT_OF_STOCK") return "Out of Stock";
    return "In Stock";
}

async function load() {
    items = await api("/beverages/?search=" + encodeURIComponent(search.value));

    recordCount.textContent = items.length;

    if (items.length === 0) {
        rows.innerHTML = `<tr><td colspan="8" class="empty-state">No beverages found.</td></tr>`;
        return;
    }

    rows.innerHTML = items.map((x, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${x.beverage_name}</td>
            <td>${x.brand}</td>
            <td>${x.category_name}</td>
            <td>${x.unit_price}</td>
            <td>${x.stock}</td>
            <td><span class="status-badge ${statusClass(x.status)}">${statusLabel(x.status)}</span></td>
            <td>
                <button class="btn btn-secondary" onclick="editItem(${x.id})">Edit</button>
                <button class="btn btn-danger" onclick="delItem(${x.id})">Delete</button>
            </td>
        </tr>
    `).join("");
}

window.editItem = id => {
    let x = items.find(a => a.id === id);

    if (!x) {
        alert("Could not find that beverage. Try reloading the page.");
        return;
    }

    document.getElementById("id").value = x.id;
    beverage_name.value = x.beverage_name;
    brand.value = x.brand;
    category.value = x.category;
    unit_price.value = x.unit_price;

    document.getElementById("formTitle").textContent = "Edit Beverage";

    // The form panel is hidden by default — this is the line that was
    // missing before, so clicking Edit filled the form but never showed it.
    if (typeof showBeverageForm === "function") {
        showBeverageForm();
    }
};

window.delItem = async id => {
    if (!confirm("Delete beverage?")) {
        return;
    }

    try {
        await api("/beverages/" + id + "/", { method: "DELETE" });
        load();
    } catch (error) {
        // Previously this error was thrown and never caught, so the
        // Delete button looked like it did nothing. Now the user sees why.
        alert(error.message || "Could not delete this beverage.");
    }
};

f.onsubmit = async e => {
    e.preventDefault();
    let id = document.getElementById("id").value;
    let body = {
        beverage_name: beverage_name.value,
        brand: brand.value,
        category: category.value,
        unit_price: unit_price.value
    };

    try {
        await api(id ? "/beverages/" + id + "/" : "/beverages/", {
            method: id ? "PUT" : "POST",
            body: JSON.stringify(body)
        });
        f.reset();
        document.getElementById("id").value = "";
        hideBeverageForm();
        resetForm();
        load();
    } catch (error) {
        alert(error.message || "Could not save this beverage.");
    }
};

loadCategories().then(load);