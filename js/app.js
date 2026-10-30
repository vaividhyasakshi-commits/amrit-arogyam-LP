(() => {
  "use strict";

  const modal = document.getElementById("enquiryModal");
  const toast = document.getElementById("toast");
  const nav = document.getElementById("navigation");
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImage");

  let toastTimer;

  // ==============================
  // TOAST NOTIFICATIONS
  // ==============================

  const notify = (message, error = false) => {
    if (!toast) return;

    clearTimeout(toastTimer);

    toast.textContent = message;
    toast.style.background = error ? "#8b353c" : "#663a3c";
    toast.style.display = "block";

    toastTimer = setTimeout(() => {
      toast.style.display = "none";
    }, 6500);
  };

  // ==============================
  // ENQUIRY MODAL
  // ==============================

  const closeModal = () => {
    if (!modal) return;

    modal.classList.remove("open");
    document.body.style.overflow = "";
  };

  const openModal = (unit = "") => {
    if (!modal) return;

    modal.classList.add("open");
    document.body.style.overflow = "hidden";

    const configurationInput = document.getElementById(
      "modalConfiguration"
    );

    if (configurationInput) {
      configurationInput.value = unit;
    }

    const firstInput = modal.querySelector("input");

    if (firstInput) {
      firstInput.focus();
    }
  };

  window.closeModal = closeModal;

  // ==============================
  // MOBILE NAVIGATION
  // ==============================

  window.toggleMenu = (button) => {
    if (!nav) return;

    nav.classList.toggle("open");

    if (button) {
      button.setAttribute(
        "aria-expanded",
        String(nav.classList.contains("open"))
      );
    }
  };

  document.querySelectorAll(".navlinks a").forEach((link) => {
    link.addEventListener("click", () => {
      if (nav) {
        nav.classList.remove("open");
      }
    });
  });

  // ==============================
  // ENQUIRY BUTTONS
  // ==============================

  document.querySelectorAll("[data-enquire]").forEach((button) => {
    button.addEventListener("click", () => {
      openModal(button.dataset.unit || "");
    });
  });

  // ==============================
  // CLOSE MODAL
  // ==============================

  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });
  }

  // ==============================
  // ESCAPE KEY
  // ==============================

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();

      if (lightbox) {
        lightbox.classList.remove("open");
      }
    }
  });

  // ==============================
  // IMAGE GALLERY LIGHTBOX
  // ==============================

  document.querySelectorAll(".gallery-grid img").forEach((img) => {
    img.addEventListener("click", () => {
      if (img.classList.contains("missing-image")) return;

      if (!lightbox || !lightboxImage) return;

      lightboxImage.src = img.src;
      lightbox.classList.add("open");
    });
  });

  // ==============================
  // IMAGE FALLBACK
  // ==============================

  const fallbackSvg = `
    <svg xmlns="http://www.w3.org/2000/svg"
         width="900"
         height="650"
         viewBox="0 0 900 650">
      <rect width="900" height="650" fill="#f0e3dc"/>

      <rect
        x="34"
        y="34"
        width="832"
        height="582"
        rx="10"
        fill="none"
        stroke="#cda9a6"
        stroke-dasharray="9 9"
        stroke-width="2"
      />

      <text
        x="450"
        y="322"
        font-family="Arial, sans-serif"
        font-size="22"
        text-anchor="middle"
        fill="#92686a"
      >
        ADD YOUR PROJECT IMAGE
      </text>
    </svg>
  `;

  const fallbackSrc =
    `data:image/svg+xml;charset=utf-8,${encodeURIComponent(fallbackSvg)}`;

  document.querySelectorAll("img:not(.brand-logo img)").forEach((img) => {
    const showFallback = () => {
      if (img.classList.contains("missing-image")) return;

      img.classList.add("missing-image");
      img.src = fallbackSrc;
    };

    img.addEventListener("error", showFallback);

    if (img.complete && img.naturalWidth === 0) {
      showFallback();
    }
  });

  // ==============================
  // FORM VALIDATION
  // ==============================

  const validate = (form) => {
    const name = form.elements.name.value.trim();

    const phone = form.elements.phone.value
      .replace(/[\s()-]/g, "")
      .trim();

    const configuration = form.elements.configuration.value;

    const message = (
      form.elements.message?.value || ""
    ).trim();

    const consent = form.elements.consent?.checked;

    // Name validation
    if (
      name.length < 2 ||
      name.length > 80 ||
      !/^[\p{L} .'-]+$/u.test(name)
    ) {
      throw new Error("Enter a valid name (2–80 letters).");
    }

    // Phone validation
    if (!/^\+?[0-9]{10,15}$/.test(phone)) {
      throw new Error(
        "Enter a valid phone number (10–15 digits)."
      );
    }

    // Property configuration validation
    const allowedConfigurations = [
      "1 BHK",
      "2 BHK",
      "3 BHK",
      "Penthouse",
      "Need guidance",
    ];

    if (!allowedConfigurations.includes(configuration)) {
      throw new Error("Choose a property configuration.");
    }

    // Message validation
    if (message.length > 1000) {
      throw new Error(
        "Message must be under 1000 characters."
      );
    }

    // Consent validation
    if (!consent) {
      throw new Error(
        "Please agree to be contacted."
      );
    }

    return {
      name,
      phone,
      configuration,
      message,
      consent: true,
    };
  };

  // ==============================
  // FORM SUBMISSION — PHP SMTP
  // ==============================

  document.querySelectorAll(".enquiry-form").forEach((form) => {
    form.noValidate = true;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      let payload;

      try {
        payload = validate(form);
      } catch (error) {
        notify(error.message, true);
        return;
      }

      const button = form.querySelector('[type="submit"]');

      if (!button) return;

      const originalLabel = button.textContent;

      button.disabled = true;
      button.textContent = "Sending...";

      try {
        const response = await fetch("php/send-enquiry.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Mail delivery failed."
          );
        }

        notify(
          "Thank you! Your enquiry has been received."
        );

        form.reset();
        closeModal();

      } catch (error) {
        notify(
          "Could not submit the enquiry. Please call or WhatsApp us. " +
            error.message,
          true
        );

      } finally {
        button.disabled = false;
        button.textContent = originalLabel;
      }
    });
  });
})();