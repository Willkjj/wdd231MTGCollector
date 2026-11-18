import { searchCardFuzzy, searchAutoComplete } from "./api.js";
import { autocompleteResults, cardTemplate } from "./templates.js";

let decks = []
let cardList = []

function saveCardsLocalStorage() {
    localStorage.setItem("cardList", JSON.stringify(cardList))
}

function getCardsLocalStorage() {
    try {
        cardList = JSON.parse(localStorage.getItem("cardList"))
    } catch (error) {
        console.error(error)
        cardList = []
    }

    if (!cardList) {
        cardList = []
    }
}

function renderCard() {
    const library = document.querySelector(".card-box")

    let html = cardList.map(cardTemplate).join("")

    library.innerHTML = html
}

export function addCardToLibrary(card) {
    const existing = cardList.find(item => item.id === card.id);

    if (existing) {
        existing.quantity += 1;
    } else {
        card.quantity = 1
        cardList.push(card);
    }
    renderCard()
    saveCardsLocalStorage()

}

async function renderAddCard(){
    const button = document.querySelector("#add-cards-btn")

    button.addEventListener("click", async () => {
        const query = document.querySelector("#dropdown-results").firstElementChild.textContent

        const card = await searchCardFuzzy(query)

        addCardToLibrary(card)

        document.querySelector("#add-cards-input").value = ""
        document.querySelector("#dropdown-results").classList.add("hide")
    })

}

async function cardAutoComplete() {
    const input = document.querySelector("#add-cards-input")

    input.addEventListener("input", async (event) => {
        const query = event.target.value
        const cards = await searchAutoComplete(query)

        renderAutoCompleteResults(cards)

    })
}

function renderAutoCompleteResults(input) {

    const resultsBox = document.querySelector("#dropdown-results")
    const cards = input?.data?.slice(0,5) ?? []
    resultsBox.replaceChildren()

    if (cards.length === 0){
        resultsBox.classList.add("hide")
        return
    }
    resultsBox.classList.remove("hide")

    resultsBox.innerHTML = cards
        .map(autocompleteResults)
        .join("")
}

function renderAutoCompleteResultsClick() {
    const resultsBox = document.querySelector("#dropdown-results")
    resultsBox.addEventListener("click", async (e) => {
            const result = e.target.closest("p")
            
            if (!result) { return }

            const query = result.textContent
            const card = await searchCardFuzzy(query)

            addCardToLibrary(card)

            resultsBox.value = ""
            resultsBox.classList.add("hide")
    })
}

function renderCardActions() {

    const cardBox = document.querySelector(".card-box")

    cardBox.addEventListener("click", (e) => {
        const button = e.target.closest("button")
        if (!button) { return }
        
        const article = button.closest("article.card")
        const cardID = article.id
        const card = cardList.find((item) => item.id == cardID)

        if (!card) { return }

        switch (button.dataset.action){
            case "add" :
                card.quantity +=1
                break

            case "remove" :
                card.quantity -= 1

                if (card.quantity <= 0){
                    cardList = cardList.filter((item) => item.id != cardID)
                }
            
        
                break
            case "delete" :
                cardList = cardList.filter((item) => item.id != cardID)
                
                break
        }
        
        renderCard()
        saveCardsLocalStorage()

    })
}


function init(){
    getCardsLocalStorage()
    renderAddCard()
    renderCard()
    cardAutoComplete()
    renderAutoCompleteResultsClick()
    renderCardActions()   
}
init()