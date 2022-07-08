package main

import (
	"fmt"
)

type Request struct {
	ID       string `json:"id"`
	CardData string `json:"cardData"`
}

type Response struct {
	StatusCode int               `json:"statusCode,omitempty"`
	Headers    map[string]string `json:"headers,omitempty"`
	Body       string            `json:"body,omitempty"`
}

func Main(req Request) (*Response, error) {
	return &Response{
		Body: fmt.Sprintf("ID: %s<br>Data: %s", req.ID, req.CardData),
	}, nil
}
