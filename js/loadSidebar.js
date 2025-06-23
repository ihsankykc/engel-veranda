function initOfferSidebar() {
  const offerSidebar = document.getElementById("offerSidebar");
  const overlay = document.getElementById("overlay");
  const offerButtons = document.querySelectorAll("#requestOfferBtn, .request-offer-trigger");
  const steps = document.querySelectorAll(".form-step");

  let currentStep = 0;

  offerButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      offerSidebar.classList.remove("hidden");
      setTimeout(() => offerSidebar.classList.add("show"), 10);
      overlay.classList.remove("hidden");
      currentStep = 0;
      showStep(currentStep);
    });
  });


  window.closeOffer = function () {
  offerSidebar.classList.remove("show");
  overlay.classList.add("hidden");
  setTimeout(() => {
    offerSidebar.classList.add("hidden");
  }, 300);
};

  document.getElementById("closeOfferBtn").addEventListener("click", closeOffer);
  overlay.addEventListener("click", closeOffer); // ✅ NOW it’s safe here



  window.nextStep = function () {
    if (currentStep === 0) fillSummary();
    if (currentStep < steps.length - 1) {
      currentStep++;
      showStep(currentStep);
    }
  };

  window.prevStep = function () {
    if (currentStep > 0) {
      currentStep--;
      showStep(currentStep);
    }
  };

  function showStep(index) {
    steps.forEach(step => step.classList.remove("active"));
    if (steps[index]) steps[index].classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function fillSummary() {
    const summary = document.getElementById("summary");
    const formData = new FormData(document.getElementById("offerForm"));
    let html = "<ul>";
    for (let [key, value] of formData.entries()) {
      html += `<li><strong>${key}:</strong> ${value}</li>`;
    }
    html += "</ul>";
    summary.innerHTML = html;
  }

  document.getElementById("offerForm")?.addEventListener("submit", function (e) {
    e.preventDefault();

    const form = this;
    const formData = new FormData(form);

    fetch("backend/submit_offer.php", {
      method: "POST",
      body: formData,
    })
      .then(res => res.text())
      .then(response => {
        if (response.trim() === "success") {
          form.style.display = "none";
          document.querySelector(".success-message").style.display = "block";
        } else {
          alert("❌ Something went wrong. Please try again.");
        }
      })
      .catch(error => {
        alert("❌ Network error. Please try again.");
        console.error(error);
      });
  });


  document.querySelectorAll('input[name="productType"]').forEach(radio => {
    radio.addEventListener("change", (e) => {
      document.querySelectorAll(".conditional").forEach(div => div.classList.add("hidden"));
      if (e.target.value === "veranda") document.getElementById("verandaOptions")?.classList.remove("hidden");
      if (e.target.value === "glass") document.getElementById("glassOptions")?.classList.remove("hidden");
      if (e.target.value === "other") document.getElementById("otherOptions")?.classList.remove("hidden");
    });
  });
}

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