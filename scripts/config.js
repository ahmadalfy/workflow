const path = {
	src: 'src',
	tmp: '.tmp',
	dist: 'dist',
	sprite: 'images/icons',
};

const svgOptions = {
	log: '',
	shape: {
		id: {
			separator: '-',
			generator: 'icon-%s',
		},
	},
	svg: {
		// General options for created SVG files
		xmlDeclaration: true, // Add XML declaration to SVG sprite
		doctypeDeclaration: true, // Add DOCTYPE declaration to SVG sprite
		namespaceIDs: true, // Add namespace token to all IDs in SVG shapes
		namespaceIDPrefix: 'icon', // Add a prefix to the automatically generated namespaceIDs
		namespaceClassnames: true, // Add namespace token to all CSS class names in SVG shapes
		dimensionAttributes: true, // Width and height attributes on the sprite
	},
	mode: {
		css: false, // Create a «css» sprite
		view: false, // Create a «view» sprite
		symbol: false, // Create a «symbol» sprite
		stack: false, // Create a «stack» sprite
		defs: {
			// Create a «defs» sprite
			dest: '.',
			sprite: 'sprite',
		},
	},
};

module.exports = {
	config: {
		path,
		svgOptions,
	},
};
