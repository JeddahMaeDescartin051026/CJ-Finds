// Helper functions
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// Mobile navigation
const menuToggle = $(".menu-toggle");
const mobileMenu = $(".mobile-menu");

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", () => {
    const willOpen = mobileMenu.hidden;
    mobileMenu.hidden = !willOpen;
    menuToggle.setAttribute("aria-expanded", String(willOpen));
  });

  $$(".mobile-menu a").forEach(link => {
    link.addEventListener("click", () => {
      mobileMenu.hidden = true;
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// Search panel
const searchToggle = $(".search-toggle");
const searchPanel = $(".search-panel");

if (searchToggle && searchPanel) {
  searchToggle.addEventListener("click", () => {
    const willOpen = searchPanel.hidden;
    searchPanel.hidden = !willOpen;
    searchToggle.setAttribute("aria-expanded", String(willOpen));

    if (willOpen) {
      $("#search-input")?.focus();
    }
  });
}

// Hero pagination
const heroSlides = [
  {
    eyebrow: "New Season",
    heading: "Modern<br>Essentials",
    description: 'Timeless pieces for a more<br class="desktop-break"> confident you.'
  },
  {
    eyebrow: "Quiet Luxury",
    heading: "Everyday<br>Elegance",
    description: 'Considered details. Effortless<br class="desktop-break"> confidence.'
  },
  {
    eyebrow: "New Favorites",
    heading: "Made to<br>Last",
    description: 'Versatile pieces for wherever<br class="desktop-break"> life takes you.'
  }
];

const hero = $(".hero");

if (hero) {
  $$(".hero-pagination button", hero).forEach(button => {
    button.addEventListener("click", () => {
      const slideIndex = Number(button.dataset.slide);
      const slide = heroSlides[slideIndex];

      if (!slide) return;

      $$(".hero-pagination button", hero).forEach(item => {
        item.classList.toggle("active", item === button);
      });

      $(".hero-copy .eyebrow", hero).textContent = slide.eyebrow;
      $("h1", hero).innerHTML = slide.heading;
      $(".hero-description", hero).innerHTML = slide.description;
    });
  });
}

// Search products, if a product section is present on the page
if (searchPanel) {
  searchPanel.addEventListener("submit", event => {
    event.preventDefault();

    const searchInput = $("#search-input");
    const searchMessage = $(".search-message");
    const productCards = $$(".product-card");
    const featuredSection = $("#featured");

    if (!searchInput) return;

    const term = searchInput.value.trim().toLowerCase();

    // Avoid errors if the updated page has no product cards.
    if (productCards.length === 0) {
      if (searchMessage) {
        searchMessage.textContent =
          "Products are not available to search on this page yet.";
      }
      return;
    }

    let matches = 0;

    productCards.forEach(card => {
      const found = !term ||
        card.textContent.toLowerCase().includes(term);

      card.hidden = !found;

      if (found) matches++;
    });

    if (searchMessage) {
      searchMessage.textContent = term
        ? `${matches} matching find${matches === 1 ? "" : "s"} shown below.`
        : "Showing all featured finds.";
    }

    featuredSection?.scrollIntoView({ behavior: "smooth" });
  });
}
