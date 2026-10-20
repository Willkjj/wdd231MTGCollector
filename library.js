import { escapeHTML } from "./utils.js";

export const cardKey = card =>
  card.id || `${card.name}|${card.set}|${card.collector_number}`;

export const cardImage = card =>
  card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || "";

export function cardMarkup(card, state, context = "search") {
  const key = cardKey(card);
  const inCollection = state.collection.find(item => item.key === key);
  const imageUrl = cardImage(card);
  const title = escapeHTML(card.name);
  const set = escapeHTML(card.set_name || card.set || "Unknown set");
  const image = imageUrl
    ? `<img class="card-image" loading="lazy" src="${escapeHTML(imageUrl)}" alt="${title}" onerror="this.parentElement.innerHTML='<div class=&quot;card-placeholder&quot;><strong>${title}</strong><span>IMAGE UNAVAILABLE</span></div>'">`
    : `<div class="card-placeholder"><strong>${title}</strong><span>${set}</span></div>`;

  let actions = "";
  if (context === "search") {
    actions =
      `<div class="card-actions"><button class="add-button" data-add="${escapeHTML(key)}">` +
      `＋ ${inCollection ? "Add another" : "Add to library"}</button></div>`;
  } else if (context === "library") {
    actions =
      `<div class="card-actions">` +
      `<button class="qty-button" data-qty="${escapeHTML(key)}" data-delta="-1" aria-label="Remove one ${title}">−</button>` +
      `<button class="qty-button" disabled>${inCollection?.quantity || 0} owned</button>` +
      `<button class="qty-button" data-qty="${escapeHTML(key)}" data-delta="1" aria-label="Add one ${title}">＋</button>` +
      `<button class="remove-button" data-remove="${escapeHTML(key)}" title="Remove card">×</button>` +
      `</div>`;
  }

  return (
    `<article class="card-result" data-card-key="${escapeHTML(key)}">` +
    `${inCollection && context === "search" ? `<span class="owned-pill">OWNED ×${inCollection.quantity}</span>` : ""}` +
    `<div class="card-image-wrap">${image}</div>` +
    `<div class="card-result-info"><div class="card-title" title="${title}">${title}</div>` +
    `<div class="card-meta">${set} · ${escapeHTML(card.collector_number || "")}</div>${actions}</div>` +
    `</article>`
  );
}

export function renderLibrary(state, context) {
  const { $, updateStats } = context;
  const query = $("library-query").value.trim().toLowerCase();
  const color = $("library-color").value;
  const sort = $("library-sort").value;

  let cards = state.collection.filter(card =>
    card.name.toLowerCase().includes(query) ||
    (card.set_name || "").toLowerCase().includes(query)
  );

  if (color === "C") cards = cards.filter(card => !card.colors?.length);
  else if (color) cards = cards.filter(card => card.colors?.includes(color));

  cards = [...cards].sort((first, second) =>
    sort === "quantity"
      ? second.quantity - first.quantity
      : sort === "set"
        ? (first.set_name || "").localeCompare(second.set_name || "")
        : first.name.localeCompare(second.name)
  );

  $("library-message").textContent = cards.length
    ? `${cards.length} unique printing${cards.length === 1 ? "" : "s"} shown.`
    : state.collection.length
      ? "No cards match those filters."
      : "Your library is waiting for its first card. Search the database to get started.";
  $("library-grid").innerHTML =
    cards.map(card => cardMarkup(card, state, "library")).join("");
  updateStats();
}

export function addCard(key, state, context) {
  const { $, persist, showToast } = context;
  const card = state.searchResults.find(item => cardKey(item) === key);
  if (!card) return;

  const existing = state.collection.find(item => item.key === key);
  if (existing) {
    existing.quantity += 1;
  } else {
    state.collection.push({
      key,
      id: card.id,
      name: card.name,
      set: card.set,
      set_name: card.set_name,
      collector_number: card.collector_number,
      quantity: 1,
      colors: card.colors || [],
      rarity: card.rarity,
      type_line: card.type_line,
      image_uris: card.image_uris || null,
      card_faces: card.card_faces?.map(face => ({ image_uris: face.image_uris })) || null,
      mana_cost: card.mana_cost || card.card_faces?.[0]?.mana_cost || "",
      cmc: card.cmc || 0
    });
  }

  persist();
  $("search-results").innerHTML =
    state.searchResults.slice(0, 20)
      .map(result => cardMarkup(result, state)).join("");
  showToast(`${card.name} added to your library.`);
}

export function changeQuantity(key, delta, state, context) {
  const card = state.collection.find(item => item.key === key);
  if (!card) return;

  card.quantity += delta;
  if (card.quantity <= 0) {
    state.collection = state.collection.filter(item => item.key !== key);
  }

  context.persist();
  context.renderLibrary();
  context.renderDecks();
}

export function removeCard(key, state, context) {
  const card = state.collection.find(item => item.key === key);
  if (!card) return;

  state.collection = state.collection.filter(item => item.key !== key);
  state.decks.forEach(deck => {
    deck.cards = (deck.cards || []).filter(item => item.key !== key);
  });

  context.persist();
  context.renderLibrary();
  context.renderDecks();
  context.showToast(`${card.name} removed from your library and decks.`);
}
