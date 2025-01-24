

const API_BASE_URL = "/api/invoices";
document.addEventListener('DOMContentLoaded', function () {

  const addItemBtn = document.getElementById('add-item-btn');
  const itemRows = document.getElementById('item-rows');
  const subtotalElement = document.getElementById('subtotal');
  const taxElement = document.getElementById('tax');
  const totalElement = document.getElementById('total');

  // adding today's date
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('currentDate').value = today;

  // Function to update the total invoice
  function updateTotal() {
    let subtotal = 0;
    let taxAmount = 0;

    const rows = document.querySelectorAll('.item-row');
    rows.forEach(row => {
      const qty = parseFloat(row.querySelector('input[name="quantity"]').value) || 0;
      const rate = parseFloat(row.querySelector('input[name="rate"]').value) || 0;
      const sgst = parseFloat(row.querySelector('input[name="sgst"]').value) || 0;
      const cgst = parseFloat(row.querySelector('input[name="cgst"]').value) || 0;
      const cess = parseFloat(row.querySelector('input[name="cess"]').value) || 0;

      const amount = qty * rate;
      const sgstAmount = amount * (sgst / 100);
      const cgstAmount = amount * (cgst / 100);
      const cessAmount = amount * (cess / 100);

      // const totalAmount = amount + sgstAmount + cgstAmount + cessAmount;

      row.querySelector('input[name="amount"]').value = amount.toFixed(2);

      taxAmount += sgstAmount + cgstAmount + cessAmount;
      subtotal += amount;
    });

    const total = subtotal + taxAmount;

    subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
    taxElement.textContent = `₹${taxAmount.toFixed(2)}`;
    totalElement.textContent = `₹${total.toFixed(2)}`;
  }

  // adding a new row  
  addItemBtn.addEventListener('click', function () {
    const firstRow = document.querySelector('.item-row');
    if (!firstRow) return;

    const newRow = firstRow.cloneNode(true);

    // Reset input values in the new row
    newRow.querySelectorAll('input').forEach(input => {
      if (input.name === 'quantity') {
        input.value = 1;
      } else if (input.name === 'rate' || input.name === 'sgst' || input.name === 'cgst' || input.name === 'cess') {
        input.value = 0;
      } else if (input.name === 'amount' || input.name === 'name') {
        input.value = '';
      }
    });

    itemRows.appendChild(newRow);
    updateTotal();
  });

  // removing a row
  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('remove-item')) {
      e.target.closest('.item-row').remove();
      updateTotal();
    }
  });

  // updating totals when inputs change
  document.addEventListener('input', function (e) {
    if (e.target.closest('.item-row')) {
      const value = parseFloat(e.target.value);
      if (value < 0) e.target.value = 0;
      updateTotal();
    }
  });


  updateTotal();


  // event listeners for form actions
  const invoiceForm = document.getElementById('invoice-form');
  const submitButton = document.getElementById('submit-btn');
  const updateButton = document.getElementById('update-btn');
  const deleteButton = document.getElementById('delete-btn');
  const generateButton = document.getElementById('generate-btn');
  const ugenerateButton = document.getElementById('u-generate-btn');


  if (ugenerateButton) {
    ugenerateButton.addEventListener('click', async function (event) {
      event.preventDefault();
      await generatePdf()
    })
  }
  if (generateButton) {
    generateButton.addEventListener('click', async function (event) {
      event.preventDefault();
      try {
        const formData = new FormData(invoiceForm);
        const invoiceData = buildInvoiceData(formData);
        const id = await saveInvoice(invoiceData);

        await generatePdf(id)


      } catch (error) {
        console.error("Failed to generate PDF:", error);
      }
    });
  }


  if (submitButton) {
    submitButton.addEventListener('click', async function (event) {
      event.preventDefault();
      try {
        const formData = new FormData(invoiceForm);
        const invoiceData = buildInvoiceData(formData);
        await saveInvoice(invoiceData);
      } catch (error) {
        console.error("Error submitting invoice:", error);
      }
    });

  }

  if (updateButton) {
    updateButton.addEventListener('click', async function (event) {
      event.preventDefault();
      try {
        const formData = new FormData(invoiceForm);
        const invoiceData = buildInvoiceData(formData);
        await updateInvoice(invoiceData);
      } catch (error) {
        console.error('Error updating invoice:', error);
      }
    });
  }

  if (deleteButton) {
    deleteButton.addEventListener('click', async function (event) {
      event.preventDefault();
      try {
        await deleteInvoice();
      } catch (error) {
        console.error('Error deleting invoice:', error);
      }
    });
  }



  // generating pdf 
  async function generatePdf(id) {
    const uuid = window.location.pathname.split('/').pop();
    if (!id && !uuid) {
      console.error("No invoice ID or UUID provided.");
      return;
    }
    const requestData = id || uuid;
    const response = await fetch(`/generate-pdf?id=${requestData}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    if (!response.ok) {
      throw new Error(`Failed to generate PDF: ${response.statusText}`);
    }
    const blob = await response.blob();
    const pdfUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.target = "_blank";

    a.download = "invoice.pdf";
    
    a.click();

  }

  // creating invoice
  async function saveInvoice(invoiceData) {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invoiceData)
    });


    if (response.ok) {

      Swal.fire('Success', 'Invoice saved successfully!', 'success');
      const res = await response.json();
      console.log(res);

      return res.customId;

    } else {
      Swal.fire('Error', 'Failed to save invoice.', 'error');
    }
  }


  // deleting invoice
  async function deleteInvoice() {
    const uuid = window.location.pathname.split('/').pop()
    const response = await fetch(`${API_BASE_URL}/${uuid}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },

    });

    if (response.ok) {
      Swal.fire('Success', 'Invoice delete successfully!', 'success');
    } else {
      Swal.fire('Error', 'Failed to delete invoice.', 'error');
    }
  }

  // updating invoice
  async function updateInvoice(invoiceData) {
    const uuid = window.location.pathname.split('/').pop()
    const response = await fetch(`${API_BASE_URL}/${uuid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invoiceData)
    });

    if (response.ok) {
      Swal.fire('Success', 'Invoice updated successfully!', 'success');
    } else {
      Swal.fire('Error', 'Failed to update invoice.', 'error');
    }
  }



  //creating an object to store all the invoice data

  function buildInvoiceData(formData) {
    const invoiceData = {
      currentDate: formData.get("currentdate"),
      dueDate: formData.get("duedate"),
      invoiceNumber: formData.get("invoiceNumber"),
      billFrom: {
        companyName: document.getElementById("companyName").value,
        name: document.getElementById("name").value,
        gstin: document.getElementById("companyGSTIN").value,
        address: document.getElementById("address").value,
        city: document.getElementById("city").value,
        zip: document.getElementById("zip").value,
      },
      billTo: {
        companyName: document.getElementById("clientCompanyName").value,
        name: document.getElementById("clientName").value,
        gstin: document.getElementById("clientCompanyGSTIN").value,
        address: document.getElementById("clientAddress").value,
        city: document.getElementById("clientCity").value,
        zip: document.getElementById("clientZip").value,
      },
      items: [...document.querySelectorAll(".item-row")].map(row => ({
        name: row.querySelector('input[name="name"]').value,
        quantity: parseFloat(row.querySelector('input[name="quantity"]').value),
        rate: parseFloat(row.querySelector('input[name="rate"]').value),
        sgst: parseFloat(row.querySelector('input[name="sgst"]').value),
        cgst: parseFloat(row.querySelector('input[name="cgst"]').value),
        cess: parseFloat(row.querySelector('input[name="cess"]').value),
        amount: parseFloat(row.querySelector('input[name="amount"]').value),
      })),
      subtotal: parseFloat(document.getElementById("subtotal").textContent.replace("₹", "")),
      tax: parseFloat(document.getElementById("tax").textContent.replace("₹", "")),
      total: parseFloat(document.getElementById("total").textContent.replace("₹", "")),
      terms: formData.get("notes"),
    };
    return invoiceData;
  }
});
