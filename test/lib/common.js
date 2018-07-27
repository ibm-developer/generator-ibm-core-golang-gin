/*
 Copyright 2017 IBM Corp.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/**
 * Contains helper code that is used by the tests.
 */
'use strict';

// Paths to the generated files, if you move files around change paths here.
/*eslint-disable */
exports.commonFile = {
  server_go: 'server.go',
  server_test_go: 'routers/health_test.go',
  gitignore: '.gitignore',
  README_md: 'README.md',
  Gopkg_lock: 'Gopkg.lock',
  Gopkg_toml: 'Gopkg.toml',
  health_go: 'routers/health.go',
  run_dev: 'run-dev'
}

exports.webAppFile = {
  index_go: 'routers/index.go',
};

// exports.webFrameworkFile = {
//   default_css: 'client/default.css',
//   webpack_common_js: 'webpack.common.js',
//   package_json: 'package.json'
// };

exports.microserviceFile = {
  swagger_ui: 'public/swagger-ui/',
  swagger_yml: 'public/swagger.yaml',
  swagger_go: 'routers/swagger.go',
}

// exports.blankNoYmlFile = {}

exports.blankYmlFile = {
  swagger_ui: 'public/swagger-ui/',
  swagger_yml: 'public/swagger.yaml',
  products_go: 'routers/products.go',
  swagger_go: 'routers/swagger.go'
}

exports.blankJSONFile = {
  swagger_ui: 'public/swagger-ui/',
  swagger_json: 'public/swagger.json',
  persons_go: 'routers/persons.go',
  dinosaurs_go: 'routers/dinosaurs.go',
  swagger_go: 'routers/swagger.go'
}
/* eslint-enable */

// Default port defined in app/server.go.
exports.defaultPort = 3000;

// The go run command.
exports.goRun = 'go run server.go';
