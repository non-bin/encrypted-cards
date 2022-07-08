package main

import (
	"fmt"
)

type Request struct {
	ID   string `json:"id"`
	Body string `json:"body"`
}

type Response struct {
	StatusCode int               `json:"statusCode,omitempty"`
	Headers    map[string]string `json:"headers,omitempty"`
	Body       string            `json:"body,omitempty"`
}

func Main(req Request) (*Response, error) {
	if req.Name == "" {
		req.Name = "stranger"
	}

	return &Response{
		Body: fmt.Sprintf("ID: %s<br>Body: %s", req.ID, req.Body),
	}, nil
}
