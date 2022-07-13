//Package api provides all the functionality for creating, retrieving and editing encrypted business cards
package common

import (
	"crypto/rand"
	"errors"
	"fmt"
	"regexp"
)

type Response struct {
	StatusCode int               `json:"statusCode,omitempty"`
	Headers    map[string]string `json:"headers,omitempty"`
	Body       string            `json:"body,omitempty"`
}

const MaxCardSize = 3 * 1000 * 1000 // 2 Mb + 1 because size increases due to crypto and base64
const CharsForSecrets = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-"

var IDRegex = regexp.MustCompile(`^[a-zA-Z0-9-]+$`)
var SecretRegex = regexp.MustCompile(`^[a-zA-Z0-9-]+$`)
var Base64Regex = regexp.MustCompile(`^[a-zA-Z0-9+/]+=?=?$`)

//can't contain / currently because of the weird edit urls
func GenerateSecret() (string, error) {
	bytes := make([]byte, 18)

	if _, err := rand.Read(bytes); err != nil {
		return "", fmt.Errorf("generateSecret: %w", err)
	}
	for i, b := range bytes {
		bytes[i] = CharsForSecrets[b%byte(len(CharsForSecrets))]
	}
	return string(bytes), nil
}

func WriteCard(id string, secret string, body string) error {
	db := new(dbConnection)

	if len(body) > MaxCardSize {
		return errors.New("card data too big")
	}
	if !Base64Regex.MatchString(body) {
		// todo: add option to not encrypt
		return errors.New("card data not encrypted")
	}

	return db.writeCard(id, secret, body)
}

func Log(msg string) {
	fmt.Println(msg)
}

func CreateCard(id string, secret string, body string) error {
	return WriteCard(id, secret, body)
}
