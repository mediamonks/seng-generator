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

module.exports = function generate(type, options, settings) {
	const paths = settings.templatePath.split(',');

	templatePath = paths.find((templatePath) => pathExists(path.join(templatePath, '/' + type)));

	if(!templatePath) {
		console.error(chalk.red(`Template folder that contains template ${type} doesn't exist`));
		return Promise.reject();
	}

	if (!pathExists(templatePath)) {
		console.error(chalk.red(`Template folder (${path.resolve(settings.templatePath)}) doesn't exist`));
		return Promise.reject();
	}

	const fullTemplatePath = path.join(templatePath, '/' + type);

	console.log(chalk.green(chalk.bold(`Generating files from '${type}' template with name: ${options.name}`)));

	let userVariables = options.variables || {};
	let variables = {};
	let variableSettings = {};

	if(settings.templates[type]) {
		variableSettings = (settings.templates[type].variables || []).reduce((result, variable) => {
			result[variable.name] = variable;

			return result;
		}, {});
		variables = (settings.templates[type].variables || []).reduce((result, variable) => {
			if(typeof variable.default == 'undefined' && typeof userVariables[variable.name] == 'undefined') {
				console.log(chalk.orange(`warning: custom variable '${variable.name}' is not supplied and has no default value`));
			}

			if(typeof variable.default)
			result[variable.name] = variable.default || '';

			return result;
		}, {});
	}

	userVariables = Object.keys(userVariables).reduce((result, key)=> {
		let value = userVariables[key];

		if(variableSettings[key]) {
			if(variableSettings[key].isArray) {
				value = value.split(',');
				if(variableSettings[key].isBoolean) {
					value = value.map((item) => item == 'true' || item == 1);
				} else if(variableSettings[key].isNumber) {
					value = value.map((item) => parseFloat(item));
				}
			} else if(variableSettings[key].isBoolean) {
				value = value == 'true' || value == 1;
			} else if(variableSettings[key].isNumber) {
				value = parseFloat(value);
			}
		} else {
			console.log(chalk.orange(`warning: variable '${key}' is not declared in the template .senggenerator file`));
		}

		result[key] = value;

		return result;
	}, {});

	variables = _.merge(variables, userVariables, getNames(options.name));

	return new Promise((resolve, reject) => {
		metalsmith(fullTemplatePath)
			.metadata(variables)
			.source('.')
			.destination(path.resolve(options.destination))
			.clean(false)
			.use(filterSettings)
			.use(renderPaths)
			.use(renderTemplates)
			.build(function (err) {
				if (err) {
					console.error(chalk.red(err));
					reject();
				}
				else {
					resolve();
				}
			});
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

	async.each(keys, run, done);

	function run(file, done) {
		if(isTextOrBinary.isBinarySync(path.basename(file), files[file].contents)) {
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

function replaceVars(value, object) {
	return value.replace(/\$?\{([@#$%&\w\.]*)(\((.*?)\))?\}/gi, (match, name) => {
		const props = name.split(".");
		const prop = props.shift();
		let o = object;

		if (o != null && prop in o) {
			return o[prop];
		}
		return '';
	});
}

