var model = {
    version: VERSION,
    style: "hand-drawn-dark",
    fullname: "Your Name",
    bio: "Add text here",
    entries: [
        {"type":"website","value":"https://vivokey.com","displayname":"vivokey.com"}
    ],
    cleanurl: false
}

document.addEventListener("DOMContentLoaded", () => {
    createbutton.onclick = () => { if (readtos.checked && validateInputs(cardform)) { createCard() } }
})


async function createCard() {
    //TODO regex checks
    // should use pattern in the form
    let password = generatePassword()
    let id = generateID()
    if (customid.value != "")
        id = customid.value

    let response = await fetch('/api/card/new?id=' + id, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'cardData='+fixedEncodeURIComponent(encrypt(JSON.stringify(model), password))
    })
    let result = await response.json()
    if (result.success) {
        createbutton.disabled = true
        location = location.origin + "/app/edit/" + id + "/" + result.secret + "#" + password
    } else {
        alert(result.error)
    }
}
