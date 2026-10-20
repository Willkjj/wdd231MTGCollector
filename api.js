export function queryFromFilters($) {
  const query = $("card-query").value.trim();
  const terms = [];
  if (query) terms.push(query);

  const color = $("search-color").value;
  const rarity = $("search-rarity").value;
  const type = $("search-type").value;

  if (color === "C") terms.push("colorless");
  else if (color) terms.push(`color:${color.toLowerCase()}`);
  if (rarity) terms.push(`rarity:${rarity}`);
  if (type) terms.push(`type:${type}`);

  return terms.join(" ");
}

export async function searchCards(state, $, cardMarkup) {
  const requestId = ++state.searchRequestId;
  const query = queryFromFilters($);
  if (!query) {
    $("search-message").textContent =
      "Enter a card name or search term to explore the Scryfall database.";
    $("search-results").innerHTML = "";
    return;
  }

  state.isShowingFeatured = false;
  $("search-message").textContent = "Searching the multiverse…";
  $("search-results").innerHTML = "";

  try {
    const url =
      `https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}` +
      "&order=name&unique=prints";
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      if (data.object === "error") {
        throw new Error(data.details || "No cards matched that search.");
      }
      throw new Error("Scryfall could not complete the search. Please try again.");
    }

    if (requestId !== state.searchRequestId) return;
    state.searchResults = data.data || [];
    $("search-message").textContent =
      `${data.total_cards.toLocaleString()} printing` +
      `${data.total_cards === 1 ? "" : "s"} found` +
      `${data.has_more ? " · Showing first 20" : ""}.`;
    $("search-results").innerHTML =
      state.searchResults.slice(0, 20).map(card => cardMarkup(card)).join("");
  } catch (error) {
    if (requestId !== state.searchRequestId) return;
    const message = error instanceof Error ? error.message : String(error);
    $("search-message").textContent = message.includes("Failed to fetch")
      ? "Could not connect to Scryfall. Check your internet connection and try again."
      : message;
  }
}

export async function loadFeaturedCards(state, $, cardMarkup) {
  if (queryFromFilters($) || state.featuredLoading) return;

  if (state.featuredCards) {
    state.searchResults = state.featuredCards;
    state.isShowingFeatured = true;
    $("search-message").textContent = "Popular Commander cards to get you started.";
    $("search-results").innerHTML =
      state.searchResults.map(card => cardMarkup(card)).join("");
    return;
  }

  const requestId = ++state.searchRequestId;
  state.featuredLoading = true;
  $("search-message").textContent = "Loading featured cards…";
  $("search-results").innerHTML = "";

  try {
    const query = encodeURIComponent("legal:commander");
    const response = await fetch(
      `https://api.scryfall.com/cards/search?q=${query}&order=edhrec&unique=cards`
    );
    const data = await response.json();

    if (!response.ok) {
      if (data.object === "error") {
        throw new Error(data.details || "Featured cards could not be loaded.");
      }
      throw new Error("Scryfall could not load featured cards. Please try again.");
    }

    if (requestId !== state.searchRequestId) return;
    state.featuredCards = (data.data || []).slice(0, 20);
    state.searchResults = state.featuredCards;
    state.isShowingFeatured = true;
    $("search-message").textContent = state.featuredCards.length
      ? "Popular Commander cards to get you started."
      : "No featured cards are available right now. Search for a card to explore.";
    $("search-results").innerHTML =
      state.featuredCards.map(card => cardMarkup(card)).join("");
  } catch (error) {
    if (requestId !== state.searchRequestId) return;
    const message = error instanceof Error ? error.message : String(error);
    $("search-message").textContent = message.includes("Failed to fetch")
      ? "Could not connect to Scryfall. Check your internet connection and try again."
      : message;
  } finally {
    state.featuredLoading = false;
  }
}
