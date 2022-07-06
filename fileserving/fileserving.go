//Package fileserving provides a methods to serve single files or directories of static content
package fileserving

import (
	"net/http"
)

//NewFileServer creates a basic fileserver
func NewFileServer(dir string) http.Handler {
	return http.FileServer(http.Dir(dir))
}

//NewFileHandler serves a single file, useful for special paths e.g. /app/new
func NewFileHandler(filename string) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, filename)
	}
}
