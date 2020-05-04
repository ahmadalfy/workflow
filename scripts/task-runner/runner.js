const chalk = require('chalk');

/** initial tasks obj */
let tasks = {};

/** create task object with name, desc, callback function with optional array of subtasks  */
const onTask = (name, desc, callback, subtasks) => {
	if (Array.isArray(subtasks) && typeof callback === 'function') {
		tasks[name] = {
			desc,
			subtasks,
			callback,
		};
	} else if (!subtasks) {
		tasks[name] = {
			desc,
			subtasks: [],
			callback,
		};
	} else {
		console.log(chalk.red('invalid task registration'));
	}
};

/** run task callback and subtasks if exists */
const runTask = (name) => {
	const task = tasks[name];
	if (task.subtasks) {
		task.subtasks.forEach((subtask) => {
			runTask(subtask);
		});
	}
	if (task.callback) {
		task.callback();
	}
};

/** run task as a callback for every new tick of Node event loop */
process.nextTick(() => {
	const taskName = process.argv[2];
	const task = tasks[taskName];
	if (!taskName) {
		/** set build:clean as default task if not specified */
		runTask('build:clean');
		return true;
	}
	if (taskName && task) {
		runTask(taskName);
		if (taskName !== 'serve') {
			setTimeout(() => process.exit(), 5000);
		}
	} else {
		console.log(
			chalk.red(`Invalid Task: ${chalk.yellow(taskName)}`),
			'\n',
			'Available Tasks: ',
			'\n'
		);
		Object.keys(tasks).forEach((task) => {
			console.log(`- ${task}: ${tasks[task].desc}\n`);
		});
	}
});

let runner = {
	task: onTask,
};

module.exports = runner;
