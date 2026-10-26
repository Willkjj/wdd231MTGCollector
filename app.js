import { loadFeaturedCards, searchCards } from "./api.js";
import {
  addCard,
  cardMarkup,
  changeQuantity,
  removeCard,
  renderLibrary
} from "./library.js";
import {
  addCardToDeck,
  createDeck,
  deleteDeck,
  removeCardFromDeck,
  renderDecks
} from "./decks.js";
import { loadData, saveData } from "./storage.js";
import { escapeHTML } from "./utils.js";

// Keep the working collection and decks in memory; load their saved copies on startup.
const state = {
  ...loadData(),
  searchResults: [],
  searchRequestId: 0,
  featuredCards: null,
  featuredLoading: false,
  isShowingFeatured: false,
  pendingDeleteDeckId: null,
  toastTimer: null
};

// Short helper for finding page elements by their HTML id.
const $ = id => document.getElementById(id);
const validViews = new Set(["search", "library", "decks"]);

// Show a brief status message, replacing any toast that is already visible.
function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

// Recalculate collection totals and put them in the counters around the page.
function updateStats() {
  const total = state.collection.reduce((sum, item) => sum + item.quantity, 0);
  const unique = state.collection.length;
  const deckCount = state.decks.length;
  $("hero-card-count").textContent = total;
  $("hero-unique-count").textContent = unique;
  $("hero-deck-count").textContent = deckCount;
  $("nav-library-count").textContent = unique;
  $("nav-deck-count").textContent = deckCount;
  $("library-total").textContent = total;
  $("library-unique").textContent = unique;
  $("library-sets").textContent =
    new Set(state.collection.map(card => card.set).filter(Boolean)).size;
}

// Save current user data and refresh the totals after a successful write.
function persist() {
  if (!saveData(state)) {
    showToast("Browser storage is full. Try removing some cards.");
    return;
  }
  updateStats();
}

// Pass shared app services to feature modules without making them import app.js.
function getContext() {
  return {
    $,
    state,
    escapeHTML,
    persist,
    showToast,
    updateStats,
    renderLibrary: () => renderLibrary(state, getContext()),
    renderDecks: () => renderDecks(state, getContext())
  };
}

// Read the requested section from the URL, falling back to Discover if it is invalid.
// Use the URL's view parameter to restore the user's current section.
function readRoute() {
  const parameters = new URLSearchParams(window.location.search);
  const requestedView = parameters.get("view");
  return {
    view: validViews.has(requestedView) ? requestedView : "search"
  };
}

// Update the URL without reloading the page so navigation can use browser history.
function writeRoute(view) {
  const url = new URL(window.location.href);
  url.searchParams.set("view", view);
  url.searchParams.delete("deckId");
  window.history.pushState({}, "", url);
}

// Display one section, update navigation and breadcrumb, and render its content.
function switchView(view, { updateUrl = true } = {}) {
  if (!validViews.has(view)) view = "search";
  if (updateUrl) writeRoute(view);

  document.querySelectorAll(".view").forEach(element => {
    element.classList.toggle("active", element.id === `view-${view}`);
  });
  document.querySelectorAll(".nav-item").forEach(element => {
    const isActive = element.dataset.view === view;
    element.classList.toggle("active", isActive);
    if (isActive) element.setAttribute("aria-current", "page");
    else element.removeAttribute("aria-current");
  });
  $("breadcrumb-current").textContent = {
    search: "DISCOVER",
    library: "MY LIBRARY",
    decks: "DECK BUILDER"
  }[view];

  if (view === "library") renderLibrary(state, getContext());
  if (view === "decks") renderDecks(state, getContext());
  if (view === "search") {
    loadFeaturedCards(state, $, card => cardMarkup(card, state));
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Handle clicks from both static HTML and buttons added later when results render.
// The data-* attributes identify which card or deck action the user chose.
document.addEventListener("click", event => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const nav = target.closest("[data-view]");
  if (nav) {
    switchView(nav.dataset.view);
  }

  const add = target.closest("[data-add]");
  if (add) addCard(add.dataset.add, state, getContext());

  const quantity = target.closest("[data-qty]");
  if (quantity) {
    changeQuantity(
      quantity.dataset.qty,
      Number(quantity.dataset.delta),
      state,
      getContext()
    );
  }

  const remove = target.closest("[data-remove]");
  if (remove) removeCard(remove.dataset.remove, state, getContext());

  const create = target.closest("#new-deck-button, #empty-create-deck");
  if (create) {
    if (!state.collection.length) {
      showToast("Tip: add cards to your library so you can build your deck.");
    }
    $("deck-dialog").showModal();
    $("deck-name").focus();
  }

  const deleteButton = target.closest("[data-delete-deck]");
  if (deleteButton) {
    const deck = state.decks.find(item => item.id === deleteButton.dataset.deleteDeck);
    if (deck) {
      // Store the target until the user confirms in the custom dialog.
      state.pendingDeleteDeckId = deck.id;
      $("delete-deck-title").textContent = `Delete “${deck.name}”?`;
      $("delete-deck-dialog").showModal();
    }
  }

  const addDeck = target.closest("[data-deck-add]");
  if (addDeck) {
    const deckId = addDeck.dataset.deckAdd;
    const key = $(`select-${deckId}`).value;
    addCardToDeck(deckId, key, state, getContext());
  }

  const deckRemove = target.closest("[data-deck-remove]");
  if (deckRemove) {
    removeCardFromDeck(
      deckRemove.dataset.deckRemove,
      deckRemove.dataset.deckCard,
      state,
      getContext()
    );
  }
});

// Search on submit; changing any search filter reruns the current query.
$("search-form").addEventListener("submit", event => {
  event.preventDefault();
  searchCards(state, $, card => cardMarkup(card, state));
});
["search-color", "search-rarity", "search-type"].forEach(id => {
  $(id).addEventListener("change", () => {
    searchCards(state, $, card => cardMarkup(card, state));
  });
});

// Connect page controls to view rendering and modal actions.
$("browse-from-library").addEventListener("click", () => switchView("search"));
["library-query", "library-color", "library-sort"].forEach(id => {
  $(id).addEventListener(
    id === "library-query" ? "input" : "change",
    () => renderLibrary(state, getContext())
  );
});
$("new-deck-button").addEventListener("click", () => $("deck-dialog").showModal());
$("close-deck-dialog").addEventListener("click", () => $("deck-dialog").close());
$("cancel-deck").addEventListener("click", () => $("deck-dialog").close());
$("close-delete-deck-dialog").addEventListener("click", () => $("delete-deck-dialog").close());
$("cancel-delete-deck").addEventListener("click", () => $("delete-deck-dialog").close());
$("delete-deck-dialog").addEventListener("close", () => {
  // Clear the pending target whether the dialog was canceled or confirmed.
  state.pendingDeleteDeckId = null;
});
$("confirm-delete-deck").addEventListener("click", () => {
  const deckId = state.pendingDeleteDeckId;
  $("delete-deck-dialog").close();
  if (deckId) deleteDeck(deckId, state, getContext());
});
$("deck-form").addEventListener("submit", event =>
  createDeck(event, state, getContext())
);

// Restore the correct section when the user navigates with browser Back or Forward.
window.addEventListener("popstate", () => {
  const route = readRoute();
  switchView(route.view, { updateUrl: false });
});

// Prepare saved data and render the section requested by the current URL.
updateStats();
renderLibrary(state, getContext());
renderDecks(state, getContext());
const initialRoute = readRoute();
switchView(initialRoute.view, {
  updateUrl: false
});
