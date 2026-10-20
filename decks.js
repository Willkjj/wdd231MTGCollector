import { escapeHTML } from "./utils.js";

export function renderDecks(state, context) {
  const { $ } = context;
  const root = $("decks-list");
  if (!state.decks.length) {
    root.innerHTML =
      `<div class="empty-state"><strong>No decks yet.</strong>` +
      `Create a deck to start grouping cards from your library.<br><br>` +
      `<button class="btn btn-primary" id="empty-create-deck">＋ Create your first deck</button></div>`;
    return;
  }

  root.innerHTML = state.decks.map(deck => {
    const entries = deck.cards || [];
    const count = entries.reduce((sum, entry) => sum + entry.quantity, 0);
    const owned = entries.reduce((sum, entry) => {
      const card = state.collection.find(item => item.key === entry.key);
      return sum + Math.min(entry.quantity, card?.quantity || 0);
    }, 0);
    const lines = entries.length
      ? `<div class="deck-cards">${entries.map(entry =>
          `<div class="deck-card-line"><span>${escapeHTML(entry.name)} ` +
          `<span style="color:#81907d">×${entry.quantity}</span></span>` +
          `<button data-deck-remove="${escapeHTML(deck.id)}" data-deck-card="${escapeHTML(entry.key)}" ` +
          `aria-label="Remove ${escapeHTML(entry.name)} from deck">×</button></div>`
        ).join("")}</div>`
      : "";
    const options = state.collection.map(card =>
      `<option value="${escapeHTML(card.key)}">${escapeHTML(card.name)} (${card.quantity} owned)</option>`
    ).join("");
    return (
      `<article class="deck-card">` +
      `<div class="deck-card-top"><span class="deck-format">${escapeHTML(deck.format.toUpperCase())}</span>` +
      `<button class="icon-button" data-delete-deck="${escapeHTML(deck.id)}" aria-label="Delete deck">×</button>` +
      `</div><h3>${escapeHTML(deck.name)}</h3>` +
      `<p>${escapeHTML(deck.description || "A new strategy in the making.")}</p>` +
      `<div class="deck-card-stats"><div><strong>${count}</strong>CARDS IN DECK</div>` +
      `<div><strong>${owned}</strong>AVAILABLE IN LIBRARY</div></div>` +
      `<div class="deck-card-actions">` +
      `${state.collection.length
        ? `<select aria-label="Choose card to add to ${escapeHTML(deck.name)}" id="select-${escapeHTML(deck.id)}">` +
          `<option value="">Choose a card from library…</option>${options}</select>` +
          `<button class="btn btn-primary" data-deck-add="${escapeHTML(deck.id)}">Add</button>`
        : `<span style="color:#8e9c89;font-size:11px">Add cards to your library first.</span>`}` +
      `</div>${lines}</article>`
    );
  }).join("");
}

export function createDeck(event, state, context) {
  event.preventDefault();
  const { $ } = context;
  const name = $("deck-name").value.trim();
  if (!name) {
    $("deck-name").focus();
    return;
  }

  state.decks.push({
    id: crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`,
    name,
    format: $("deck-format").value,
    description: $("deck-description").value.trim(),
    cards: []
  });
  context.persist();
  $("deck-dialog").close();
  $("deck-form").reset();
  context.renderDecks();
  context.showToast(`Deck “${name}” created.`);
}

export function addCardToDeck(deckId, key, state, context) {
  const deck = state.decks.find(item => item.id === deckId);
  if (!deck) return;

  const card = state.collection.find(item => item.key === key);
  if (!card) {
    context.showToast("Choose a card from your library first.");
    return;
  }

  deck.cards ||= [];
  const entry = deck.cards.find(item => item.key === key);
  const alreadyInDeck = entry?.quantity || 0;
  if (alreadyInDeck >= card.quantity) {
    context.showToast(`Only ${card.quantity} ${card.name} owned in your library.`);
    return;
  }

  if (entry) entry.quantity += 1;
  else deck.cards.push({ key: card.key, name: card.name, quantity: 1 });

  context.persist();
  context.renderDecks();
  context.showToast(`${card.name} added to ${deck.name}.`);
}

export function removeCardFromDeck(deckId, key, state, context) {
  const deck = state.decks.find(item => item.id === deckId);
  const entry = deck?.cards?.find(item => item.key === key);
  if (!deck || !entry) return;

  entry.quantity -= 1;
  if (entry.quantity <= 0) {
    deck.cards = deck.cards.filter(item => item.key !== entry.key);
  }

  context.persist();
  context.renderDecks();
}

export function deleteDeck(deckId, state, context) {
  const deck = state.decks.find(item => item.id === deckId);
  if (!deck) return;

  state.decks = state.decks.filter(item => item.id !== deck.id);
  context.persist();
  context.renderDecks();
  context.showToast("Deck deleted.");
}
