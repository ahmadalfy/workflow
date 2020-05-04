const { cleanDistDirectories, createDistDirectories, buildScripts } = require('./prod');
const { config } = require('../config');
const { copyImages, copyFonts, createSVGSprite, compileHTML, processCSS } = require('../common');
const { Utils } = require('../utilities.js');
const { serve } = require('../development');
const runner = require('./runner');

const { src, dist } = config.path;

/** available runner tasks */
runner.task('clean', 'clean dist directory', () => cleanDistDirectories(dist));

runner.task('dist', 'Create dist directory and subDirectory', () => createDistDirectories(dist));

runner.task('views', 'Compile Pug views', () => compileHTML(src, dist));

runner.task('styles', 'Compile PostCss styles', () =>
	processCSS(src, dist, () => {
		Utils.logInfo('CSS', 'steelblue', 'Finished Building styles');
	})
);

runner.task('scripts', 'Bundle and Uglify scripts', () => buildScripts(src, dist));

runner.task('images', 'Copy Images folders', () => copyImages(src, dist));

runner.task('fonts', 'Copy Fonts folder', () => copyFonts(src, dist));

runner.task('svg:sprite', 'Extract Svgs into sprite file', () => createSVGSprite(src, dist));

runner.task('serve', 'Compile views, css and js and Optimize asset for serve', () => serve());

runner.task('build', 'Create Dist Folders & Build Views, Scripts and Assets', () => {}, [
	'dist',
	'views',
	'styles',
	'scripts',
	'images',
	'fonts',
	'svg:sprite',
]);

runner.task('build:clean', 'Build Views, Scripts and Assets', () => {}, ['clean', 'build']);
