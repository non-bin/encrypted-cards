package api

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
)

type deleteResp struct {
	Success bool   `json:"success"`
	Error   string `json:"error"`
}

//HandleDelete takes {id} and {secret} from the url and deletes the business card
func HandleDelete(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	vars := mux.Vars(r)
	id := vars["id"]
	secret := vars["secret"]

	respObj := deleteResp{}
	if !idRegex.MatchString(id) || !secretRegex.MatchString(secret) {
		w.WriteHeader(http.StatusBadRequest)
		respObj = deleteResp{
			Success: false,
			Error:   "id or secret contains forbidden chars",
		}
	} else {
		// verify the password
		cardfile := getCardFilePath(id, secret)
		if _, err := os.Stat(cardfile); err != nil {
			w.WriteHeader(http.StatusNotFound)
			respObj = deleteResp{
				Success: false,
				Error:   "nonexistant id or wrong secret",
			}
		} else {
			// delete business card file
			if err := os.Remove(cardfile); err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				respObj = deleteResp{
					Success: false,
					Error:   "couldn't delete card",
				}
			} else {
				// delete card dir
				if err := os.Remove(getCardDirPath(id)); err != nil {
					w.WriteHeader(http.StatusInternalServerError)
					respObj = deleteResp{
						Success: false,
						Error:   "couldn't delete card dir",
					}
				} else {
					respObj = deleteResp{
						Success: true,
					}
				}
			}
		}
	}
	if resp, err := json.Marshal(respObj); err != nil {
		log.Println("HandleDelete error marshaling json", err)
	} else {
		w.Write(resp)
	}
}
