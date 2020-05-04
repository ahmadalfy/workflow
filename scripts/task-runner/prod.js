const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const rimraf = require('rimraf');
const minify = require('babel-minify');
const babel = require('@babel/core');

const { Utils } = require('../utilities');
const { recFindByExt, uglify, checkDirExits } = require('./helpers');

/**
 * remove dist folder
 *
 * @param {string} distPath
 */
const cleanDistDirectories = (distPath) => {
	rimraf.sync(`${distPath}`);
	console.log(chalk.yellow('Done removing build files'));
};

/**
 * create dist folder and subFolders
 *
 * @param {string} distPath
 */
const createDistDirectories = (distPath) => {
	const createDistFiles = (fileName) => {
		if (!fs.existsSync(`${fileName}`)) {
			fs.mkdirSync(`${fileName}`);
		}
	};
	createDistFiles(`${distPath}`);
	createDistFiles(`${distPath}/scripts`);
	createDistFiles(`${distPath}/styles`);
	createDistFiles(`${distPath}/images`);
	console.log(chalk.green('Done creating build files'));
};

/**
 * search for js files in srcPath
 * babelify and minify nonModular file
 * uglify modular files
 * write files in distPath
 *
 * @param {string} srcPath
 * @param {string} distPath
 */
const buildScripts = (srcPath, distPath) => {
	const files = recFindByExt(`${srcPath}/scripts`, 'js');
	if (files && files.length) {
		files.forEach((file) => {
			const destPath = file.replace(`${srcPath}`, `${distPath}`);
			if (path.basename(file) === 'app.nomodule.js') {
				/** babelify and minify modular scripts */
				checkDirExits(destPath, () => {
					babel.transformFile(file, (err, result) => {
						if (err) {
							console.log(err);
						}
						const { code } = minify(result.code, {
							mangle: {
								keepClassName: true,
							},
						});
						fs.writeFile(destPath, code, (err) => {
							if (err) {
								console.log(err);
							}
							Utils.logInfo('JS', 'yellow', `Finished Babelify ${file}`);
						});
					});
				});
			} else {
				/** uglify modular scripts */
				uglify(file, destPath);
				Utils.logInfo('JS', 'yellow', `Finished Minify & Uglify ${file}`);
			}
		});
	}
};

module.exports = {
	cleanDistDirectories,
	createDistDirectories,
	buildScripts,
};
