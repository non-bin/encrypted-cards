package api

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gorilla/mux"
)

func TestIntegration(t *testing.T) {
	rr := httptest.NewRecorder()

	// Need to create a router that we can pass the request through so that the vars will be added to the context
	router := mux.NewRouter()
	router.HandleFunc("/api/new/{id}", HandleNew).Methods("POST")
	router.HandleFunc("/api/read/{id}", HandleRead).Methods("GET")
	router.HandleFunc("/api/edit/{id}/{secret}", HandleEdit).Methods("PUT")
	router.HandleFunc("/api/delete/{id}/{secret}", HandleDelete).Methods("DELETE")

	// create new business card
	req, err := http.NewRequest("POST", "/api/new/ID2", strings.NewReader("AbcDeF123=="))
	if err != nil {
		t.Fatal(err)
	}

	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("expected 200 got %d", rr.Code)
	}

	resp := newResp{}
	json.Unmarshal(rr.Body.Bytes(), &resp)

	if resp.Success != true {
		t.Errorf("creating card failed, error: %s", resp.Error)
	}

	if len(resp.Secret) > 8 {
		t.Errorf("didn't get a (correct) secret: %s", resp.Secret)
	}

}
