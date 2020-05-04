module.exports = {
	plugins: ['stylelint-prettier'],
	extends: ['stylelint-config-recommended', 'stylelint-prettier/recommended'],
	rules: {
		'at-rule-empty-line-before': null,
		'rule-empty-line-before': null,
		'selector-type-no-unknown': [
			true,
			{
				ignore: ['custom-elements', 'default-namespace'],
			},
		],
	},
};
