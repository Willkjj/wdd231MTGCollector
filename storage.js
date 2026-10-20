const STORAGE_KEY = "mtgCollector.v1";

export function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      collection: Array.isArray(saved.collection) ? saved.collection : [],
      decks: Array.isArray(saved.decks) ? saved.decks : []
    };
  } catch {
    return { collection: [], decks: [] };
  }
}

export function saveData(state) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ collection: state.collection, decks: state.decks })
    );
    return true;
  } catch {
    return false;
  }
}
