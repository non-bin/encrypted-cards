/*
Encrypted Cards - Your client-side encrypted business card
Copyright (C) 2022  non-bin

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import * as EnCa from 'common';
var password = decodeURI(location.hash.substr(1))

var model;
var password = decodeURI(location.hash.slice(1));

const loadui = async function() {
	if (password == '') {
		location = '/app/error#nopassword';
		return;
	}
	var id = location.pathname.substr(1);
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
	new QRCode(document.getElementById('qrcode'), window.origin + '/' + id + '#' + password);
	//qrcode.parentElement.open = top !== self // auto show QR when in preview
	if (model.version != EnCa.VERSION) {
		if(self == top) {
			alert('Version mismatch!! Auto-Migration not available yet.\nVisit you edit link to fix it manually or wait for migrations. New cards work fine.');
		}
		console.log(`Version mismatch!! app at ${EnCa.EnCa.VERSION}, model at ${model.version}`);
		return;
	}
	if (model.cleanurl) {
		EnCa.removeHashFromUrl();
	}

	// load style
	let style = document.createElement('link');
	style.rel = 'stylesheet';
	style.type = 'text/css';
	style.href = '/styles/' + model.style + '/style.css';
	style.media = 'all';
	document.head.appendChild(style);

	//Required Fields
	document.fullname.innerText = model.fullname;
	document.bio.innerText = model.bio;
	if (model.img != undefined) document.profilepic.src = model.img;


	for (var i = 0; i < model.entries.length; i++) {
		let entry = model.entries[i];
		let entryName = entry.type;
		let entryValue = entry.value;
		let element = document.createElement('div');
		element.classList.add('entry');
		let link = document.createElement('a');
		link.href = EnCa.makeUrl(entryName, entryValue);
		link.classList.add('link');
		let icon = document.createElement('img');
		icon.classList.add('icon');
		icon.src = '/styles/' + model.style + '/' + entryName + '.svg';
		link.appendChild(icon);
		link.appendChild(document.createTextNode(entry.displayname));
		element.appendChild(link);
		// Append new entry
		document.card.appendChild(element);

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
				vicon.src = "/styles/" + model.style + "/phone.svg"
				vcardlink.appendChild(vicon)
				vcardlink.appendChild(document.createTextNode("save contact"))
				vcardlink.href = window.URL.createObjectURL(blob)
				vcardlink.download = entryValue.name + ".vcard"
				element.appendChild(vcardlink)
		*/
	}

	//hide footer in preview
	if (top !== self) {
		document.footer.parentElement.removeChild(document.footer);
	}

	let styles = await EnCa.loadStyles();
	let selectedstyle = styles.find(x => x.id == model.style);
	document.stylelink.onclick = () => EnCa.showStylePopup(styles, selectedstyle);
};

document.addEventListener('DOMContentLoaded', () => {
	loadui();
});
