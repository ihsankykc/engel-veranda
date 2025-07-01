
function initOfferSidebar() {
  const offerSidebar = document.getElementById("offerSidebar");
  const overlay = document.getElementById("overlay");
  const steps = document.querySelectorAll(".form-step");

  let currentStep = 0;
  let selectedProduct = null;
  let cart = [];

    const translations = {
      nl: {
        "Black": "Zwart",
        "White": "Wit",
        "Anthracite": "Antraciet",
        "Policarbon Bright": "Polycarbonaat helder",
        "Policarbon Shaded": "Polycarbonaat opaal",
        "Glass": "Glas",
        "LED Inbouwspots": "LED inbouwspots",
        "LED Lighting with Dimbaar": "LED dimbare verlichting",
        "Other": "Overig",
        "Glass Sliding Walls": "Glazen schuifwanden",
        "Locked Glass Systems": "Gesloten glassystemen",
        "Double Glazing": "Dubbel glas"
      },
      de: {
        "Black": "Schwarz",
        "White": "Weiß",
        "Anthracite": "Anthrazit",
        "Policarbon Bright": "Klarer Polycarbonat",
        "Policarbon Shaded": "Opales Polycarbonat",
        "Glass": "Glas",
        "LED Inbouwspots": "LED Einbauspots",
        "LED Lighting with Dimbaar": "Dimmbare LED Beleuchtung",
        "Other": "Sonstiges",
        "Glass Sliding Walls": "Glasschiebewände",
        "Locked Glass Systems": "Verschlossene Glassysteme",
        "Double Glazing": "Doppelverglasung"
      },
      tr: {
        "Black": "Siyah",
        "White": "Beyaz",
        "Anthracite": "Antrasit",
        "Policarbon Bright": "Şeffaf Polikarbon",
        "Policarbon Shaded": "Opal Polikarbon",
        "Glass": "Cam",
        "LED Inbouwspots": "LED gömme spot",
        "LED Lighting with Dimbaar": "Dimlenebilir LED Aydınlatma",
        "Other": "Diğer",
        "Glass Sliding Walls": "Cam sürgülü duvarlar",
        "Locked Glass Systems": "Kilitli cam sistemleri",
        "Double Glazing": "Çift cam"
      }
    };

    const keyTranslations = {
    nl: {
      verandaType: "Verandatype",
      width: "Breedte",
      depth: "Diepte",
      color: "Kleur",
      ceiling: "Dak",
      frontside: "Voorkant",
      leftside: "Linkerkant",
      rightside: "Rechterkant",
      spieLeft: "Linker Spie",
      spieRight: "Rechter Spie",
      lighting: "Verlichting",
      glassType: "Type glas",
      glassWidth: "Glasbreedte",
      customMessage: "Bericht",
      photos: "Foto's"
    },
    de: {
      verandaType: "Verandatyp",
      width: "Breite",
      depth: "Tiefe",
      color: "Farbe",
      ceiling: "Dach",
      frontside: "Vorderseite",
      leftside: "Linke Seite",
      rightside: "Rechte Seite",
      spieLeft: "Linke Spie",
      spieRight: "Rechte Spie",
      lighting: "Beleuchtung",
      glassType: "Glasart",
      glassWidth: "Glasbreite",
      customMessage: "Nachricht",
      photos: "Fotos"
    },
    tr: {
      verandaType: "Veranda Tipi",
      width: "Genişlik",
      depth: "Derinlik",
      color: "Renk",
      ceiling: "Tavan",
      frontside: "Ön Taraf",
      leftside: "Sol Taraf",
      rightside: "Sağ Taraf",
      spieLeft: "Sol Spie",
      spieRight: "Sağ Spie",
      lighting: "Aydınlatma",
      glassType: "Cam Türü",
      glassWidth: "Cam Genişliği",
      customMessage: "Mesajınız",
      photos: "Fotoğraflar"
    }
  };


  
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

  // get page language, fallback to en
  const lang = document.documentElement.lang || "en";

  if (cart.length === 0) {
    summary.innerHTML = "<p>Er zijn nog geen producten toegevoegd.</p>";
    return;
  }

  cart.forEach((item, index) => {
    const container = document.createElement("div");
    container.classList.add("cart-item");
    container.innerHTML = `
      <h4>Item ${index + 1}</h4>
      <ul></ul>
      <button class="button small" onclick="removeCartItem(${index})" style="
        margin-top: 0.5em;
        background: #dc3545;
      ">🗑 ${
        lang === "nl"
          ? "Verwijderen"
          : lang === "de"
          ? "Entfernen"
          : lang === "tr"
          ? "Sil"
          : "Remove"
      }</button>
    `;

    const ul = container.querySelector("ul");

    for (const key in item) {
      if (
        ["name", "email", "phone", "address", "form-name", "bot-field"].includes(
          key
        )
      )
        continue;

      let display = "";
      const value = item[key];
      if (value instanceof FileList) {
        display = [...value].map((f) => f.name).join(", ");
      } else if (Array.isArray(value)) {
        display = value.join(", ");
      } else {
        display = value;
      }

      // translation lookup
      const translated =
        translations[lang] && translations[lang][display]
          ? translations[lang][display]
          : display;

      const li = document.createElement("li");
      const translatedKey = (keyTranslations[lang] && keyTranslations[lang][key]) || key;
      li.innerHTML = `<strong>${translatedKey}</strong>: ${translated}`;
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

  // get <html lang="..."> or default to "en"
  const htmlLang = document.documentElement.lang || "en";

  // list of supported languages
  const supportedLangs = ["en", "nl", "de", "tr"];
  
  // fallback if the language is unsupported
  const lang = supportedLangs.includes(htmlLang) ? htmlLang : "en";

  const sidebarFile = `/components/offerSidebar.${lang}.html`;

  console.log(`🔄 Fetching sidebar for language: ${lang}`);

  fetch(sidebarFile)
    .then(response => {
      if (!response.ok) throw new Error(`Failed to load ${sidebarFile}`);
      return response.text();
    })
    .then(html => {
      sidebarTarget.innerHTML = html;
      console.log(`✅ Sidebar for ${lang} inserted into DOM`);
      initOfferSidebar();
      console.log("✅ initOfferSidebar() called");
    })
    .catch(err => {
      console.error(`❌ Failed to load ${sidebarFile}`, err);
    });
});