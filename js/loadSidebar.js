
function initOfferSidebar() {
  const offerSidebar = document.getElementById("offerSidebar");
  const overlay = document.getElementById("overlay");
  const steps = document.querySelectorAll(".form-step");

  let currentStep = 0;
  let selectedProduct = null;
  let cart = [];
  
  function disableHiddenFields() {
    document.querySelectorAll(".conditional").forEach(section => {
      const isHidden = section.classList.contains("hidden");
      section.querySelectorAll("input, select, textarea").forEach(el => {
        el.disabled = isHidden;
      });
    });
  }
  const savedCart = localStorage.getItem("offerCart");
  if (savedCart) {
    cart = JSON.parse(savedCart);
  }

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
      const sharedSection = document.querySelector(".shared-options");

      const inputs = [
        ...(activeFormSection?.querySelectorAll("input, select, textarea") || []),
        ...(sharedSection?.querySelectorAll("input, select, textarea") || [])
      ];

inputs.forEach(el => {
  if (!el.name) return;
  if ((el.type === "radio" || el.type === "checkbox") && !el.checked) return;

  if (el.type === "file") {
    config[el.name] = el.files;
  } else {
    config[el.name] = el.value;
  }
});

      cart.push(config);
      localStorage.setItem("offerCart", JSON.stringify(cart)); // save to localStorage
      renderCartSummary();
    }

    // Save full cart into hidden field before submitting
    if (currentStep === 2) {
    const cartField = document.getElementById("cartDataField");
    if (cartField) {
      cartField.value = cart.map((item, i) => {
        return `Item ${i + 1}:\n` +
          Object.entries(item).map(([k, v]) => {
            if (v instanceof FileList) {
              return `${k}: ${[...v].map(f => f.name).join(", ")}`;
            }
            return `${k}: ${v}`;
          }).join("\n");
      }).join("\n\n");
    }

    disableHiddenFields(); // ✅ This is the important line

    // Ensure all visible step 3 inputs are re-enabled
    document.querySelectorAll(".form-step.active input, .form-step.active select, .form-step.active textarea")
      .forEach(el => el.disabled = false);
  }

    if (currentStep < 3) showStep(currentStep + 1);
  }

  function prevStep() {
    if (currentStep > 0) showStep(currentStep - 1);
  }

  function renderCartSummary() {
  const summary = document.getElementById("summary");
  summary.innerHTML = "";

  if (cart.length === 0) {
    summary.innerHTML = "<p>No products in cart.</p>";
    return;
  }

  cart.forEach((item, index) => {
    const container = document.createElement("div");
    container.innerHTML = `
      <h4>Item ${index + 1}</h4>
      <ul style="margin-left:1em;"></ul>
      <button onclick="removeCartItem(${index})" style="
        margin-top: 0.5em;
        font-size: 0.8rem;
        background: #dc3545;
        color: white;
        border: none;
        padding: 0.4em 0.8em;
        border-radius: 4px;
        cursor: pointer;
      ">Remove</button>
    `;
    const ul = container.querySelector("ul");

    for (const key in item) {
      if (["name", "email", "phone", "address", "form-name", "bot-field"].includes(key)) continue;
      const value = item[key];
      const display = value instanceof FileList
        ? [...value].map(f => f.name).join(", ")
        : Array.isArray(value) ? value.join(", ") : value;
      const li = document.createElement("li");
      li.innerHTML = `<strong>${key}</strong>: ${display}`;
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

  document.querySelectorAll('input[name="productType"]').forEach(radio => {
    radio.addEventListener("change", e => {
      const selected = e.target.value;

      // Hide and disable all conditional fields
      document.querySelectorAll(".conditional").forEach(div => {
        div.classList.add("hidden");
        div.querySelectorAll("input, select, textarea").forEach(input => {
          input.disabled = true;
        });
      });

      // Show and enable the selected section
      const active = document.getElementById(selected + "Options");
      if (active) {
        active.classList.remove("hidden");
        active.querySelectorAll("input, select, textarea").forEach(input => {
          input.disabled = false;
        });
      }

      nextStep(); // if you're auto-stepping
    });
  });


  document.querySelectorAll("#requestOfferBtn, .request-offer-trigger").forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      openSidebar();
    });
  });

  document.getElementById("closeOfferBtn")?.addEventListener("click", closeSidebar);
  document.getElementById("cartJumpBtn")?.addEventListener("click", () => {
    if (cart.length === 0) {
      alert("🛒 Your cart is currently empty.");
    } else {
      renderCartSummary();
      showStep(2); // Go to step 3 (cart review)
    }
  });
  overlay.addEventListener("click", closeSidebar);

  // Expose steps to window
  window.nextStep = nextStep;
  window.prevStep = prevStep;

  window.removeCartItem = function(index) {
    cart.splice(index, 1);
    localStorage.setItem("offerCart", JSON.stringify(cart));
    renderCartSummary();
  };
}

// Dynamically load the sidebar
document.addEventListener("DOMContentLoaded", function () {
  const sidebarTarget = document.getElementById("sidebarContainer");
  console.log("🔄 Fetching sidebar...");

  fetch("/components/offerSidebar.html")
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
