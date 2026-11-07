import { searchCardFuzzy } from "./api.js";

let decks = []
let cardList = []

function renderCard() {
    const library = document.querySelector(".card-box")

    let html = cardList.map(cardTemplate).join("")

    library.innerHTML = html

}

function cardTemplate(card) {
    return `            
    <article class="card" id="${card.id}">
        <div class="image-wrap">
            <img src="${card.image_uris.grid}" alt="${card.name}">
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

export function addCardToLibrary(card) {
    const existing = cardList.find(item => item.id === card.id);

    if (existing) {
        existing.quantity += 1;
    } else {
        card.quantity = 1
        cardList.push(card);
    }
    console.log(cardList)
}

async function renderAddCard(){
    const button = document.querySelector("#add-cards-btn")

    button.addEventListener("click", async () => {
        const query = document.querySelector("#add-cards-input").value

        const card = await searchCardFuzzy(query)

        addCardToLibrary(card)
        renderCard()

    })

}


function init(){
    renderAddCard()

}
init()