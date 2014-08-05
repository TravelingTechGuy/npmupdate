#!/usr/bin/env node

'use strict';

var assert = require('assert'),
	chalk = require('chalk'),
	modulesToUpdate = [],
	config = {
		'depth': 0
	};

var main = function() {
	var npm = require('npm'),
		program = require('commander'),
		list = function(val) {return val.split(',');};

	//Command line parameters
	program
		.version(require('./package').version)
		.usage('[options]')
		.option('-m, --module <modulename,modulename,...>', 'update specified module/s', list)
		.option('-l, --local', 'update local repository (default: false)')
		.option('-v, --verbose', 'show update messages (default: false)')
		.parse(process.argv);
	
	//NPM config settings - saves separate npm.config.set calls
	config.global = !program.local;
	config.silent = !program.verbose;
	if(config.silent) {
		config.loglevel = 'silent';
	}

	if(program.module && program.module.length > 0) {
		modulesToUpdate = program.module;
	}

	console.log('updating ' + chalk.inverse(config.global ? 'global' : 'local') + ' modules');

	//load NPM API
	npm.load(config, function(err, npm) {
		assert.equal(err, null, 'Error loading NPM');
		if(modulesToUpdate.length === 0) {
			//look for NPM outdated modules
			getOudtaedModules(npm, function() {
				updateModules(npm);
			});
		}
		else {
			updateModules(npm);
		}
	});
};

var getOudtaedModules = function(npm, cb) {
	npm.commands.outdated([], true, function(err, data) {
		assert.equal(err, null, 'Error finding outdated modules');
		//collect names of outdated modules
		if(data !== null && Array.isArray(data) && data.length > 0) {
			for(var i = 0; i < data.length; i++) {
				var module = data[i];
				//ignore global NPM out of date - should be installed the way NPM was installed originally (like MacPort)
				if(module[1] === 'npm' && config.global) {
					console.log(chalk.bgBlue.white('npm') + ' version ' + chalk.bgYellow.white(module[2]) + ':\tplease update using MacPort to version ' + chalk.bgYellow.white(module[3]));
				}
				else {
					modulesToUpdate.push(module[1]);
					console.log(chalk.bgBlue.white(module[1]) + ' version ' + chalk.bgYellow.white(module[2]) + ':\tnew version: ' + chalk.bgYellow.white(module[3]));
				}
			}
		}
		return cb();
	});
};

var updateModules = function(npm) {
	if(modulesToUpdate.length > 0) {
		console.log(chalk.bgBlue.white('now updating ' + modulesToUpdate.toString() + '...'));
		//update outdated modules
		npm.commands.update(modulesToUpdate, function(err, results) {
			assert.equal(err, null, 'Error updating modules');
			if(results !== null && Array.isArray(results) && results.length > 0) {
				for(var i = 0; i < results.length; i++) {
					var module = results[i][0].split('@');
					console.log(chalk.bgBlue.white(module[0]) + ' updated to version ' + chalk.bgYellow.white(module[1]));
				}
			}
			else {
				console.log('nothing to update');
			}
		});
	}
	else {
		console.log(chalk.bgGreen.white('all modules are up to date'));
	}
};

main();