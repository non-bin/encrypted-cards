//Package headers provides site wide security settings like CSP
package headers

import "net/http"

//WriteDefaultHeadersMiddleware adds CSP and other security related headers to a response
func WriteDefaultHeadersMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// w.Header().Set("Content-Security-Policy", "default-src 'none'; script-src 'self' https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/rollups/aes.js; img-src data: 'self'; connect-src 'self'; style-src 'self'; frame-src 'self'; frame-ancestors 'self'; base-uri 'self';")
		// w.Header().Set("Referrer-Policy", "no-referrer")
		// w.Header().Set("Cross-Origin-Opener-Policy", "same-origin")
		// w.Header().Set("Cross-Origin-Resource-Policy", "same-origin")
		// w.Header().Set("Cross-Origin-Embedder-Policy", "require-corp")
		// w.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		// w.Header().Set("X-Content-Type-Options", "nosniff")
		next.ServeHTTP(w, r)
	})
}
