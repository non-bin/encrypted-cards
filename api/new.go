package api

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
)

type newResp struct {
	Success bool   `json:"success"`
	Secret  string `json:"secret"`
	Error   string `json:"error"`
}

//HandleNew takes an {id} from the url and saves the reponse body as new business card, returns the secret for editing the card
func HandleNew(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	vars := mux.Vars(r)
	id := vars["id"]
	respObj := newResp{}

	if !idRegex.MatchString(id) {
		respObj = newResp{
			Success: false,
			Error:   "wrong id format",
		}
	} else {
		//Is the name available?
		//TODO make an extra endpoint to check this
		carddir := getCardDirPath(id)
		if _, err := os.Stat(carddir); !os.IsNotExist(err) {
			//there has to be a better way to do this...
			w.WriteHeader(http.StatusForbidden)
			respObj = newResp{
				Success: false,
				Error:   "ID exists already",
			}
		} else {
			if secret, err := generateSecret(); err != nil {
				log.Println("error generating secret", err)
				w.WriteHeader(http.StatusInternalServerError)
				respObj = newResp{
					Success: false,
					Error:   "couldn't generate a secret",
				}
			} else {
				os.Mkdir(carddir, 0777)
				cardfile := getCardFilePath(id, secret)
				if err := writeCard(r.Body, cardfile); err != nil {
					log.Println("HandleNew error writing card", err)
					w.WriteHeader(http.StatusInternalServerError)
					respObj = newResp{
						Success: false,
						Error:   "the server had problems saving the data",
					}
				} else {
					respObj = newResp{
						Success: true,
						Secret:  secret,
					}
				}
			}
		}
		if resp, err := json.Marshal(respObj); err != nil {
			log.Println("HandleNew error marshaling json", err)
		} else {
			w.Write(resp)
		}
	}
}
