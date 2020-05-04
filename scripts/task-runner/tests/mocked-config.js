const path = require('path');
const { config } = require('../../config');

module.exports = {
	srcPath: path.join(__dirname, `${config.path.src}`),
	distPath: path.join(__dirname, `${config.path.dist}`),
};
