module.exports = {
	transform: {
		'^.+\\.[t|j]s?$': 'babel-jest',
	},
	transformIgnorePatterns: ['<rootDir>/node_modules/*.+\\.js$'],
	moduleFileExtensions: ['js', 'json'],
	globals: {
		NODE_ENV: 'test',
	},
};
