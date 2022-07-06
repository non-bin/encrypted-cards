var VERSION = "0.2-beta";

function encrypt(text, password) {
    return CryptoJS.AES.encrypt(text, password).toString()
}

function decrypt(text, password) {
    return CryptoJS.AES.decrypt(text, password).toString(CryptoJS.enc.Utf8)
}

function removeHashFromUrl() {
    //TODO a nice addon would be that the password doesn't stay in the history
    history.replaceState(history.state, document.title, location.href.substr(0, location.href.indexOf("#")));
}

async function getModel(id, password) {
    // fetch encrypted data
    let data = "";
    await fetch("/api/read/" + id).then(x => x.text().then(encrypted => data = encrypted))
    if (data == "") {
        throw "not found"
    }
    // decrypt data
    let decrypted = decrypt(data, password)
    if (decrypted == "") {
        throw "wrong password"
    }
    console.log(decrypted)
    return JSON.parse(decrypted)
}

var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-"

function generatePassword() {
    return generateRandomString(22)
}

function generateID() {
    return generateRandomString(10)
}

function generateRandomString(len) {
    let result = "";
    let buf = new Uint8Array(len);
    window.crypto.getRandomValues(buf);
    buf.forEach(x => result += chars.charAt(x % chars.length))
    return result
}

function validateInputs(div) {
    return Array.from(div.getElementsByTagName("input")).filter(x => x.reportValidity() == false).length == 0
}

function generateName(type, value) {
    switch (type) {
        case "stackoverflow":
            if (value.startsWith("https://stackoverflow.com/users/"))
                return value.replace(/^.*\//, "")
            else
                return value.replace(/^https:\/\/stackoverflow.com/, "")
        case "github":
        case "twitter":
        case "dangerousthings":
            return (value.startsWith("@") ? value : "@" + value)
        case "discord":
        case "googleplay":
        case "linkedin":
        case "snapchat":
        case "spotify":
        case "xing":
        case "youtube":
            return value.replace(/^https?:\/\/[^/]+\//, "")
        case "website":
            return value.replace(/^https?:\/\//, "")
        default:
            return value
    }
}

//TODO add lots of strict checks for correct input and share those filters with the rest of the ui
function makeUrl(type, value) {
    switch (type) {
        case "twitter":
            return "https://twitter.com/" + (value.startsWith("@") ? value.substr(1) : value)
        case "instagram":
            return "https://www.instagram.com/" + (value.startsWith("@") ? value.substr(1) : value)
        case "phone":
            return "tel:" + value;
        case "email":
            return "mailto:" + value;
        case "github":
            return "https://github.com/" + (value.startsWith("@") ? value.substr(1) : value)
        case "twitch":
            return "https://twitch.tv/" + value
        case "stackoverflow":
            return value.startsWith("https://stackoverflow.com/") ? value : "https://stackoverflow.com/" + value
        case "reddit":
            return "https://reddit.com/" + value
        case "steam":
            return "https://steamcommunity.com/id/" + value
        case "soundcloud":
            return "https://soundcloud.com/" + value
        case "dangerousthings":
            return "https://forum.dangerousthings.com/u/" + value + "/summary"
        case "discord":
        case "googleplay":
        case "linkedin":
        case "snapchat":
        case "spotify":
        case "xing":
        case "youtube":
        case "website":
            if (/^https?:\/\//.test(value)) return value;
            else return "https://" + value;
        default:
            return "";
    }
}

async function loadStyles() {
    let data = ""
    await fetch("/styles/styles.json").then(x => x.text().then(y => data = y))
    if (data == "") {
        return undefined
    }
    return JSON.parse(data)
}

function showStylePopup(styles, selectedstyle) {
    let style = styles.find(x => x.id = selectedstyle);
    let message = `
    ${style.name}
    Made by: ${style.author}
    Sources of graphics:
    ${style.sources.join(", ")}
    `
    alert(message)
}
