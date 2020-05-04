const fs = require('fs');
const { copyImages } = require('../../../common');
const { srcPath, distPath } = require('../mocked-config');

describe('Images are copied successfully', () => {
	it('Should copy the images from srcPath', async () => {
		await copyImages(srcPath, distPath);
	});

	it('should match the images in distPath', () => {
		fs.readdirSync(`${distPath}/images`, (err, files) => {
			if (err) {
				console.log(err);
			}
			expect(files).toEqual(['icons', 'image.png']);
		});
	});
});
