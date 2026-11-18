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
            <img src="${card.card_faces[0]?.image_uris?.grid}" alt="${card.name}">
        </div>
        <p>${card.name}</p>
        <p class="set-marker">${card.set}<span class="card-id">${card.collector_number}</span></p>
        <div class="card-actions">
            <button>-</button>
            <button class="owned">${card.quantity} Owned</button>
            <button>+</button>
            <button>x</button>
        </div>
    </article>`

}

// export function cardTemplate(card) {
//     return `            
//     <article class="card" id="${card.id}">
//         <div class="image-wrap">
//             <img src="${card.image_uris.grid}" alt="${card.name}">
//         </div>
//         <p>${card.name}</p>
//         <p class="set-marker">${card.set}<span class="card-id">${card.collector_number}</span></p>
//         <div class="card-actions">
//             <button>-</button>
//             <button class="owned">${card.quantity} Owned</button>
//             <button>+</button>
//             <button>x</button>
//         </div>
//     </article>`

// }