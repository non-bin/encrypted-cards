var model = undefined
var password = location.hash.substr(1)
let path = location.pathname.substr("/app/edit/".length)
var id = path.split("/")[0]
var secret = path.substr(id.length + 1)
var imageDataUrl = ""
var styles = []

var entryDefinitions = {
    website: { name: "Custom Website", placeholder: "https://example.com", type: "url", type: "text" },
    email: { name: "Email", placeholder: "you@protonmail.com", type: "email" },
    phone: { name: "Phone Number", placeholder: "911", type: "text" },
    twitter: { name: "Twitter", placeholder: "@Twitter", type: "text" },
    discord: { name: "Discord", placeholder: "https://discord.gg/bla", type: "text" },
    github: { name: "GitHub", placeholder: "@GitHub", type: "text" },
    googleplay: { name: "Google Play", placeholder: "", type: "text" },
    linkedin: { name: "LinkedIn", placeholder: "", type: "text" },
    reddit: { name: "Reddit", placeholder: "r/AskReddit", type: "text", pattern: "(r|user)/.+" },
    snapchat: { name: "Snapchat", placeholder: "", type: "text" },
    spotify: { name: "Spotify", placeholder: "", type: "text" },
    soundcloud: { name: "Soundcloud", placeholder: "", type: "text" },
    stackoverflow: { name: "StackOverflow", placeholder: "", type: "text" },
    twitch: { name: "Twitch", placeholder: "", type: "text" },
    steam: { name: "Steam", placeholder: "", type: "text" },
    xing: { name: "Xing", placeholder: "", type: "text" },
    youtube: { name: "YouTube", placeholder: "", type: "text" },
    dangerousthings: { name: "Dangerous Things", placeholder: "amal", type: "text" }
}

document.addEventListener("DOMContentLoaded", () => loadUI())

async function loadUI() {
    styles = await loadStyles()
    styles.forEach(style => addStyle(style))

    entryvalue.value = ""
    entrydisplayname.value = ""
    urlpreview.innerText = ""
    imgfile.value = ""

    //set up UI behaviour
    imgfile.addEventListener('change', handleImageSelect, false)
    entrytype.addEventListener('change', handleEntryTypeSelect, false)
    entryvalue.addEventListener('keyup', handleValueChange, false)
    selectedentry.addEventListener('change', handleEntrySelect, false)

    copybutton.onclick = () => { copyUrl() }
    imgdelete.onclick = () => { imageDataUrl = ''; profilepic.src = ""; imgfile.value = "" }
    savecardbutton.onclick = () => { saveCard() }
    saveentrybutton.onclick = () => { saveEntry() }
    deleteentrybutton.onclick = () => { deleteEntry() }
    styleinfolink.onclick = () => { showStylePopup(styles, stylepack.value) }

    //set up view selection
    switch (viewselectionform.viewselector.value) {
        case "card":
            cardeditor.hidden = false
            break;
        case "entry":
            entryeditor.hidden = false
            break;
        case "preview":
            preview.hidden = false
            break;

    }
    //FIXME
    cardeditorradio.onclick = () => { cardeditor.hidden = false; entryeditor.hidden = true; preview.hidden = true }
    entryeditorradio.onclick = () => { cardeditor.hidden = true; entryeditor.hidden = false; preview.hidden = true }
    previewradio.onclick = () => { cardeditor.hidden = true; entryeditor.hidden = true; preview.hidden = false }
    loadEntryOptions()

    await loadCard()

    //fill position select
    for (i = 0; i < model.entries.length; i++) {
        let opt = document.createElement("option")
        opt.value = i
        opt.innerText = i + 1
        entrypos.options.add(opt)
    }
    let opt = document.createElement("option")
    opt.value = model.entries.length
    opt.innerText = "append below"
    entrypos.options.add(opt)
    entrypos.value = model.entries.length
}

function handleImageSelect(event) {
    let reader = new FileReader()
    reader.onload = function (e) {
        imageDataUrl = e.target.result
        profilepic.src = imageDataUrl
    }
    reader.readAsDataURL(event.target.files[0])
}

function handleEntryTypeSelect(event) {
    entryvalue.value = ""
    entrydisplayname.value = ""
    urlpreview.innerText = ""
    let entryDef = entryDefinitions[entrytype.value]
    entrydisplayname.placeholder = generateName(entrytype.value, entryDef.placeholder)
    entryvalue.placeholder = entryDef.placeholder
    entryvalue.type = entryDef.type
    if (entryDef.pattern != undefined) entryvalue.pattern = entryDef.pattern
    else entryvalue.pattern = ".+"
}

function handleEntrySelect(event) {
    //entrytype.disabled = selectedentry.value != "newentry"
    deleteentrybutton.disabled = selectedentry.value == "newentry"

    if (selectedentry.value != "newentry") {
        let entry = model.entries[selectedentry.value]
        entrytype.value = entry.type
        entryvalue.value = entry.value
        entrydisplayname.value = generateName(entrytype.value, entry.value)
        urlpreview.innerText = makeUrl(entrytype.value, entryvalue.value)
        entrypos.value = selectedentry.value
    } else {
        entryvalue.value = ""
        entrydisplayname.value = ""
        urlpreview.innerText = ""
        entrydisplayname.placeholder = ""
        entryvalue.placeholder = ""
        entrypos.value = model.entries.length
    }
}

function handleValueChange(event) {
    entrydisplayname.value = generateName(entrytype.value, entryvalue.value)
    urlpreview.innerText = makeUrl(entrytype.value, entryvalue.value)
}

function addStyle(style) {
    let option = document.createElement("option")
    option.value = style.id
    option.innerText = style.name
    stylepack.appendChild(option)
}

function setEntryIfThere(input) {
    if (input.value != "") {
        let newEntry = {}
        newEntry[input.id] = input.value
        model.entries.push(newEntry)
    }
}

function loadEntryValue(entry) {
    let entryName = Object.getOwnPropertyNames(entry)[0]
    let entryValue = entry[entryName]
    // Should probably make a whitelist of allowed 
    switch (entryName) {
        case "img":
            imageDataUrl = entryValue
            break;
        default:
            document.getElementById(entryName).value = entryValue
    }
}

async function loadCard() {
    //url looks like /app/edit/id/secret#password
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
    console.log(model)

    //Check version, migrate if needed
    model = migrate(model)

    //fill editor
    fullname.value = model.fullname
    bio.value = model.bio
    cleanurl.checked = model.cleanurl
    stylepack.value = model.style
    if (model.img != undefined) profilepic.src = model.img

    //fill entry editor
    for (i = 0; i < model.entries.length; i++) {
        let opt = document.createElement("option")
        let entry = model.entries[i]
        opt.value = i
        opt.innerText = `${i + 1}) ${entry.value} (${entryDefinitions[entry.type].name})`
        selectedentry.options.add(opt)
    }

    //set url for viewing the card
    cardlink.value = window.origin + "/" + id + "#" + password
    cardpreview.src = cardlink.value
}

function loadEntryOptions() {
    Object.getOwnPropertyNames(entryDefinitions).forEach(x => {
        let o = entryDefinitions[x]
        let newo = document.createElement("option")
        newo.value = x
        newo.innerText = o.name
        entrytype.options.add(newo)
    })
}

function reloadPreview() {
    let cardpreview = document.getElementById("cardpreview")
    cardpreview.parentNode.removeChild(cardpreview)
    document.body.appendChild(cardpreview)
}

async function saveCard() {
    model.fullname = fullname.value
    model.bio = bio.value
    model.img = imageDataUrl
    model.style = stylepack.value
    saveModel()
}

async function saveEntry() {
    if (entryvalue.value == "") {
        alert("You need to enter a value for the entry")
        return
    }
    if (!entryvalue.reportValidity()) {
        alert("The value doesn't match the expected pattern")
        return
    }
    let newEntry = { "type": entrytype.value, "value": entryvalue.value, "displayname": entrydisplayname.value }
    if (selectedentry.value == "newentry") {
        model.entries.splice(entrypos.value, 0, newEntry)
    } else {
        model.entries[selectedentry.value] = newEntry
        if (selectedentry.value != entrypos.value)
            model.entries = move(model.entries, selectedentry.value, entrypos.value)
    }
    saveModel()
}

function move(array, from, to) {
    newarray = []
    obj = array[from]
    for (i = 0; i < array.length; i++) {
        if (i == from) {
            console.log(1)
        } else if (i == to) {
            newarray.push(obj)
            newarray.push(array[i])
        } else {
            newarray.push(array[i])
        }
    }
    if (to == array.length)
        newarray.push(obj)
    return newarray
}

async function deleteEntry() {
    if (!confirm("delete entry?"))
        return
    if (selectedentry.value != "newentry") {
        let entries = []
        for (i = 0; i < model.entries.length; i++) {
            if (i != selectedentry.value)
                entries.push(model.entries[i])
        }
        model.entries = entries
        saveModel()
    } else {
        alert("You need to select an entry to delete it")
    }
}

async function saveModel() {
    let response = await fetch('/api/edit/' + id + '/' + secret, {
        method: 'PUT',
        headers: {
            'Content-Type': 'text/plain; charset=utf-8'
        },
        body: encrypt(JSON.stringify(model), password)
    })
    let result = await response.json()
    if (response.ok) {
        if (result.success) {
            //HACK TO UPDATE THE EDITOR
            location.reload()
            //reloadEditor()
            //reloadPreview()
        }
    } else {
        alert("Error: " + result.error)
    }
}

function copyUrl() {
    cardlink.focus()
    cardlink.select()
    document.execCommand('copy')
}