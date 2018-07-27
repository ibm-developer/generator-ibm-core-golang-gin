'use strict';
const common = require('../lib/common.js');
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const myHelpers = require('../../lib/helpers.js');
const fs = require('fs');
const bluemixOptions = fs.readFileSync(path.join(__dirname, '../../test/resources/bluemix.json'), 'utf8');

describe('Generates a blank project using cmd line options with --bluemix', function () {

  before(function () {
    // Mock the options, set up an output folder and run the generator
    return helpers.run(path.join(__dirname, '../../generators/app'))
      .withOptions({
        bluemix: bluemixOptions,
        spec: JSON.stringify({
          applicationType: 'BLANK'
        })
      })
      .toPromise(); // Get a Promise back when the generator finishes
  });

  describe('basic file structure for any project type test', () => {
    const expected = Object.keys(common.commonFile).map(key => common.commonFile[key]);

    it('generates the expected common application files', () => {
      assert.file(expected);
    });
  });

  describe(common.commonFile.server_go, () => {
    it('contains default blank message', () => {
      assert.fileContent(common.commonFile.server_go, 'c.String(http.StatusOK, "You are now running a blank Go application")')
    });
  });

  describe(common.commonFile.README_md, () => {
    it('contains default project name', () => {
      assert.fileContent(
        common.commonFile.README_md,
        myHelpers.sanitizeAppName(JSON.parse(bluemixOptions).name)
      );
    });

    it('contains IBM Cloud badge', () => {
      assert.fileContent(
        common.commonFile.README_md,
        '[![](https://img.shields.io/badge/IBM%20Cloud-powered-blue.svg)](https://bluemix.net)'
      );
    });
  });

  describe(common.commonFile.gitignore, () => {
    it('contains .DS_Store', () => {
      assert.fileContent(common.commonFile.gitignore, '.DS_Store');
    });
  });
});


describe('Generates a web app using cmd line options with --bluemix', function () {

  before(function () {
    // Mock the options, set up an output folder and run the generator
    return helpers.run(path.join(__dirname, '../../generators/app'))
      .withOptions({
        bluemix: bluemixOptions,
        spec: JSON.stringify({
          applicationType: 'WEBAPP'
        })
      })
      .toPromise(); // Get a Promise back when the generator finishes
  });

  describe('basic file structure for any project type test', () => {
    const expected = Object.keys(common.commonFile).map(key => common.commonFile[key]);

    it('generates the expected application files', () => {
      assert.file(expected);
    });
  });

  describe('basic file structure for webapp test', () => {
    const expected = Object.keys(common.webAppFile).map(key => common.webAppFile[key]);

    it('generates the expected application files', () => {
      assert.file(expected);
    });
  });

  describe(common.commonFile.README_md, () => {
    it('contains default project name', () => {
      assert.fileContent(
        common.commonFile.README_md,
        myHelpers.sanitizeAppName(JSON.parse(bluemixOptions).name)
      );
    });

    it('contains IBM Cloud badge', () => {
      assert.fileContent(
        common.commonFile.README_md,
        '[![](https://img.shields.io/badge/IBM%20Cloud-powered-blue.svg)](https://bluemix.net)'
      );
    });
  });

  describe(common.commonFile.gitignore, () => {
    it('contains .DS_Store', () => {
      assert.fileContent(common.commonFile.gitignore, '.DS_Store');
    });
  });
});

describe('Generates a MS project using cmd line options with --bluemix', function () {

  before(function () {
    // Mock the options, set up an output folder and run the generator
    return helpers.run(path.join(__dirname, '../../generators/app'))
      .withOptions({
        bluemix: bluemixOptions,
        spec: JSON.stringify({
          applicationType: 'MS'
        })
      })
      .toPromise(); // Get a Promise back when the generator finishes
  });

  describe('basic file structure for any project type test', () => {
    const expected = Object.keys(common.commonFile).map(key => common.commonFile[key]);

    it('generates the expected application files', () => {
      assert.file(expected);
    });
  });

  describe('basic file structure for microservice', () => {
    const expected = Object.keys(common.microserviceFile).map(
      key => common.microserviceFile[key]
    );

    it('generates the expected application files', () => {
      assert.file(expected);
    });
  });
});
