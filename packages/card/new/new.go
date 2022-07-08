package main

import (
	"fmt"

	"github.com/Code-Hex/dd"
)

type Request struct {
	Name string `json:"name"`
}

type Response struct {
	StatusCode int               `json:"statusCode,omitempty"`
	Headers    map[string]string `json:"headers,omitempty"`
	Body       string            `json:"body,omitempty"`
}

func Main(req Request) (*Response, error) {
	fmt.Println(dd.Dump(req))

	if req.Name == "" {
		req.Name = "stranger"
	}

	return &Response{
		Body: fmt.Sprintf("Hello %s", req.Name),
	}, nil
}
