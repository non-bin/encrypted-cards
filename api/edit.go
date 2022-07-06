package api

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
)

type editResp struct {
	Success bool   `json:"success"`
	Error   string `json:"error"`
}

//HandleEdit takes {id} and {secret} from the url and saves the response body as new card data
func HandleEdit(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	vars := mux.Vars(r)
	id := vars["id"]
	secret := vars["secret"]

	respObj := editResp{}
	if !idRegex.MatchString(id) || !secretRegex.MatchString(secret) {
		w.WriteHeader(http.StatusBadRequest)
		respObj = editResp{
			Success: false,
			Error:   "id or secret contains forbidden chars",
		}
	} else {
		cardfile := getCardFilePath(id, secret)
		if _, err := os.Stat(cardfile); err != nil {
			w.WriteHeader(http.StatusNotFound)
			respObj = editResp{
				Success: false,
				Error:   "nonexistant id or wrong secret",
			}
		} else {
			if err := writeCard(r.Body, cardfile); err != nil {
				w.WriteHeader(http.StatusInternalServerError)
				respObj = editResp{
					Success: false,
					Error:   err.Error(),
				}
			} else {
				respObj = editResp{
					Success: true,
				}
			}
		}
	}
	if resp, err := json.Marshal(respObj); err != nil {
		log.Println("HandleRead error marshaling json", err)
	} else {
		w.Write(resp)
	}
}
