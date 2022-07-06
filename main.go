// encrypted-cards: website for client-side encrypted business cards
//
// see go doc encrypted-cards/api for details
package main

import (
	"encrypted-cards/api"
	"encrypted-cards/fileserving"
	"encrypted-cards/headers"
	"flag"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

func main() {
	certfile := flag.String("cert", "certs/fullchain.pem", "The path to the TLS cert")
	keyfile := flag.String("key", "certs/privkey.pem", "The path to the key of the TLS cert")
	httpPort := flag.Uint("80", 80, "The port for http requests")
	httpsPort := flag.Uint("443", 443, "The port for https requests")
	local := flag.Bool("local", false, "run via http on 8081")
	flag.Parse()

	router := mux.NewRouter().StrictSlash(true)

	//Add CSP and other security headers to every response
	router.Use(headers.WriteDefaultHeadersMiddleware)

	//404
	router.NotFoundHandler = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, "/app/error#404", http.StatusSeeOther)
	})

	//API
	apirouter := router.PathPrefix("/api/").Subrouter()
	apirouter.HandleFunc("/new/{id}", api.HandleNew).Methods("POST")
	apirouter.HandleFunc("/read/{id}", api.HandleRead).Methods("GET")
	apirouter.HandleFunc("/edit/{id}/{secret}", api.HandleEdit).Methods("PUT")
	apirouter.HandleFunc("/delete/{id}/{secret}", api.HandleDelete).Methods("DELETE")

	//Frontend
	approuter := router.PathPrefix("/app/").Subrouter()
	approuter.Path("/new").HandlerFunc(fileserving.NewFileHandler("./html/new.html"))
	approuter.Path("/edit/{id}/{secret}").HandlerFunc(fileserving.NewFileHandler("./html/edit.html"))
	approuter.Path("/error").HandlerFunc(fileserving.NewFileHandler("./html/error.html"))

	//static files
	router.PathPrefix("/static/").Handler(http.StripPrefix("/static/", fileserving.NewFileServer("./static/")))

	//business cards
	router.Path("/{id}").HandlerFunc(fileserving.NewFileHandler("./html/card.html"))

	//home
	router.Path("/").HandlerFunc(fileserving.NewFileHandler("./html/home.html"))

	if !*local {
		//redirect to https
		go func() {
			http.ListenAndServe(fmt.Sprintf(":%d", *httpPort), http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				http.Redirect(w, r, "https://"+r.Host+r.URL.RequestURI(), http.StatusMovedPermanently)
			}))
		}()

		log.Fatal(http.ListenAndServeTLS(fmt.Sprintf(":%d", *httpsPort), *certfile, *keyfile, router))
	} else {
		log.Fatal(http.ListenAndServe(":8081", router))
	}
}
