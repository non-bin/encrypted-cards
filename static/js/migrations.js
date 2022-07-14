/*
Encrypted Cards - Your client-side encrypted business card
Copyright (C) 2022  non-bin

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

function migrate(model) {
    //Version check
    if (model.version != VERSION) {
        alert("Version mismatch. Trying to migrate")
        if (model.version == "beta" && VERSION == "0.2-beta") {
            return beta_to_0_2_beta(model)
        } else {
            alert("No idea what to do to migrate. Contact the admin or create a new card.")
        }
    }
    return model
}

function beta_to_0_2_beta(model) {
    let newmodel = {
        version: "0.2-beta",
        style: "hand-drawn-dark",
        fullname: "",
        bio: "",
        entries: [],
        cleanurl: false
    }
    newmodel.cleanurl = model.cleanurl
    for (i = 0; i < model.entries.length; i++) {
        let cur = model.entries[i]
        let curname = Object.getOwnPropertyNames(cur)[0]
        let curval = cur[curname]
        switch (curname) {
            case "title":
                newmodel.fullname = cur.title
                break;
            case "bio":
                newmodel.bio = cur.bio
                break;
            case "img":
                newmodel.img = cur.img
                break;
            case "vcard":
                alert("Your vcard will be deleted. A future version will generate a vcard for you.")
                break;
            case "website":
            case "phone":
            case "email":
            case "instagram":
            case "twitter":
            case "dangerousthings":
            case "discord":
            case "googleplay":
            case "linkedin":
            case "snapchat":
            case "twitch":
            case "spotify":
            case "xing":
            case "youtube":
            case "reddit":
                newmodel.entries.push({ "type": curname, "value": curval, "displayname": generateName(curname, curval) })
                break;
        }
    }
    alert("Migration done. Verify and click save to make this permanent.")
    return newmodel
}
