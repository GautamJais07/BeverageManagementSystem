requireLogin();
setupNav();


document.addEventListener("DOMContentLoaded", function () {

    console.log("suppliers.js loaded");

    const supplierForm = document.getElementById("supplierform");
    const rowsBody = document.getElementById("rows");

    if (!supplierForm) {
        console.error("supplierform was not found");
        return;
    }

    let suppliers = [];

    async function loadSuppliers() {
        try {
            suppliers = await api("/suppliers/");

            if (!suppliers.length) {
                rowsBody.innerHTML =
                    `<tr><td colspan="6" class="empty-row">No suppliers yet.</td></tr>`;
                return;
            }

            rowsBody.innerHTML = suppliers.map(s => `
                <tr>
                    <td>${s.supplier_name}</td>
                    <td>${s.contact_person || ""}</td>
                    <td>${s.phone || ""}</td>
                    <td>${s.email || ""}</td>
                    <td>${s.address || ""}</td>
                    <td>
                        <button class="btn btn-secondary" onclick="editSupplier(${s.id})">Edit</button>
                        <button class="btn btn-danger" onclick="deleteSupplier(${s.id})">Delete</button>
                    </td>
                </tr>
            `).join("");

        } catch (error) {
            console.error("Failed to load suppliers:", error);
            rowsBody.innerHTML =
                `<tr><td colspan="6" class="empty-row">Could not load suppliers: ${error.message}</td></tr>`;
        }
    }

    window.resetForm = function () {
        supplierForm.reset();
        document.getElementById("supplier_id").value = "";
    };

    window.editSupplier = function (id) {
        const s = suppliers.find(x => x.id === id);
        if (!s) return;

        document.getElementById("supplier_id").value = s.id;
        document.getElementById("supplier_name").value = s.supplier_name;
        document.getElementById("contact_person").value = s.contact_person || "";
        document.getElementById("phone").value = s.phone || "";
        document.getElementById("email").value = s.email || "";
        document.getElementById("address").value = s.address || "";
    };

    window.deleteSupplier = async function (id) {
        if (!confirm("Delete this supplier?")) return;

        try {
            await api(`/suppliers/${id}/`, { method: "DELETE" });
            loadSuppliers();
        } catch (error) {
            alert("Could not delete supplier.\n\n" + error.message);
        }
    };

    supplierForm.addEventListener("submit", async function (event) {

        event.preventDefault();
        console.log("Save button clicked");

        const supplierId = document.getElementById("supplier_id").value;

        const supplierData = {
            supplier_name: document.getElementById("supplier_name").value.trim(),
            contact_person: document.getElementById("contact_person").value.trim(),
            phone: document.getElementById("phone").value.trim(),
            email: document.getElementById("email").value.trim(),
            address: document.getElementById("address").value.trim(),
        };

        console.log("Data being sent:", supplierData);

        try {
            if (supplierId) {
                await api(`/suppliers/${supplierId}/`, {
                    method: "PUT",
                    body: JSON.stringify(supplierData),
                });
            } else {
                await api("/suppliers/", {
                    method: "POST",
                    body: JSON.stringify(supplierData),
                });
            }

            alert("Supplier saved successfully!");
            resetForm();
            loadSuppliers();

        } catch (error) {
            console.error("Save failed:", error);
            alert("Supplier was not saved.\n\n" + error.message);
        }
    });

    loadSuppliers();

});