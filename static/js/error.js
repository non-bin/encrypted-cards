/*
Encrypted Cards - Your client-side encrypted business card
Copyright (C) 2022  non-bin

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

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
