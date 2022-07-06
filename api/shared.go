//Package api provides all the functionality for creating, retrieving and editing encrypted business cards
package api

import (
	"crypto/rand"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"path"
	"regexp"
)

const basepath = "./businesscards/"
const maxCardSize = 3 * 1000 * 1000 // 2 Mb + 1 because size increases due to crypto and base64
const charsForSecrets = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-"

var idRegex = regexp.MustCompile(`^[a-zA-Z0-9-]+$`)
var secretRegex = regexp.MustCompile(`^[a-zA-Z0-9-]+$`)
var base64Regex = regexp.MustCompile(`^[a-zA-Z0-9+/]+=?=?$`)

//can't contain / currently because of the weird edit urls
func generateSecret() (string, error) {
	bytes := make([]byte, 18)

	if _, err := rand.Read(bytes); err != nil {
		return "", fmt.Errorf("generateSecret: %w", err)
	}
	for i, b := range bytes {
		bytes[i] = charsForSecrets[b%byte(len(charsForSecrets))]
	}
	return string(bytes), nil
}

func writeCard(responseBody io.ReadCloser, filename string) error {
	defer responseBody.Close()
	body, err := ioutil.ReadAll(responseBody)
	if err != nil {
		log.Println("couldn't read body")
		return errors.New("couldn't read body")
	}
	if len(body) > maxCardSize {
		log.Println("card data too big")
		return errors.New("card data too big")
	}
	if !base64Regex.MatchString(string(body)) {
		return errors.New("card data not encrypted")
	}
	if err := ioutil.WriteFile(filename, body, 0777); err != nil {
		log.Println("couldn't write card", err)
		return errors.New("couldn't write card")
	}
	return nil
}

func getCardDirPath(id string) string {
	return path.Join(basepath, id)
}

func getCardFilePath(id, secret string) string {
	return path.Join(basepath, id, secret)
}
