
function initOfferSidebar() {
  const offerSidebar = document.getElementById("offerSidebar");
  const overlay = document.getElementById("overlay");
  const steps = document.querySelectorAll(".form-step");

  let currentStep = 0;
  let selectedProduct = null;
  let cart = [];

  function showStep(step) {
    steps.forEach((el, idx) => {
      el.classList.toggle("active", idx === step);
    });
    currentStep = step;
  }

  function openSidebar() {
    offerSidebar.classList.remove("hidden");
    setTimeout(() => offerSidebar.classList.add("show"), 10); // allow transition
    overlay.classList.remove("hidden");
    showStep(0);
  }

  function closeSidebar() {
    offerSidebar.classList.remove("show");
    overlay.classList.add("hidden");
    setTimeout(() => offerSidebar.classList.add("hidden"), 300); // allow animation to finish
  }

  function nextStep() {
    if (currentStep === 0) {
      selectedProduct = document.querySelector('input[name="productType"]:checked')?.value;
      if (!selectedProduct) return alert("Please select a product.");
      showConfigOptions(selectedProduct);
    }

    if (currentStep === 1) {
      const form = document.querySelector('form[name="offer"]');
      const activeFormSection = document.querySelector(".form-step.active .form-section:not(.hidden)");
      const config = {};
      const inputs = (activeFormSection || form).querySelectorAll("input, select, textarea");

      inputs.forEach(el => {
        if (!el.name) return;
        if ((el.type === "radio" || el.type === "checkbox") && !el.checked) return;
        config[el.name] = el.value;
      });

      cart.push(config);
      renderCartSummary();
    }


    if (currentStep < 3) showStep(currentStep + 1);
  }

  function prevStep() {
    if (currentStep > 0) showStep(currentStep - 1);
  }

  function renderCartSummary() {
    const summary = document.getElementById("summary");
    summary.innerHTML = "";

    cart.forEach((item, index) => {
      const container = document.createElement("div");
      container.innerHTML = `<h4>Item ${index + 1}</h4><ul style="margin-left:1em;"></ul>`;
      const ul = container.querySelector("ul");
      for (const key in item) {
        if (["name", "email", "phone", "address", "form-name", "bot-field"].includes(key)) continue;
        const li = document.createElement("li");
        li.innerHTML = `<strong>${key}</strong>: ${item[key]}`;
        ul.appendChild(li);
      }
      summary.appendChild(container);
    });
  }

  function showConfigOptions(productType) {
    document.querySelectorAll(".conditional").forEach(el => el.classList.add("hidden"));
    if (productType === "veranda") document.getElementById("verandaOptions")?.classList.remove("hidden");
    if (productType === "glass") document.getElementById("glassOptions")?.classList.remove("hidden");
    if (productType === "other") document.getElementById("otherOptions")?.classList.remove("hidden");
  }

  // Hook up buttons and radios
  document.querySelectorAll('input[name="productType"]').forEach(radio => {
    radio.addEventListener("change", e => {
      selectedProduct = e.target.value;
      showConfigOptions(selectedProduct);
      nextStep(); // Automatically move to config step
    });
  });


  document.querySelectorAll("#requestOfferBtn, .request-offer-trigger").forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      openSidebar();
    });
  });

  document.getElementById("closeOfferBtn")?.addEventListener("click", closeSidebar);
  overlay.addEventListener("click", closeSidebar);

  // Expose steps to window
  window.nextStep = nextStep;
  window.prevStep = prevStep;
}

// Dynamically load the sidebar
document.addEventListener("DOMContentLoaded", function () {
  const sidebarTarget = document.getElementById("sidebarContainer");
  console.log("🔄 Fetching sidebar...");

  fetch("components/offerSidebar.html")
    .then(response => {
      console.log("✅ Sidebar file fetched");
      return response.text();
    })
    .then(html => {
      sidebarTarget.innerHTML = html;
      console.log("✅ Sidebar inserted into DOM");
      initOfferSidebar();
      console.log("✅ initOfferSidebar() called");
    })
    .catch(err => {
      console.error("❌ Failed to load offerSidebar.html", err);
    });
});
