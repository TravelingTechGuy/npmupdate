#!/usr/bin/env node

'use strict';

//global modules and variables
var assert = require('assert'),
	chalk = require('chalk');
	
/**
 * Main entry to program, parses input, and loads NPM
 * @return {[type]} [description]
 */
var main = function() {
	var npm = require('npm'),
		program = require('commander'),
		list = function(val) {return val.split(',');},
		modulesToUpdate = [],
		config = {
			'depth': 0
		};

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
	//check for user-provided module names
	if(program.module && program.module.length > 0) {
		modulesToUpdate = program.module;
	}

	console.log('updating ' + chalk.inverse(config.global ? 'global' : 'local') + ' modules');

	//load NPM API
	npm.load(config, function(err, npm) {
		assert.equal(err, null, 'Error loading NPM');
		if(modulesToUpdate.length === 0) {
			//look for NPM outdated modules
			getOudtaedModules(npm, function(modules) {
				updateModules(npm, modules);
			});
		}
		else {
			updateModules(npm, modulesToUpdate);
		}
	});
};

/**
 * Gets list of outdated modules and prints current and desired versions
 * @param  {Object}   npm NPM API object
 * @param  {Function} cb  callback
 */
var getOudtaedModules = function(npm, cb) {
	var modulesToUpdate = [];
	npm.commands.outdated([], true, function(err, data) {
		assert.equal(err, null, 'Error finding outdated modules');
		//collect names of outdated modules
		if(data !== null && Array.isArray(data) && data.length > 0) {
			for(var i = 0; i < data.length; i++) {
				var module = data[i];
				//ignore global NPM out of date - should be updated the way NPM was originally installed (like MacPort)
				if(module[1] === 'npm' && npm.config.get('global')) {
					console.log(chalk.bgBlue.white('npm') + ' version ' + chalk.bgYellow.white(module[2]) + ':\tplease update using MacPort to version ' + chalk.bgYellow.white(module[3]));
				}
				else {
					modulesToUpdate.push(module[1]);
					console.log(chalk.bgBlue.white(module[1]) + ' version ' + chalk.bgYellow.white(module[2]) + ':\tnew version: ' + chalk.bgYellow.white(module[3]));
				}
			}
		}
		return cb(modulesToUpdate);
	});
};

/**
 * Updates provided modules
 * @param  {Object} npm NPM API object
 * @param {Array} modulesToUpdate array of module names
 */
var updateModules = function(npm, modulesToUpdate) {
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