module.exports = {
	plugins: {
		'postcss-import': {},
		'postcss-easy-import': {},
		'postcss-logical': {},
		'postcss-dir-pseudo-class': {},
		'postcss-preset-env': { stage: 0 },
		'postcss-nested': {},
		'postcss-retina-bg-img': { retinaSuffix: '@2x' },
		cssnano: {
			discardComments: {
				removeAll: true,
			},
		},
	},
};
