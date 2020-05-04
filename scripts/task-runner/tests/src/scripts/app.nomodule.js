'use strict';

function _instanceof(left, right) {
	if (right != null && typeof Symbol !== 'undefined' && right[Symbol.hasInstance]) {
		return !!right[Symbol.hasInstance](left);
	} else {
		return left instanceof right;
	}
}

function _classCallCheck(instance, Constructor) {
	if (!_instanceof(instance, Constructor)) {
		throw new TypeError('Cannot call a class as a function');
	}
}

function _defineProperties(target, props) {
	for (var i = 0; i < props.length; i++) {
		var descriptor = props[i];
		descriptor.enumerable = descriptor.enumerable || false;
		descriptor.configurable = true;
		if ('value' in descriptor) descriptor.writable = true;
		Object.defineProperty(target, descriptor.key, descriptor);
	}
}

function _createClass(Constructor, protoProps, staticProps) {
	if (protoProps) _defineProperties(Constructor.prototype, protoProps);
	if (staticProps) _defineProperties(Constructor, staticProps);
	return Constructor;
}

var Test = /*#__PURE__*/ (function () {
	function Test(name) {
		_classCallCheck(this, Test);

		this.name = name;
	}

	_createClass(Test, [
		{
			key: 'console',
			value: (function (_console) {
				function console() {
					return _console.apply(this, arguments);
				}

				console.toString = function () {
					return _console.toString();
				};

				return console;
			})(function () {
				console.log(this.name);
			}),
		},
	]);

	return Test;
})();

var testCase = new Test('hello world');
testCase.console();
