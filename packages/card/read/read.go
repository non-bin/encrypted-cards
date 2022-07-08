package main

type Response struct {
	StatusCode int               `json:"statusCode,omitempty"`
	Headers    map[string]string `json:"headers,omitempty"`
	Body       string            `json:"body,omitempty"`
}

func Main(in string) (*Response, error) {
	return &Response{
		Body: in,
	}, nil
}
