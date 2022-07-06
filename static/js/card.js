var model
var password = decodeURI(location.hash.substr(1))

async function loadui() {
    if (password == "") {
        location = "/app/error#nopassword"
        return
    }
    var id = location.pathname.substr(1)
    try {
        model = await getModel(id, password)
    } catch (e) {
        if (e == "not found") {
            location = "/app/error#notfound"
            return
        } else if (e == "wrong password") {
            location = "/app/error#wrongpassword"
            return
        }
    }
    new QRCode(document.getElementById("qrcode"), window.origin + "/" + id + "#" + password)
    //qrcode.parentElement.open = top !== self // auto show QR when in preview
    if (model.version != VERSION) {
        if(self == top) {
            alert("Version mismatch!! Auto-Migration not available yet.\nVisit you edit link to fix it manually or wait for migrations. New cards work fine.")
        }
        console.log(`Version mismatch!! app at ${VERSION}, model at ${model.version}`)
        return
    }
    if (model.cleanurl) {
        removeHashFromUrl();
    }

    // load style
    let style = document.createElement("link")
    style.rel = "stylesheet"
    style.type = "text/css"
    style.href = "/static/styles/" + model.style + "/style.css"
    style.media = 'all';
    document.head.appendChild(style);
    
    //Required Fields
    fullname.innerText = model.fullname
    bio.innerText = model.bio
    if (model.img != undefined) profilepic.src = model.img


    for (var i = 0; i < model.entries.length; i++) {
        let entry = model.entries[i]
        let entryName = entry.type
        let entryValue = entry.value
        let element = document.createElement("div")
        element.classList.add("entry")
        let link = document.createElement("a")
        link.href = makeUrl(entryName, entryValue)
        link.classList.add("link")
        let icon = document.createElement("img")
        icon.classList.add("icon")
        icon.src = "/static/styles/" + model.style + "/" + entryName + ".svg"
        link.appendChild(icon)
        link.appendChild(document.createTextNode(entry.displayname))
        element.appendChild(link)
        // Append new entry
        card.appendChild(element);

        /*
                var blob = new Blob([entryValue.vcard], {
                    type: "text/vcard"
                })
                element = document.createElement("div")
                element.classList.add("entry")
                let vcardlink = document.createElement("a")
                vcardlink.classList.add("link")
                let vicon = document.createElement("img")
                vicon.classList.add("icon")
                vicon.src = "/static/styles/" + model.style + "/phone.svg"
                vcardlink.appendChild(vicon)
                vcardlink.appendChild(document.createTextNode("save contact"))
                vcardlink.href = window.URL.createObjectURL(blob)
                vcardlink.download = entryValue.name + ".vcard"
                element.appendChild(vcardlink)
        */
    }

    //hide footer in preview
    if (top !== self) {
        footer.parentElement.removeChild(footer)
    }

    let styles = await loadStyles();
    let selectedstyle = styles.find(x => x.id == model.style)
    stylelink.onclick = () => showStylePopup(styles, selectedstyle)
}

document.addEventListener("DOMContentLoaded", () => {
    loadui()
})