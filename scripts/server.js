const bs = require('browser-sync').create();

const startServer = () => {
	bs.init({
		server: {
			baseDir: ['.tmp'],
		},
		watchOptions: {
			ignoreInitial: true,
			ignored: ['node_modules'],
		},
		files: '.tmp/**',
		port: 3000,
	});
};

bs.watch('*.html').on('change', bs.reload);

bs.watch('*.js').on('change', bs.reload);

bs.watch('*.css', (event) => {
	if (event === 'change') {
		bs.reload('*.css');
	}
});

module.exports = {
	startServer,
};
