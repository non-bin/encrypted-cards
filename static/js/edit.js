/*
Encrypted Cards - Your client-side encrypted business card
Copyright (C) 2022  non-bin

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import * as EnCa from 'common';

var model = undefined;
var password = location.hash.substr(1);
let path = location.pathname.substr('/app/edit/'.length);
var id = path.split('/')[0];
var secret = path.substr(id.length + 1);
var imageDataUrl = '';
var styles = [];

var entryDefinitions = {
	website: { name: 'Custom Website', placeholder: 'https://example.com', type: 'url' },
	email: { name: 'Email', placeholder: 'you@protonmail.com', type: 'email' },
	phone: { name: 'Phone Number', placeholder: '911', type: 'text' },
	twitter: { name: 'Twitter', placeholder: '@Twitter', type: 'text' },
	discord: { name: 'Discord', placeholder: 'https://discord.gg/bla', type: 'text' },
	github: { name: 'GitHub', placeholder: '@GitHub', type: 'text' },
	googleplay: { name: 'Google Play', placeholder: '', type: 'text' },
	linkedin: { name: 'LinkedIn', placeholder: '', type: 'text' },
	reddit: { name: 'Reddit', placeholder: 'r/AskReddit', type: 'text', pattern: '(r|user)/.+' },
	snapchat: { name: 'Snapchat', placeholder: '', type: 'text' },
	spotify: { name: 'Spotify', placeholder: '', type: 'text' },
	soundcloud: { name: 'Soundcloud', placeholder: '', type: 'text' },
	stackoverflow: { name: 'StackOverflow', placeholder: '', type: 'text' },
	twitch: { name: 'Twitch', placeholder: '', type: 'text' },
	steam: { name: 'Steam', placeholder: '', type: 'text' },
	xing: { name: 'Xing', placeholder: '', type: 'text' },
	youtube: { name: 'YouTube', placeholder: '', type: 'text' },
	dangerousthings: { name: 'Dangerous Things', placeholder: 'amal', type: 'text' }
};

document.addEventListener('DOMContentLoaded', () => loadUI());

async function loadUI() {
	styles = await EnCa.loadStyles();
	styles.forEach(style => addStyle(style));

	document.entryvalue.value = '';
	document.entrydisplayname.value = '';
	document.urlpreview.innerText = '';
	document.imgfile.value = '';

	//set up UI behaviour
	document.imgfile.addEventListener('change', handleImageSelect, false);
	document.entrytype.addEventListener('change', handleEntryTypeSelect, false);
	document.entryvalue.addEventListener('keyup', handleValueChange, false);
	document.selectedentry.addEventListener('change', handleEntrySelect, false);

	document.copybutton.onclick = () => { copyUrl(); };
	document.imgdelete.onclick = () => { imageDataUrl = ''; document.profilepic.src = ''; document.imgfile.value = ''; };
	document.savecardbutton.onclick = () => { saveCard(); };
	document.saveentrybutton.onclick = () => { saveEntry(); };
	document.deleteentrybutton.onclick = () => { deleteEntry(); };
	document.styleinfolink.onclick = () => { EnCa.showStylePopup(styles, document.stylepack.value); };

	//set up view selection
	switch (document.viewselectionform.viewselector.value) {
	case 'card':
		document.cardeditor.hidden = false;
		break;
	case 'entry':
		document.entryeditor.hidden = false;
		break;
	case 'preview':
		document.preview.hidden = false;
		break;

	}
	//FIXME
	document.cardeditorradio.onclick = () => { document.cardeditor.hidden = false; document.entryeditor.hidden = true; document.preview.hidden = true; };
	document.entryeditorradio.onclick = () => { document.cardeditor.hidden = true; document.entryeditor.hidden = false; document.preview.hidden = true; };
	document.previewradio.onclick = () => { document.cardeditor.hidden = true; document.entryeditor.hidden = true; document.preview.hidden = false; };
	loadEntryOptions();

	await loadCard();

	//fill position select
	for (let i = 0; i < model.entries.length; i++) {
		let opt = document.createElement('option');
		opt.value = i;
		opt.innerText = i + 1;
		document.entrypos.options.add(opt);
	}
	let opt = document.createElement('option');
	opt.value = model.entries.length;
	opt.innerText = 'append below';
	document.entrypos.options.add(opt);
	document.entrypos.value = model.entries.length;
}

function handleImageSelect(event) {
	let reader = new FileReader();
	reader.onload = function (e) {
		imageDataUrl = e.target.result;
		document.profilepic.src = imageDataUrl;
	};
	reader.readAsDataURL(event.target.files[0]);
}

function handleEntryTypeSelect() {
	document.entryvalue.value = '';
	document.entrydisplayname.value = '';
	document.urlpreview.innerText = '';
	let entryDef = entryDefinitions[document.entrytype.value];
	document.entrydisplayname.placeholder = EnCa.generateName(document.entrytype.value, entryDef.placeholder);
	document.entryvalue.placeholder = entryDef.placeholder;
	document.entryvalue.type = entryDef.type;
	if (entryDef.pattern != undefined) document.entryvalue.pattern = entryDef.pattern;
	else document.entryvalue.pattern = '.+';
}

function handleEntrySelect() {
	//entrytype.disabled = selectedentry.value != "newentry"
	document.deleteentrybutton.disabled = document.selectedentry.value == 'newentry';

	if (document.selectedentry.value != 'newentry') {
		let entry = model.entries[document.selectedentry.value];
		document.entrytype.value = entry.type;
		document.entryvalue.value = entry.value;
		document.entrydisplayname.value = EnCa.generateName(document.entrytype.value, entry.value);
		document.urlpreview.innerText = EnCa.makeUrl(document.entrytype.value, document.entryvalue.value);
		document.entrypos.value = document.selectedentry.value;
	} else {
		document.entryvalue.value = '';
		document.entrydisplayname.value = '';
		document.urlpreview.innerText = '';
		document.entrydisplayname.placeholder = '';
		document.entryvalue.placeholder = '';
		document.entrypos.value = model.entries.length;
	}
}

function handleValueChange() {
	document.entrydisplayname.value = EnCa.generateName(document.entrytype.value, document.entryvalue.value);
	document.urlpreview.innerText = EnCa.makeUrl(document.entrytype.value, document.entryvalue.value);
}

function addStyle(style) {
	let option = document.createElement('option');
	option.value = style.id;
	option.innerText = style.name;
	document.stylepack.appendChild(option);
}

// FIXME unused
function setEntryIfThere(input) {
	if (input.value != '') {
		let newEntry = {};
		newEntry[input.id] = input.value;
		model.entries.push(newEntry);
	}
}

// FIXME unused
function loadEntryValue(entry) {
	let entryName = Object.getOwnPropertyNames(entry)[0];
	let entryValue = entry[entryName];
	// Should probably make a whitelist of allowed
	switch (entryName) {
	case 'img':
		imageDataUrl = entryValue;
		break;
	default:
		document.getElementById(entryName).value = entryValue;
	}
}

async function loadCard() {
	//url looks like /app/edit/id/secret#password
	try {
		model = await EnCa.getModel(id, password);
	} catch (e) {
		if (e == 'not found') {
			location = '/app/error#notfound';
			return;
		} else if (e == 'wrong password') {
			location = '/app/error#wrongpassword';
			return;
		}
	}
	console.log(model);

	//Check version, migrate if needed
	model = EnCa.migrate(model);

	//fill editor
	document.fullname.value = model.fullname;
	document.bio.value = model.bio;
	document.cleanurl.checked = model.cleanurl;
	document.stylepack.value = model.style;
	if (model.img != undefined) document.profilepic.src = model.img;

	//fill entry editor
	for (let i = 0; i < model.entries.length; i++) {
		let opt = document.createElement('option');
		let entry = model.entries[i];
		opt.value = i;
		opt.innerText = `${i + 1}) ${entry.value} (${entryDefinitions[entry.type].name})`;
		document.selectedentry.options.add(opt);
	}

	//set url for viewing the card
	document.cardlink.value = window.origin + '/' + id + '#' + password;
	document.cardpreview.src = document.cardlink.value;
}

function loadEntryOptions() {
	Object.getOwnPropertyNames(entryDefinitions).forEach(x => {
		let o = entryDefinitions[x];
		let newo = document.createElement('option');
		newo.value = x;
		newo.innerText = o.name;
		document.entrytype.options.add(newo);
	});
}

// FIXME unused
function reloadPreview() {
	let cardpreview = document.getElementById('cardpreview');
	cardpreview.parentNode.removeChild(cardpreview);
	document.body.appendChild(cardpreview);
}

async function saveCard() {
	model.fullname = document.fullname.value;
	model.bio = document.bio.value;
	model.img = imageDataUrl;
	model.style = document.stylepack.value;
	saveModel();
}

async function saveEntry() {
	if (document.entryvalue.value == '') {
		alert('You need to enter a value for the entry');
		return;
	}
	if (!document.entryvalue.reportValidity()) {
		alert('The value doesn\'t match the expected pattern');
		return;
	}
	let newEntry = { 'type': document.entrytype.value, 'value': document.entryvalue.value, 'displayname': document.entrydisplayname.value };
	if (document.selectedentry.value == 'newentry') {
		model.entries.splice(document.entrypos.value, 0, newEntry);
	} else {
		model.entries[document.selectedentry.value] = newEntry;
		if (document.selectedentry.value != document.entrypos.value)
			model.entries = move(model.entries, document.selectedentry.value, document.entrypos.value);
	}
	saveModel();
}

function move(array, from, to) {
	let newarray = [];
	let obj = array[from];
	for (let i = 0; i < array.length; i++) {
		if (i == from) {
			console.log(1);
		} else if (i == to) {
			newarray.push(obj);
			newarray.push(array[i]);
		} else {
			newarray.push(array[i]);
		}
	}
	if (to == array.length)
		newarray.push(obj);
	return newarray;
}

async function deleteEntry() {
	if (!confirm('delete entry?'))
		return;
	if (document.selectedentry.value != 'newentry') {
		let entries = [];
		for (let i = 0; i < model.entries.length; i++) {
			if (i != document.selectedentry.value)
				entries.push(model.entries[i]);
		}
		model.entries = entries;
		saveModel();
	} else {
		alert('You need to select an entry to delete it');
	}
}

async function saveModel() {
	let response = await fetch('/api/card/edit?id=' + id + '%secret=' + secret, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: EnCa.encrypt(JSON.stringify(model), password)
	});
	let result = await response.json();
	if (response.ok) {
		if (result.success) {
			//HACK TO UPDATE THE EDITOR
			location.reload();
			//reloadEditor()
			//reloadPreview()
		}
	} else {
		alert('Error: ' + result.error);
	}
}

function copyUrl() {
	document.cardlink.focus();
	document.cardlink.select();
	document.execCommand('copy');
}
