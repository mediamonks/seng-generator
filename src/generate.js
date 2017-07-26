const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const async = require('async');
const metalsmith = require('metalsmith');
const render = require('consolidate').handlebars.render;
const toSlugCase = require('to-slug-case');
const toSnakeCase = require('to-snake-case');
const toCamelCase = require('to-camel-case');
const toPascalCase = require('to-pascal-case');
const isTextOrBinary = require('istextorbinary');
const _ = require('lodash');
const handleBarsHelpers = require('handlebars-helpers')();

module.exports = function generate(type, options, settings) {
	const paths = settings.templatePath.split(',');

	templatePath = paths.find((templatePath) => pathExists(path.join(templatePath, '/' + type)));

	if (!templatePath) {
		console.error(chalk.red(`Template folder that contains template ${type} doesn't exist`));
		return Promise.reject();
	}

	if (!pathExists(templatePath)) {
		console.error(chalk.red(`Template folder (${path.resolve(settings.templatePath)}) doesn't exist`));
		return Promise.reject();
	}

	const fullTemplatePath = path.join(templatePath, '/' + type);

	console.log(chalk.green(chalk.bold(`Generating files from '${type}' template with name: ${options.name}`)));

	return new Promise((resolve, reject) => {
		metalsmith(fullTemplatePath)
			.metadata(getVariables(type, options, settings))
			.source('.')
			.destination(path.resolve(options.destination))
			.clean(false)
			.use(filterSettings)
			.use(renderPaths)
			.use(renderTemplates)
			.use(!options.force ? checkExists : (files, metalsmith, done) => done())
			.build((err) => {
				if (err) {
					console.error(chalk.red(err));
					reject();
				} else {
					resolve();
				}
			});
	}).catch((error) => {
	});
};

function getNames(name) {
	return {
		name,
		name_cc: toCamelCase(name),
		name_pc: toPascalCase(name),
		name_sc: toSlugCase(name),
		name_snc: toSnakeCase(name),
	}
}

function pathExists(value) {
	return fs.existsSync(path.resolve(value));
}

function renderPaths(files, metalsmith, done) {
	const keys = Object.keys(files);
	const metadata = metalsmith.metadata();

	keys.forEach((key) => {
		let newKey = replaceVars(key, metadata);

		if (newKey != key) {
			files[newKey] = files[key];
			delete files[key];
		}
	});

	done();
}

function filterSettings(files, metalsmith, done) {
	const keys = Object.keys(files);

	keys.forEach((key) => {
		if (key.slice(0, 1) == '.') {
			delete files[key];
		}
	});

	done();
}

function renderTemplates(files, metalsmith, done) {
	const keys = Object.keys(files);
	const metadata = metalsmith.metadata();
	metadata.helpers = handleBarsHelpers;

	async.each(keys, run, done);

	function run(file, done) {
		if (isTextOrBinary.isBinarySync(path.basename(file), files[file].contents)) {
			done();
			return;
		}
		let str = files[file].contents.toString();
		render(str, metadata, function (err, res) {
			if (err) {
				return done(err);
			}
			files[file].contents = new Buffer(res);
			done();
		});
	}
}

function checkExists(files, metalsmith, done) {
	const keys = Object.keys(files);

	const destination = metalsmith.destination();

	let fileExists = null;

	keys.forEach((key) => {
		const filePath = path.join(destination, key);
		if (pathExists(filePath)) {
			fileExists = filePath;
		}
	});

	if (fileExists) {
		done(`${fileExists} already exists. Use force (-f) if you want to override the existing file.`);
	} else {
		done();
	}
}

function replaceVars(value, object) {
	return value.replace(/\$?\{([@#$%&\w\.]*)(\((.*?)\))?\}/gi, (match, name) => {
		const props = name.split('.');
		const prop = props.shift();
		let o = object;

		if (o != null && prop in o) {
			return o[prop];
		}
		return '';
	});
}

function getVariables(type, options, settings) {
	let userVariables = options.variables || {};
	let variables = {};
	let variableSettings = {};

	if (settings.templates[type]) {
		variableSettings = (settings.templates[type].variables || []).reduce((result, variable) => {
			result[variable.name] = variable;

			return result;
		}, {});
		variables = (settings.templates[type].variables || []).reduce((result, variable) => {
			if (typeof variable.default === 'undefined' && typeof userVariables[variable.name] === 'undefined') {
				console.log(chalk.yellow(`Warning: custom variable '${variable.name}' is not supplied and has no default value`));
				console.log();
			}

			result[variable.name] = variable.default || '';

			return result;
		}, {});
	}

	userVariables = Object.keys(userVariables).reduce((result, key) => {
		let value = userVariables[key];

		if (variableSettings[key]) {
			if (variableSettings[key].isArray) {
				value = Array.isArray(value) ? value : value.split(',');
				value = value.map((item) => item.trim());
				if (variableSettings[key].isBoolean) {
					value = value.map((item) => item == 'true' || item == 1);
				} else if (variableSettings[key].isNumber) {
					value = value.map((item) => parseFloat(item));
				}
			} else if (variableSettings[key].isBoolean) {
				value = value == 'true' || value == 1;
			} else if (variableSettings[key].isNumber) {
				value = parseFloat(value);
			}
		} else {
			console.log(chalk.yellow(`Warning: variable '${key}' is not declared in the template .senggenerator file`));
			console.log();
		}

		result[key] = value;

		return result;
	}, {});

	return _.merge(variables, userVariables, getNames(options.name));
}

