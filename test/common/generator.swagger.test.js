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
const fs = require('fs');
const PROJECT_NAME = 'ProjectName';

describe('Go Generator integration test with openApiServices Json file', () => {
	beforeEach(() => {
		let swagger = JSON.parse(
			fs.readFileSync(path.join(__dirname, '../resources/person_dino.json'), 'utf8')
		);
		let swagStr = JSON.stringify(swagger);

		// Mock the options, set up an output folder and run the generator
		return helpers
			.run(path.join(__dirname, '../../generators/app'))
			.withOptions({
				bluemix: JSON.stringify({
					name: PROJECT_NAME,
					openApiServers: [{ spec: swagStr }]
				}),
				spec: JSON.stringify({
					applicationType: 'BLANK'
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

	describe('basic file structure for blank with json test', () => {
		const expected = Object.keys(common.blankJSONFile).map(
			key => common.blankJSONFile[key]
		);

		it('generates the expected application files', () => {
			assert.file(expected);
		});
	});
});

describe('Go Generator integration test for microservice with openApiServices yaml file', () => {
	beforeEach(() => {
		let swagger = fs.readFileSync(
			path.join(__dirname, '../resources/productSwagger.yaml'),
			'utf8'
		);

		// Mock the options, set up an output folder and run the generator
		return helpers
			.run(path.join(__dirname, '../../generators/app'))
			.withOptions({
				bluemix: JSON.stringify({
					name: PROJECT_NAME,
					openApiServers: [{ spec: swagger }]
				}),
				spec: JSON.stringify({
					applicationType: 'BLANK'
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

	describe('basic file structure for blank with yaml test', () => {
		const expected = Object.keys(common.blankYmlFile).map(
			key => common.blankYmlFile[key]
		);

		it('generates the expected application files', () => {
			assert.file(expected);
		});
	});
});

describe('Go Generator integration test for microservice with NO openApiServices', () => {
	beforeEach(() => {
		// Mock the options, set up an output folder and run the generator
		return helpers
			.run(path.join(__dirname, '../../generators/app'))
			.withOptions({
				bluemix: JSON.stringify({
					name: PROJECT_NAME,
					backendPlatform: "GO"
				}),
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
