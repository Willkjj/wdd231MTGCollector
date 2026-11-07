const baseUrl = "https://api.scryfall.com/cards/"

export async function getJson(url){
  const options = {
    method: "GET",
  }
  let data = {};
  const response = await fetch(baseUrl + url, options)

  if (response.ok) {
    data = await response.json()
  } else throw new Error("response not ok!")

  return data
}

export async function getRandom(){
    const card = await getJson("random")
    console.log(card)
    
    return card
}


export async function searchAutoComplete(query) {
  if (query.length() < 2) { return }
  const card = await getJson("autocomplete?q=${query}")

}

export async function searchCardFuzzy(query) {
  const string = query.replace(" ", "+")

  const card = await getJson(`named?fuzzy=${string}`)
  return card
}