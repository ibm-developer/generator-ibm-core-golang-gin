/*
* © Copyright IBM Corp. 2018
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

'use strict';
const common = require('../lib/common.js');
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const myHelpers = require('../../lib/helpers.js');
const fs = require('fs');


let PROJECT_NAME = '';
let appPath = ''
do{
  PROJECT_NAME = 'ProjectName' + Math.random().toString(36).substring(12)
  appPath = path.join(
    process.env.GOPATH || '',
    'src/',
    myHelpers.sanitizeAppName(PROJECT_NAME)
  );
}while(fs.existsSync(appPath))

function clean() {
  if (!process.env.GOPATH) return;
  let exec = require('child_process').exec;
  exec('rm -r ' + appPath);
}

describe('Generates a web app through prompts', function() {
  this.timeout(5000);
  
  beforeEach(() => {
    // Mock the options, set up an output folder and run the generator
    return (
      helpers
        .run(path.join(__dirname, '../../generators/app'))
        .withPrompts({
          appName: PROJECT_NAME,
          applicationType: 'WEBAPP'
        })
        .toPromise()
    ); // Get a Promise back when the generator finishes
  });

  afterEach(() => {
    clean();
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
        myHelpers.sanitizeAppName(PROJECT_NAME)
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

  describe('Go file structure', () => {
    it('generates the directory in the Gopath', () => {
      if (process.env.GOPATH) {
        assert(fs.existsSync(appPath));
      }
    });
  });
});


describe('Generates microservice app through prompts', () => {
  beforeEach(() => {
    if (process.env.GOPATH) {
      let exec = require('child_process').exec;
      exec('rm -r ' + appPath);
    }
    // Mock the options, set up an output folder and run the generator
    return helpers
      .run(path.join(__dirname, '../../generators/app'))
      .withPrompts({
        appName: PROJECT_NAME,
        applicationType: 'MS'
      })
      .toPromise(); // Get a Promise back when the generator finishes
  });

  afterEach(() => {
    clean();
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

describe('Generates blank app with no swagger file through prompts', () => {
  beforeEach(() => {
    // Mock the options, set up an output folder and run the generator
    return (
      helpers
        .run(path.join(__dirname, '../../generators/app'))
        .withPrompts({
          appName: PROJECT_NAME,
          applicationType: 'BLANK',
          useSwagger: false
        })
        .toPromise() // Get a Promise back when the generator finishes
    );
  });

  afterEach(() => {
    clean();
  });

  describe('basic file structure for any project type test', () => {
    const expected = Object.keys(common.commonFile).map(key => common.commonFile[key]);

    it('generates the expected application files', () => {
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
        myHelpers.sanitizeAppName(PROJECT_NAME)
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

  describe('Go file structure', () => {
    it('generates the directory in the Gopath', () => {
      if (process.env.GOPATH) {
        assert(fs.existsSync(appPath));
      }
    });
  });
});
