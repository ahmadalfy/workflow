class Test {
	constructor(name) {
		this.name = name;
	}

	console() {
		console.log(this.name);
	}
}

const testCase = new Test('hello world');
testCase.console();
