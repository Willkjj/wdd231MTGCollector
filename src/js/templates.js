export function autocompleteResults(result){
    return `
    <p>${result}</p>
    `
}

export function cardTemplate(card) {
    const img = card.image_uris?.grid ? card.image_uris.grid : card.card_faces[0].image_uris.grid
    return `            
    <article class="card" id="${card.id}">
        <div class="image-wrap">
            <img src="${img}" alt="${card.name}">
        </div>
        <p>${card.name}</p>
        <p class="set-marker">${card.set}<span class="card-id">${card.collector_number}</span></p>
        <div class="card-actions">
            <button data-action="remove">-</button>
            <button class="owned">${card.quantity} Owned</button>
            <button data-action="add">+</button>
            <button data-action="delete">x</button>
        </div>
    </article>`

}