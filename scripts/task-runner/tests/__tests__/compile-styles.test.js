const fs = require('fs');
const { processCSS } = require('../../../common');
const { srcPath, distPath } = require('../mocked-config');

describe('Styles are compiled successfully', () => {
	it('Should compile postcss styles in srcPath and match results in distPath', (done) => {
		processCSS(srcPath, distPath, () => {
			fs.readFile(`${distPath}/styles/main.css`, (err, data) => {
				if (err) {
					console.log(err);
				}
				try {
					expect(data.toString())
						.toEqual(`h1{color:red}h1 span.super{text-transform:capitalize}h2{color:#00f}.test-container{display:flex}.test-container__paragraph{color:green}
/*# sourceMappingURL=main.css.map */`);
					done();
				} catch (error) {
					done(error);
				}
			});
		});
	});
});
