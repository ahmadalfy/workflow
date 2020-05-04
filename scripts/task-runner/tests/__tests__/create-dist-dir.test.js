const fs = require('fs');
const { cleanDistDirectories, createDistDirectories } = require('../../prod');
const { distPath } = require('../mocked-config');

describe('Cleaning and Creating Dist directories', function () {
	it('Clean and remove Dist directories', async () => {
		await cleanDistDirectories(distPath);
		expect(!fs.existsSync(`${distPath}`)).toBeTruthy();
	});

	it('Create Dist directories', async () => {
		await createDistDirectories(distPath);
		expect(fs.existsSync(`${distPath}`)).toBeTruthy();
	});
});
