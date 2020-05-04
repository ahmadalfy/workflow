const fs = require('fs');
const { compileHTML } = require('../../../common');
const { srcPath, distPath } = require('../mocked-config');

describe('Compile Pug views successfully', () => {
	it('Should compile pug files in srcPath', async () => {
		await compileHTML(srcPath, distPath);
	});

	it('Should match the results in index.html file', () => {
		fs.readFile(`${distPath}/index.html`, (err, data) => {
			if (err) {
				throw err;
			}
			expect(data.toString()).toEqual(`
<h1>This is a Pug template<span class="super">test span</span></h1>
<h2>for Test purpose</h2>
<div class="test-container">
  <p class="test-container__paragraph">hello world</p>
</div>`);
		});
	});
});
