# Robusta's HTML Workflow

## Tasks
  Tasks can be run by running `yarn gulp TASK_NAME`. If you prefer to use your global gulp installation then `gulp TASK_NAME`.
- *`build`* To build production ready dist.
- *`serve`* To serve content in dev mode.
- *`start`* The same as serve.
- *`optimize:images`* To optimizes images in the src directory and should be run whenever you add a new image.

## New Features
- We added husky for precommit & prepush hooks.
- We added gulp-rev-all in an attempt to use revisioned files.
- We separated the images optimization task from the build queue to be run on its own

## TODO
- Finetune the precommit & prepush hooks
- Finetune gulp-rev-all task and replace it if needed
- Add service workers support using workbox
