const chalk = require('chalk');

const logInfo = (scope, color, message, noSeparator = false) => {
	if (!noSeparator) {
		console.log(chalk.grey(' ------------------------------------'));
	}
	console.log(`[${chalk.keyword(color)(scope)}] ${chalk.keyword('ivory')(message)}`);
};

const logInfoList = (messagesList) => {
	messagesList.forEach((message) => {
		logInfo(...message);
	});
};

module.exports = {
	Utils: {
		logInfo,
		logInfoList,
	},
};
