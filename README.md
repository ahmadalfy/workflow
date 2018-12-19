# Robusta's HTML Workflow

[![Greenkeeper badge](https://badges.greenkeeper.io/ahmadalfy/workflow.svg)](https://greenkeeper.io/)

## Tasks
  Tasks can be run by running `yarn gulp TASK_NAME`. If you prefer to use your global gulp installation then `gulp TASK_NAME`.
- *`build`* To build production ready dist.
- *`serve`* To serve content in dev mode.
- *`optimize:images`* To optimizes images in the src directory and should be run whenever you add a new image.
- *`default`* which is run by executing `gulp` or `yarn gulp` and it's the same as `serve`

## Available scripts
These scripts can be run by `yarn SCRIPT_NAME` or `npm run SCRIPT_NAME`. They're available in `package.json` with key: `scripts`
- `optimize:images` It executes the `images` task
- `build` It executes the `build` task
- `start` It executes the `serve` task
- `prepush` This command is run as a pre-push hook by husky. Which means everytime you try to push you code to remote, it will execute this task. Currently it lints js & css.
- `lint:js` Lints js scripts in src
- `lint:css` Lints css files in src
- `format`: Format files in src

## New Features
- We added husky for precommit & prepush hooks.
- We added gulp-rev-all in an attempt to use revisioned files.
- We separated the images optimization task from the build queue to be run on its own
- We added stylelint to lint css too.
- Added sw-support but disabled by default. You need to uncomment `registerServiceWorker()` in main.js to enable it.

## TODO
- Finetune the precommit & prepush hooks
- Finetune gulp-rev-all task and replace it if needed
- Add service workers support using workbox
