const fs = require('fs');
const chalk = require('chalk');
const path = require('path');
const ncp = require('ncp').ncp;
const pug = require('pug');
const SVGSpriter = require('svg-sprite');
const postcss = require('postcss');
const postcssConfig = require('../postcss.config');
const { config } = require('./config');
const { Utils } = require('./utilities');

/**
 * copy images folder from srcPath to destPath
 *
 * @param {string} srcPath
 * @param {string} destPath
 */
const copyImages = (srcPath, destPath) => {
	ncp(`${srcPath}/images`, `${destPath}/images`, (err) => {
		if (err) {
			return console.error(err);
		}
	});
	Utils.logInfo('Images', 'hotpink', 'Copied successfully');
};

/**
 * checks if srcPath contains fonts folder
 * copy fonts to destPath
 *
 * @param {string} srcPath
 * @param {string} destPath
 */
const copyFonts = (srcPath, destPath) => {
	if (fs.existsSync(`${srcPath}/fonts`)) {
		ncp(`${srcPath}/fonts`, `${destPath}/fonts`, (err) => {
			if (err) {
				return console.error(err);
			}
		});
		Utils.logInfo('Fonts', 'black', 'Copied successfully');
	}
};

/**
 * combine svg files in sprite file in destPath images directory
 *
 * @param {string} srcPath
 * @param {string} destPath
 */
const createSVGSprite = (srcPath, destPath) => {
	const options = { ...{ dest: `${destPath}/images` }, ...config.svgOptions };
	const spriter = new SVGSpriter(options);

	fs.readdir(`${srcPath}/${config.path.sprite}`, (err, files) => {
		if (err) {
			console.error('Could not list the directory', err);
			process.exit(1);
		}

		Utils.logInfo('Sprite', 'darkseagreen', `Building SVG Sprite from ${config.path.sprite}`);

		files.forEach((file) => {
			if (file.indexOf('.svg') !== -1) {
				const fileWithPath = path.join(`${srcPath}/${config.path.sprite}`, file);
				console.log(chalk.keyword('darkseagreen')(`Adding ${fileWithPath} to sprite`));
				// __dirname is requirerd because svgo needs an absolute path. Otherwise the
				// name used to construct the ID would be empty
				spriter.add(
					__dirname + fileWithPath,
					null,
					fs.readFileSync(fileWithPath, { encoding: 'utf-8' })
				);
			}
		});

		// Compile the sprite
		spriter.compile((error, result) => {
			/* Write `result` files to disk (or do whatever with them ...) */
			for (const mode in result) {
				for (const resource in result[mode]) {
					fs.writeFileSync(result[mode][resource].path, result[mode][resource].contents);
				}
			}
		});
	});
};

/**
 * search for pug files in srcPath directory
 * extract compiled html content to destPath directory
 *
 * @param {string} srcPath
 * @param {string} destPath
 */
const compileHTML = (srcPath, destPath) => {
	const files = fs.readdirSync(`${srcPath}`);
	if (files && files.length) {
		files.forEach(async (file) => {
			if (file.indexOf('.pug') !== -1) {
				const fileWithPath = path.join(`${srcPath}`, file);
				const fileWithPathDev = path.join(`${destPath}`, file.replace('pug', 'html'));
				Utils.logInfo('HTML', 'green', `Building ${fileWithPath}`);
				try {
					const fileContent = await pug.renderFile(fileWithPath, {
						compileDebug: true,
						// debug: true,
						pretty: true,
					});
					fs.writeFileSync(fileWithPathDev, fileContent);
					console.log(chalk.cyan(`Done, file compiled to ${fileWithPathDev}`));
				} catch (error) {
					console.log(error);
				}
			}
		});
	}
};

/**
 * compile postCss in main.css file in srcPath directory
 * write compiled css to dest./$./$Path directory
 * write sourceMap to tmp directory for dev serve purpose
 *
 * @param {string} srcPath
 * @param {string} destPath
 * @param {func} callBack
 */
const processCSS = (srcPath, destPath, callBack) => {
	fs.readFile(`${srcPath}/styles/main.css`, (err, css) => {
		if (err) {
			console.log(err);
		}
		postcss(postcssConfig.plugins)
			.process(css, {
				from: `${srcPath}/styles/main.css`,
				to: `${destPath}/styles/main.css`,
				map: { inline: false },
			})
			.then((result) => {
				fs.writeFile(`${destPath}/styles/main.css`, result.css, () => true);
				if (result.map && destPath === config.path.tmp) {
					fs.writeFile(`${destPath}/styles/main.css.map`, result.map, () => true);
				}
			})
			.catch((err) => {
				Utils.logInfoList([
					['Error ', 'red', err.name],
					['Reason', 'red', err.reason, true],
					['Path  ', 'red', `${err.file}:${err.line}:${err.column}`, true],
					['Plugin', 'red', err.plugin, true],
				]);
			})
			.finally(() => {
				if (callBack && typeof callBack === 'function') {
					callBack();
				}
				Utils.logInfo('CSS', 'steelblue', 'Processed successfully');
			});
	});
};

module.exports = {
	copyImages,
	copyFonts,
	createSVGSprite,
	compileHTML,
	processCSS,
};
