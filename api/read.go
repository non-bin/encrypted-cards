package api

import (
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gorilla/mux"
)

//HandleRead takes and {id} from the url and responds with the corresponding business card data
func HandleRead(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	//maybe this should also be a json endpoint?
	vars := mux.Vars(r)
	id := vars["id"]
	if !idRegex.MatchString(id) {
		w.WriteHeader(http.StatusBadRequest)
		log.Println("ID doesn't match regex")
		return
	}
	carddir := getCardDirPath(id)
	files, err := ioutil.ReadDir(carddir)
	if err != nil {
		if os.IsNotExist(err) {
			w.WriteHeader(http.StatusNotFound)
		} else {
			log.Println("unexpected error when reading the card", err)
			w.WriteHeader(http.StatusInternalServerError)
		}
		return
	}
	if len(files) != 1 {
		log.Println("unexpected number of files in card dir", len(files))
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	//doesn't require the secret filename, just read the only file.
	filename := filepath.Join(carddir, files[0].Name())
	if data, err := ioutil.ReadFile(filename); err != nil {
		log.Println("reading card data failed", err)
		w.WriteHeader(http.StatusInternalServerError)
	} else {
		w.Write(data)
	}
}
