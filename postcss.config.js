const stylelintConfig = require('./stylelint.config');

module.exports = {
	plugins: [
		require('postcss-import')({
			plugins: [
				require('stylelint')({
					config: stylelintConfig,
				}),
			],
		}),
		require('postcss-easy-import'),
		require('postcss-logical'),
		require('postcss-dir-pseudo-class'),
		require('postcss-preset-env'),
		require('postcss-nested'),
		require('postcss-retina-bg-img')({ retinaSuffix: '@2x' }),
		require('cssnano'),
		require('postcss-reporter')({ clearReportedMessages: true }),
	],
};
