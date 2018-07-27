# <%= appName %>

A generated IBM Cloud application

[![](https://img.shields.io/badge/IBM%20Cloud-powered-blue.svg)](https://bluemix.net)

## Pre-requisites

If you don't have it already, download [dep](https://github.com/golang/dep)
```bash
go get -u github.com/golang/dep/cmd/dep
```

## Run application locally

```bash
dep ensure
go run server.go
```

## Test application

```bash
go test ./...
```