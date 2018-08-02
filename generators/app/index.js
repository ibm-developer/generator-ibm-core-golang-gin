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
const Generator = require('yeoman-generator');
const path = require('path');
const Bundle = require("../../package.json");
const Log4js = require('log4js');
const logger = Log4js.getLogger('generator-ibm-core-golang-gin');
const fs = require('fs');
const helpers = require('../../lib/helpers.js');
const swaggerize = require('ibm-openapi-support');
const OPTION_BLUEMIX = 'bluemix';
const OPTION_SPEC = 'spec';

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    // Bluemix option for YaaS integration
    this.argument(OPTION_BLUEMIX, {
      desc: 'Option for deploying with Bluemix. Stringified JSON.',
      required: false,
      hide: true,
      type: String
    });

    // Spec as json
    this.argument(OPTION_SPEC, {
      desc: 'The generator specification. Stringified JSON.',
      required: false,
      hide: true,
      type: String
    });
  }

  initializing() {
    this.interactiveMode = false;
    this.options.openApiFileType = 'yaml'; // Default
    let bluemixOk = this._sanitizeOption(this.options, OPTION_BLUEMIX);
    this._sanitizeOption(this.options, OPTION_SPEC);

    if (!bluemixOk || typeof this.options.bluemix.quiet == "undefined" || !this.options.bluemix.quiet) {
      logger.info("Package info ::", Bundle.name, Bundle.version);
    }

    // Set defaults
    this.options.applicationType = this.options.applicationType || 'BLANK';
    this.options.addServices = this.options.addServices || false;
    this.options.bluemix = this.options.bluemix || {}
    this.options.bluemix.backendPlatform = this.options.bluemix.backendPlatform || 'GO'

    // Prompt the user if there is no bluemix object present
    if (!bluemixOk) {
      this.interactiveMode = true;
    }

    if (!this.interactiveMode) {
      // If bluemix contains app name, sanitize it
      if (this.options.bluemix.name && !this.options.bluemix.sanitizedName) {
        this.options.sanitizedName = helpers.sanitizeAppName(this.options.bluemix.name);
      } else {
        this.options.sanitizedName = this.options.bluemix.sanitizedName;
      }
      this.options.name = this.options.bluemix.name;

      if (this.options.spec && this.options.spec.applicationType) {
        this.options.applicationType = this.options.spec.applicationType;
      }

      this.options.parsedSwagger = undefined;

      // If a swagger file is provided
      if (
        this.options.bluemix &&
        this.options.bluemix.openApiServers &&
        this.options.bluemix.openApiServers[0].spec
      ) {
        let openApiDocumentBytes =
          typeof this.options.bluemix.openApiServers[0].spec === 'object'
            ? JSON.stringify(this.options.bluemix.openApiServers[0].spec)
            : this.options.bluemix.openApiServers[0].spec;

        this._parseSwagger(openApiDocumentBytes);
      }
    }
  }

  prompting() {
    // Only prompt if we are in interactive mode
    if (!this.interactiveMode) return;

    //
    let swaggerFileValidator = function (str) {
      if (str == "None") {
        return true;
      }
      else {
        if (fs.existsSync(str.trim())) {
          return true;
        }
        else {
          console.log("\n" + str + " not found.");
          return false;
        }
      }
    }

    const prompts = [
      {
        name: 'appName',
        message: `What is the name of your application?`,
        default: 'myapp'
      },
      {
        type: 'list',
        name: 'applicationType',
        message: `What type of application are you creating?`,
        choices: [
          {
            name: 'Microservice',
            value: 'MS'
          },
          {
            name: 'Webapp',
            value: 'WEBAPP'
          },
          {
            name: 'Blank',
            value: 'BLANK'
          }
        ],
        default: 'Blank'
      },
      {
        type: 'confirm',
        name: 'useSwagger',
        message: 'Do you want to provide a swagger file?',
        when: function(responses) {
          return responses.applicationType === 'BLANK';
        }
      },
      {
        name: 'swaggerPath',
        message: 'Provide the path to the swagger file:',
        validate: swaggerFileValidator,
        when: function(responses) {
          return responses.useSwagger;
        }
      }
    ];

    return this.prompt(prompts).then(props => {
      // To access props, use props.promptName
      this.options.name = props.appName;
      this.options.sanitizedName = helpers.sanitizeAppName(props.appName);
      this.options.applicationType = props.applicationType;
      if (props.useSwagger) {
        let file = fs.readFileSync(props.swaggerPath, 'utf8');
        this._parseSwagger(file);
      }
      this.options.licenseText = '';
    });
  }

  paths() {
    // Place the app in GOPATH/src/<appname>
    if (this.interactiveMode) {
      this.destinationRoot(path.join(process.env.GOPATH, 'src/', this.options.sanitizedName));
    }
  }

  writing() {
    // To capitalize a string
    /* eslint-disable */
    String.prototype.capitalize = function() {
      return this.charAt(0).toUpperCase() + this.slice(1);
    };
    /* eslint-enable */

    this.fs.copy(this.templatePath('.gitignore'), this.destinationPath('.gitignore'));
    if (!this.fs.exists(this.destinationPath('README.md'))) {
      this.fs.copyTpl(
        this.templatePath('README.md'),
        this.destinationPath('README.md'),
        this.options
      );
    }
    this.fs.copy(this.templatePath('Gopkg.lock'), this.destinationPath('Gopkg.lock'));
    this.fs.copy(this.templatePath('Gopkg.toml'), this.destinationPath('Gopkg.toml'));
    this.fs.copy(this.templatePath('run-dev'), this.destinationPath('run-dev'));
    this.fs.copyTpl(
      this.templatePath('test/health_test.go'),
      this.destinationPath('routers/health_test.go'),
      this.options
    );
    this.fs.copy(this.templatePath('plugins'), this.destinationPath('plugins'));

    if (typeof this.options.parsedSwagger !== 'undefined') {
      this.options.resources = this.options.parsedSwagger.resources;
      this.options.basepath = this.options.parsedSwagger.basepath
    }
    this.fs.copyTpl(
      this.templatePath('server.go'),
      this.destinationPath('server.go'),
      this.options
    );
    this.fs.copy(
      this.templatePath('health.go'),
      this.destinationPath('routers/health.go')
    );

    if (this.options.applicationType === 'WEBAPP') {
      this.fs.copy(
        this.templatePath('webbasic/routers/index.go'),
        this.destinationPath('routers/index.go')
      );
    } else if (this.options.applicationType === 'MS') {
      this.fs.copy(
        this.templatePath('public/swagger-ui'),
        this.destinationPath('public/swagger-ui')
      );
      this.fs.copyTpl(
        this.templatePath('public/swagger.yaml'),
        this.destinationPath('public/swagger.yaml'),
        this.options
      );
      this.fs.copyTpl(
        this.templatePath('swagger.go'),
        this.destinationPath('routers/swagger.go'),
        this.options
      );
    } else if (this.options.applicationType === 'BLANK') {
      // If blank project and user provides swagger
      if (this.options.parsedSwagger) {
        Object.keys(this.options.parsedSwagger.resources).forEach(
          function(resource) {
            let context = {
              resource: resource,
              routes: this.options.parsedSwagger.resources[resource],
              basepath: this.options.parsedSwagger.basepath
            };

            if (
              !(
                resource === 'health' &&
                context.routes.length === 1 &&
                context.routes[0].route === '/health'
              )
            ) {
              this.fs.copyTpl(
                this.templatePath('blank/router.go'),
                this.destinationPath(`routers/${resource}.go`),
                context
              );
            }
          }.bind(this)
        );

        this.fs.write(
          'public/swagger.' + this.options.openApiFileType,
          this.options.loadedApi
        );

        this.fs.copy(
          this.templatePath('public/swagger-ui'),
          this.destinationPath('public/swagger-ui')
        );
        this.fs.copyTpl(
          this.templatePath('swagger.go'),
          this.destinationPath('routers/swagger.go'),
          this.options
        );
      }
    }
  }

  end() {
    if (this.interactiveMode) {
      this.log(
        'Your project has been generated at ' +
          path.join(process.env.GOPATH, 'src/', this.options.sanitizedName)
      );
    }
  }

  _parseSwagger(content) {
    let formatters = {
      pathFormatter: helpers.reformatPathToGoGin,
      resourceFormatter: helpers.resourceNameFromPath
    };

    return swaggerize
      .parse(content, formatters)
      .then(response => {
        this.options.loadedApi = content;
        this.options.parsedSwagger = response.parsed;
        this.options.openApiFileType = response.type;
      })
      .catch(err => {
        err.message = 'failed to parse document ' + err.message;
        throw err;
      });
  }

  // Return true if 'sanitized', false if missing, exception if bad data
  _sanitizeOption(options, name) {
    let optionValue = options[name];
    if (!optionValue) {
      this.log('Missing', name, 'parameter');
      return false;
    }

    if (typeof optionValue === 'string' && optionValue.indexOf('file:') === 0) {
      let fileName = optionValue.replace('file:', '');
      let filePath = this.destinationPath('./' + fileName);
      this.log('Reading', name, 'parameter from local file', filePath);
      this.options[name] = this.fs.readJSON(filePath);
      return true;
    }

    try {
      this.options[name] =
        typeof this.options[name] === 'string'
          ? JSON.parse(this.options[name])
          : this.options[name];
      return true;
    } catch (e) {
      this.log(e);
      throw new Error(
        name + ' parameter is expected to be a valid stringified JSON object'
      );
    }
  }
};
