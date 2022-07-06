errors = {
    nopassword: "No password found. Scan the NFC chip again to see this business card.",
    notfound: "Business card not found.",
    404: "That's a 404.",
    wrongpassword: "Wrong password."
}

function showError(code) {
    let error = errors[code];
    if(error === undefined)
        error = "I do not even know what kind of error just occured."
    errordiv.innerText = error
}

document.addEventListener("DOMContentLoaded", () => {
    showError(location.hash.substr(1))
})