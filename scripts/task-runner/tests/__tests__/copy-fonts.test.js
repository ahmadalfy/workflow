const fs = require('fs');
const { copyFonts } = require('../../../common');
const { srcPath, distPath } = require('../mocked-config');

describe('Fonts are copied successfully', () => {
	it('Should copy the Fonts from srcPath', () => {
		fs.mkdirSync(`${distPath}/fonts`);
		copyFonts(srcPath, distPath);
	});

	it('should match the Fonts in distPath', () => {
		fs.readdirSync(`${distPath}/fonts`, (err, files) => {
			if (err) {
				throw err;
			}
			expect(files).toEqual(['Publico-Bold']);
		});
	});
});
