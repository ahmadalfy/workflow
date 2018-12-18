// Configurable paths
let config = {
  src: 'src',
  dist: 'dist'
};
const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync').create();
const del = require('del');
const svgSprite = require('gulp-svg-sprite');
const babel = require('babelify');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const sourcemaps = require('gulp-sourcemaps');
const gulpStylelint = require('gulp-stylelint');
const workbox = require('workbox-build');

const $ = gulpLoadPlugins();
const { reload } = browserSync;

let dev = true;

gulp.task('styles', () =>
  gulp
    .src('./src/styles/*.css')
    .pipe(sourcemaps.init())
    .pipe($.plumber())
    .pipe($.postcss())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(reload({ stream: true }))
);

gulp.task('scripts', () => {
  const bundler = browserify('src/scripts/main.js', { debug: dev }).transform(babel);
  return bundler
    .bundle()
    .on('error', err => {
      console.error(err); /* eslint-disable-line */
      this.emit('end');
    })
    .pipe(source('main.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('.tmp/scripts'));
});

function lint(files) {
  return gulp
    .src(files)
    .pipe($.eslint({ fix: true }))
    .pipe(reload({ stream: true, once: true }))
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
}

gulp.task('lint:js', () => lint('src/scripts/**/*.js').pipe(gulp.dest('src/scripts')));

gulp.task('lint:test', () => lint('test/spec/**/*.js').pipe(gulp.dest('test/spec')));

gulp.task('views', () =>
  gulp
    .src('src/*.pug')
    .pipe($.plumber())
    .pipe($.data(() => ({ require })))
    .pipe($.pug({ pretty: true }))
    .pipe(gulp.dest('.tmp'))
    .pipe(reload({ stream: true }))
);

gulp.task('svgSprite', () => {
  config = {
    mode: {
      defs: {
        // Activate the «defs» mode
        sprite: '../svg-defs.svg', // Hack to
        prefix: 'shape'
      }
    }
  };
  return gulp
    .src('src/images/svg-sprite/*.svg')
    .pipe(svgSprite(config))
    .pipe(gulp.dest('src/images/'));
});

gulp.task('fonts', () =>
  gulp.src('src/fonts/**/*').pipe($.if(dev, gulp.dest('.tmp/fonts'), gulp.dest('dist/fonts')))
);

function modernizerTask(dest) {
  return () => {
    gulp
      .src([`${dest}/scripts/{,*/}*.js`, `${dest}/styles/{,*/}*.css`, `!${dest}/scripts/vendor/*`])
      .pipe($.modernizr())
      .pipe($.uglify())
      .pipe(gulp.dest(`${dest}/scripts/vendor/`));
  };
}
gulp.task(
  'modernizr:serve',
  gulp.series(done => {
    modernizerTask('.tmp');
    done();
  })
);
gulp.task(
  'modernizr:build',
  gulp.series(done => {
    modernizerTask('dist');
    done();
  })
);

gulp.task('extras', () =>
  gulp
    .src(['src/*', '!src/*.html', '!src/*.pug', '!src/includes'], {
      dot: true
    })
    .pipe(gulp.dest('dist'))
);

gulp.task('lint:css', () =>
  gulp.src('src/styles/**/*.css').pipe(
    gulpStylelint({
      reporters: [{ formatter: 'string', console: true }]
    })
  )
);

gulp.task(
  'html',
  gulp.series(['lint:css', 'lint:js', 'views', 'styles', 'scripts'], () =>
    gulp
      .src('.tmp/**/*[.html, .js, .css]')
      .pipe($.useref({ searchPath: ['.tmp', 'src', '.'] }))
      .pipe($.if(/\.js$/, $.uglify({ compress: { drop_console: true } })))
      .pipe($.if(/\.css$/, $.cssnano({ safe: true, autoprefixer: false })))
      .pipe(
        $.if(
          /\.html$/,
          $.htmlmin({
            collapseWhitespace: false,
            minifyCSS: true,
            minifyJS: { compress: { drop_console: true } },
            processConditionalComments: true,
            removeComments: true,
            removeEmptyAttributes: false,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true
          })
        )
      )
      .pipe(gulp.dest('dist'))
  )
);

// Pre-caching
function generateSW(dist) {
  return workbox.generateSW({
    globDirectory: dist,
    globPatterns: ['**/*.{html,js,css}'],
    swDest: `${dist}/sw.js`,
    clientsClaim: true,
    skipWaiting: true,
    runtimeCaching: [
      {
        urlPattern: /\.jpg$/,
        handler: 'cacheFirst'
      }
    ]
  });
}

gulp.task('sw:build', () =>
  generateSW('dist')
    .then(({ warnings }) => {
      // In case there are any warnings from workbox-build, log them.
      for (const warning of warnings) {
        console.warn(warning); /* eslint-disable-line */
      }
      console.info('Service worker generation completed.'); /* eslint-disable-line */
    })
    .catch(error => {
      console.warn('Service worker generation failed:', error); /* eslint-disable-line */
    })
);

gulp.task('sw:serve', () =>
  generateSW('.tmp')
    .then(({ warnings }) => {
      // In case there are any warnings from workbox-build, log them.
      for (const warning of warnings) {
        console.warn(warning); /* eslint-disable-line */
      }
      console.info('Service worker generation completed.'); /* eslint-disable-line */
    })
    .catch(error => {
      console.warn('Service worker generation failed:', error); /* eslint-disable-line */
    })
);

// I dont need to clean dist as the clean task is called on serve only
gulp.task('clean:build', del.bind(null, ['dist']));
gulp.task('clean:serve', del.bind(null, ['.tmp']));

// @Task is used to optimize images in src directory
gulp.task('optimize:images', () =>
  gulp
    .src('src/images/**/*')
    .pipe(
      $.cache(
        $.imagemin(
          [
            $.imagemin.gifsicle({ interlaced: true }),
            $.imagemin.jpegtran({ progressive: true }),
            $.imagemin.optipng({ optimizationLevel: 5 })
          ],
          {
            verbose: true
          }
        )
      )
    )
    .pipe(gulp.dest('dist/images'))
);

gulp.task('images', () =>
  gulp.src('src/images/**/*').pipe($.if(dev, gulp.dest('.tmp/images'), gulp.dest('dist/images')))
);

// @Task Default task to run when you run `gulp` with no arguments
gulp.task(
  'default',
  gulp.series(
    done =>
      new Promise(resolve => {
        gulp.series('serve', resolve);
        done();
      })
  )
);

// @Task unused one
gulp.task(
  'serve:dist',
  gulp.series(['default'], () => {
    browserSync.init({
      notify: false,
      port: 9000,
      server: {
        baseDir: ['dist']
      }
    });
  })
);

// @Task unused one
gulp.task(
  'serve:test',
  gulp.series(['scripts'], () => {
    browserSync.init({
      notify: false,
      port: 9000,
      ui: false,
      server: {
        baseDir: 'test',
        routes: {
          '/scripts': '.tmp/scripts'
        }
      }
    });

    gulp.watch('src/scripts/**/*.js', ['scripts']);
    gulp.watch(['test/spec/**/*.js', 'test/index.html']).on('change', reload);
    gulp.watch('test/spec/**/*.js', ['lint:test']);
  })
);

// @Task `serve` is used to serve the content in dev mode
gulp.task(
  'serve',
  gulp.series(
    [
      'clean:serve',
      'lint:js',
      'lint:css',
      'views',
      'styles',
      'scripts',
      'fonts',
      'svgSprite',
      'modernizr:serve',
      'sw:serve'
    ],
    () => {
      browserSync.init({
        notify: false,
        port: 9000,
        server: {
          baseDir: ['.tmp', 'src'],
          routes: {
            '/node_modules': 'node_modules'
          }
        }
      });

      gulp.watch(['.tmp/*.html', 'src/images/**/*', '.tmp/fonts/**/*']).on('change', reload);
      gulp.watch('src/**/*.pug', gulp.series('views'));
      gulp.watch('src/styles/**/*.css', gulp.series(['styles', 'lint:css']));
      gulp.watch('src/scripts/**/*.js', gulp.series(['scripts', 'lint:js']));
      gulp.watch('src/images/**/*', gulp.series('optimize:images'));
      gulp.watch('src/fonts/**/*', gulp.series('fonts'));
    }
  )
);

// @Task `build` is used to build a production ready dist
gulp.task(
  'build',
  gulp.series(
    [
      done => {
        dev = false;
        done();
      },
      'clean:build',
      'html',
      'svgSprite',
      'fonts',
      'extras',
      'modernizr:build',
      'images',
      'sw:build'
    ],
    () => gulp.src('dist/**/*').pipe($.size({ title: 'build', gzip: true }))
  )
);
