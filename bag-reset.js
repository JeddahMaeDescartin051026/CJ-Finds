/* CJ Finds - empties the bag on refresh, first visit, and checkout.
   Load this BEFORE bag.js on every page:
   <script src="bag-reset.js" defer></script>
   <script src="bag.js" defer></script>
*/
(function () {
  "use strict";

  var STORAGE_KEY = "cjfinds_bag_count";        // same key bag.js uses
  var SESSION_FLAG = "cjfinds_session_started"; // marks that this tab has already been opened
  var CHECKOUT_SELECTOR = ".checkout-button";   // your checkout button

  // 1. Was this page load a refresh?
  var isReload = false;
  var entries = performance.getEntriesByType && performance.getEntriesByType("navigation");
  if (entries && entries.length) {
    isReload = entries[0].type === "reload";
  } else if (performance.navigation) {
    isReload = performance.navigation.type === 1;
  }

  // 2. Is this the first time this tab/session opened the site?
  var firstVisit = true;
  try {
    firstVisit = !sessionStorage.getItem(SESSION_FLAG);
    sessionStorage.setItem(SESSION_FLAG, "1");
  } catch (e) {}

  // Empty the bag count before bag.js reads it
  if (isReload || firstVisit) {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  }

  // 3. Empty the bag when the customer continues to checkout
  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest(CHECKOUT_SELECTOR);
    if (btn && !btn.disabled && window.CJBag) {
      window.CJBag.set(0);
    }
  });
})();
