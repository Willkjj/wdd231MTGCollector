import { getRandom } from "./api.js";

let decks = []
let cardList = []

function renderCard() {
    const library = document.querySelector(".card-box")

    let html = cardList.map(cardTemplate).join("")

    library.innerHTML = html

}

function cardTemplate(card) {
    return `            
    <article class="card">
        <div class="image-wrap">
            <img src="${card.image_uris.normal}" alt="test card">
        </div>
        <p>card name</p>
        <p class="set-marker">set marker <span class="card-id">001</span></p>
        <div class="card-actions">
            <button>-</button>
            <button class="owned">1 Owned</button>
            <button>+</button>
            <button>x</button>
        </div>
    </article>`

}

async function test(){
    const button = document.querySelector("#add-cards-btn")

    button.addEventListener("click", async () => {
        const card = await getRandom()
        cardList.push(card)
        
        renderCard()

    })

}


function init(){
    test()

}
init()