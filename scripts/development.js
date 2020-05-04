const fs = require('fs');
const chalk = require('chalk');
const chokidar = require('chokidar');
const ncp = require('ncp').ncp;
const rimraf = require('rimraf');

const { startServer } = require('./server');
const { Utils } = require('./utilities');
const { config } = require('./config');
const { copyImages, copyFonts, createSVGSprite, compileHTML, processCSS } = require('./common');

let serverRunning = false;

const { src, tmp, sprite } = config.path;

// Clean tmp and reCreate directories
const createServeDirectories = () => {
	rimraf.sync(`./${tmp}`);
	fs.mkdirSync(`./${tmp}`);
	fs.mkdirSync(`./${tmp}/styles`);
	fs.mkdirSync(`./${tmp}/images`);
};

// Copy scripts folder to .tmp
const copyScripts = () => {
	ncp(`${src}/scripts`, `./${tmp}/scripts`, (err) => {
		if (err) {
			return console.error(err);
		}
		Utils.logInfo('Scripts', 'gold', 'Copied successfully');
	});
};

const updateFiles = (path, event) => {
	const fileType = path.split('.').pop();
	switch (fileType) {
		case 'css':
			Utils.logInfo(event, 'orange', `path: ${path}`);
			processCSS(src, tmp);
			break;

		case 'pug':
			Utils.logInfo(event, 'orange', `path: ${path}`);
			compileHTML(src, tmp);
			break;

		case 'jpg':
		case 'png':
		case 'gif':
			Utils.logInfo(event, 'darkseagreen', `path: ${path}`);
			copyImages(src, tmp);
			break;

		case 'svg':
			Utils.logInfo(event, 'darkseagreen', `path: ${path}`);
			copyImages(src, tmp);
			if (path.indexOf(`${sprite}`) !== -1) {
				createSVGSprite(src, tmp);
			}
			break;

		case 'js': {
			Utils.logInfo(event, 'orange', `path: ${path}`);
			const destination = `${tmp}/${path.split('/').slice(1).join('/')}`;
			fs.copyFile(path, destination, (err) => {
				if (err) throw err;
				Utils.logInfo('Scripts', 'gold', `${destination} updated successfully`);
			});
			break;
		}

		default:
			console.log(chalk.cyan(`${event}: ${path}`));
			break;
	}
};

const watchFilesChanges = () => {
	// Initialize watcher.
	const watcher = chokidar.watch(`${src}`, {
		persistent: true,
		ignoreInitial: true,
	});
	// Add event listeners.
	watcher
		.on('add', (path) => {
			updateFiles(path, 'Added');
		})
		.on('change', (path) => {
			updateFiles(path, 'Changed');
		})
		.on('unlink', (path) => console.log(`File ${path} has been removed`));

	// More possible events.
	watcher
		.on('addDir', (path) => console.log(`Directory ${path} has been added`))
		.on('unlinkDir', (path) => console.log(`Directory ${path} has been removed`))
		.on('error', (error) => console.log(`Watcher error: ${error}`))
		.on('ready', () => {
			Utils.logInfo('Watcher', 'orange', 'Scan complete');
		});
};

const serve = () => {
	createServeDirectories();
	copyScripts();
	copyImages(src, tmp);
	copyFonts(src, tmp);
	compileHTML(src, tmp);
	createSVGSprite(src, tmp);
	processCSS(src, tmp, () => {
		if (!serverRunning) {
			startServer();
			serverRunning = true;
		}
	});
	watchFilesChanges();
};

module.exports = {
	serve,
};
