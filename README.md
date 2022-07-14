# encrypted-cards WIP

Your client-side encrypted business card.

👁 we can not see the data in your card  
🔒 built with security in mind  
📱 perfect for NFC tags  

<https://encrypted.cards/EXAMPLE#PASSWORD>

## Privacy

Privacy is our #1 priority.

We can literally not see the data in your business card.  
Some metadata like which card was read/written and what IP caused an error might be logged.

### How it works

Your data is encrypted in your browser before it gets uploaded.
Then when you share your link, the data is decrypted in the browser of the visitor.
The trick here is, that we put the password behind the # of your url, the url fragment aka hash, and browsers don't send that part to servers.

> Clients are not supposed to send URI fragments to servers when they retrieve a document

<https://en.wikipedia.org/wiki/URI_fragment>

That way, we can never ever decrypt your business card, even if we wanted to.

### Limits

- If we get hacked, attackers could serve malicious javascript which sends them the decrypted data from your browser
- The password for decryption can be removed from the url, but it stays in peoples browser history
- Due to the client side encryption, breaking changes might need to be fixed with an edit from you
- Our server could figure out which types of entries and which style you use by looking at requests to static files

## Motivation

I saw a NFC business card, that opened a link, which only worked when you scanned the chip.
You couldn't just go to /username and see the business card.
I wondered how that worked because those NFC chips are dumb.
Someone showed me that they just append /r to check that, and remove that from the url bar on load.

I knew I could do better by encrypting the data and using location.hash to store the password.

### The Problem

The main use case of this is sharing contact details via NFC.  
There is a format called vCARD, but iPhones can not read that from NFC cards, they only accept URLs.  
data:text/html, URLs also don't work.  
So, if you want to share your contact over NFC to iPhones, you need to upload your contact details somewhere.  
There are obviously privacy concerns with this, the server can see the contact info, which this tool solves with crypto as explained above.

## Editing your business card

You'll be given a link containing a secret token to edit your card. You should bookmark this link or save it in a password manager.  
This token has been generated using a cryptographically secure random number generator.
A feature to request a new token is not implemented yet.

## Contributing

Implementation details are explained in DOCS.md  

```sh
git clone .../encrypted-cards.git
cd encrypted-cards
mkdir businesscards # this is where the data is stored
go build
./encrypted-cards -local
```

## Acknowledgements

Using CryptoJS and davidshimjs/qrcodejs.  

## Lisence

```lisence
encrypted-cards - Your client-side encrypted business card
Copyright (C) 2022  non-bin

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
```
