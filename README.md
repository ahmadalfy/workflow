# Frontend Modern Workflow

This is a complete revamp of the old workflow, rewritten from scratch with far less dependencies than the original version.

## Highlights in version 2

* Deprecating Gulp and moving to npm scripts. Gulp has been a great tool for so many years but recently it became stagnant and most of its plugins become outdated and suffer from security issues. With npm scripts we got more granularity and agility.

* Deprecating Browserify and moving to [Snowpack](https://www.snowpack.dev/). Snowpack is a tool that converts node modules into web modules. Best described by the following image from Snowpack documentation:

    ![img](https://www.snowpack.dev/img/how-does-it-work.jpg)

    This eliminiate the need to bundle the code, ship code with less boilerplate, more efficient with cache invalidation ... There is a lot of interesting stuff you can check at Snowpack documentation.

* All tasks have unit tests.

* Prettier and more informative console messages.

## What does this workflow provide

* Initialize development server using BrowserSync.
* Automatically refresh and reload the browser when assets change.
* Build HTML templates using pug.
* Use PostCSS plugins to speed up your work with CSS. The styles directory and files are follows the architecure descriped by Harry Roberts; [ITCSS](https://itcss.io/). This workflow is configured with the following PostCSS plugins
  * PostCSS dir pseudo class
  * PostCSS import
  * PostCSS logical
  * PostCSS nested
  * PostCSS preset-env
  * PostCSS reporter
  * PostCSS retina-bg-img
* Images optimization through imagemin
* Copying static assets (like images and fonts) from source to final dist directory.
* Generate SVG sprites from the images you provide.
* Babel configured, just drop in the plugins you want to use.
* ESling and prettier
* Git hooks through Husky and Lint staged
* Commit messages forced to follow [Conventional commits](https://conventionalcommits.org).

## Getting started

* Clone the repository then remove the `.git` folder.
* Check the `src` folder. All your code should be on that directory.

### Available tasks

These scripts can be run by `yarn SCRIPT_NAME` or `npm run SCRIPT_NAME`. They're available in `package.json` with key: `scripts`

* `snowpack` copies the scripts you configure from `node_modules` to `web_modules`. You will need to run this command every time you install a new dependency
* `test` run the workflow unit tests. You probably will need to override this with your own tests.
* `dev` starts the development server.
* `build` run the necessary scripts to build your application.

## Todo

* Write better documentation for getting started.
* Cache busting for scripts written by developers.
* Support for WebP and options to generate them automatically.
