package fileserving

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestServeFile(t *testing.T) {
	req, err := http.NewRequest("GET", "/whatever", nil)
	if err != nil {
		t.Fatal(err)
	}
	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(NewFileHandler("../README.md"))
	handler.ServeHTTP(rr, req)
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("NewFileHandler returned wrong status code: got %v want %v",
			status, http.StatusOK)
	}

	if !strings.HasPrefix(rr.Body.String(), "# encrypted-cards") {
		t.Errorf("NewFileHandler returned unexpected body: got %v",
			rr.Body.String())
	}
}

func TestFileServer(t *testing.T) {
	req, err := http.NewRequest("GET", "/", nil)
	if err != nil {
		t.Fatal(err)
	}
	rr := httptest.NewRecorder()
	NewFileServer("..").ServeHTTP(rr, req)
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("NewFileHandler returned wrong status code: got %v want %v",
			status, http.StatusOK)
	}

	if !strings.HasPrefix(rr.Body.String(), "<pre>") { //<pre> indicates typical file listing
		t.Errorf("NewFileHandler returned unexpected body: expexted file listing got %v",
			rr.Body.String())
	}
}
