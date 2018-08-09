# IBM Core Golang Gin Generator

[![IBM Cloud powered][img-ibmcloud-powered]][url-cloud]
[![Travis][img-travis-master]][url-travis-master]
[![Coveralls][img-coveralls-master]][url-coveralls-master]

[img-ibmcloud-powered]: https://img.shields.io/badge/IBM%20Cloud-powered-blue.svg
[url-cloud]: http://bluemix.net

[img-travis-master]: https://travis-ci.org/ibm-developer/generator-ibm-core-golang-gin
[url-travis-master]: https://travis-ci.org/ibm-developer/generator-ibm-core-golang-gin

[img-coveralls-master]: https://coveralls.io/repos/github/ibm-developer/generator-ibm-core-golang-gin/badge.svg
[url-coveralls-master]: https://coveralls.io/github/ibm-developer/generator-ibm-core-golang-gin

[img-coveralls-master]: https://coveralls.io/repos/github/ibm-developer/generator-ibm-core-golang-gin/badge.svg
[url-coveralls-master]: https://coveralls.io/github/ibm-developer/generator-ibm-core-golang-gin

This generator produces a simple Gin-based Golang server application, with all the ingredients you need for a good start at building a cloud native application. It can be run locally or remotely (e.g. IBM Cloud). 

## Pre-requisites

- Install [Yeoman](http://yeoman.io)

```bash
npm install -g yo
```
- If you don't have it already, download [Go](https://golang.org/dl/)
- Set up a [GOPATH](https://github.com/golang/go/wiki/SettingGOPATH)

## Installation

```bash
npm install -g generator-ibm-core-golang-gin
```

## Usage

```bash
yo core-golang-gin
```
This will create an application in your `$GOPATH/src/<application-name>` directory.

Following command line arguments are supported:

*  `--bluemix='{"name":"<application-name>","backendPlatform":"GO"}'`.
*  `--bluemix='{"name":"<application-name>"' --spec='{"applicationType":"<application-type>"}'`.
*  The three valid application types are: WEBAPP, MS, and BLANK
*  You can alternatively supply a local file containing compatible JSON object by using `--bluemix file:path/to/file.json`
*  If you specifiy the bluemix argument, your application will be generated in your current working directory.

## Artifacts

Here is a list of the files and folders you receive after executing the generator:  

File  | Purpose
---       | ---
README.md | Instructions for building, running, and deploying the application
Gopkg.toml | Toml file containing application dependencies used for [dep](https://golang.github.io/dep/)
public/* | Folder containing files for server landing page
run-dev | Simple shell script to run application in dev mode
server.go | Contains server configuration
routers/* | Folder containing router configuartion files

## Development

Clone this repository and link it via npm

```
git clone https://github.com/ibm-developer/generator-ibm-core-golang-gin.git
cd generator-ibm-core-golang-gin
npm link
```

In a separate directory invoke the generator via

```
yo ibm-core-golang-gin
```

## Testing

To run the unit tests

```
npm test
```

## Publishing Changes

In order to publish changes, you will need to fork the repository or branch off the `master` branch.

Make sure to follow the [conventional commit specification](https://conventionalcommits.org/) before contributing. To help you with commit a commit template is provide. Run `config.sh` to initialize the commit template to your `.git/config` or use [commitizen](https://www.npmjs.com/package/commitizen)

Once you are finished with your changes, run `npm test` to make sure all tests pass.

Do a pull request against `master`, make sure the build passes. A team member will review and merge your pull request.
Once merged to `master` an auto generated pull request will be created against master to update the changelog. Make sure that the CHANGELOG.md and the package.json is correct before merging the pull request. After the auto generated pull request has been merged to `master` the version will be bumped and published to Artifactory.
