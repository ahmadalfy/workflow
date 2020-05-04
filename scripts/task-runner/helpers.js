const path = require('path');
const fs = require('fs');
const uglifyEs = require('uglify-es');

/** search for recursively by extension */
const recFindByExt = (base, ext, files, result) => {
	files = files || fs.readdirSync(base);
	result = result || [];

	files.forEach((file) => {
		const newbase = path.join(base, file);
		if (fs.statSync(newbase).isDirectory()) {
			result = recFindByExt(newbase, ext, fs.readdirSync(newbase), result);
		} else {
			if (file.substr(-1 * (ext.length + 1)) == '.' + ext) {
				result.push(newbase);
			}
		}
	});
	return result;
};

/** write uglified scripts to dest files */
const uglify = (file, destPath) => {
	fs.readFile(file, 'utf8', (err, data) => {
		if (err) {
			console.log(err);
		}
		const uglifiedJs = uglifyEs.minify(data);
		checkDirExits(destPath, () => writeFile(destPath, uglifiedJs.code));
	});
};

const writeFile = (path, code) => {
	fs.writeFile(path, code, (err) => {
		if (err) {
			console.log(err);
		}
	});
};

/** make directories and sub directories if not exists
 * and run passed callback after creation
 */
const checkDirExits = (filePath, callBack) => {
	const parentDir = filePath.replace(path.basename(filePath), '');
	if (!fs.existsSync(parentDir)) {
		fs.mkdir(parentDir, { recursive: true }, (err) => {
			if (err) {
				console.log(err);
			}
			if (callBack && typeof callBack === 'function') {
				callBack();
			}
		});
	} else {
		if (callBack && typeof callBack === 'function') {
			callBack();
		}
	}
};

module.exports = {
	recFindByExt,
	uglify,
	checkDirExits,
};
