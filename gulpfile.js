// Configurable paths
var config = {
  src: 'src',
  dist: 'dist'
};
const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync').create();
const del = require('del');
const runSequence = require('run-sequence');
const svgSprite = require('gulp-svg-sprite');
const babel = require('babelify');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const revAll = require('gulp-rev-all');
const gulpStylelint = require('gulp-stylelint');
const workbox = require('workbox-build');

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

var dev = true;
gulp.task('styles', () => {
  return gulp
    .src('./src/styles/*.css')
    .pipe(sourcemaps.init())
    .pipe($.plumber())
    .pipe($.postcss())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(reload({ stream: true }));
});

gulp.task('scripts', () => {
  const bundler = browserify('src/scripts/main.js', { debug: dev }).transform(babel);
  return bundler
    .bundle()
    .on('error', function(err) {
      console.error(err);
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

gulp.task('lint:js', () => {
  return lint('src/scripts/**/*.js').pipe(gulp.dest('src/scripts'));
});

gulp.task('lint:test', () => {
  return lint('test/spec/**/*.js').pipe(gulp.dest('test/spec'));
});

gulp.task('views', () => {
  return gulp
    .src('src/*.pug')
    .pipe($.plumber())
    .pipe(
      $.data(function(file) {
        return { require: require };
      })
    )
    .pipe($.pug({ pretty: true }))
    .pipe(gulp.dest('.tmp'))
    .pipe(reload({ stream: true }));
});

gulp.task('html', ['lint:css', 'lint:js', 'views', 'styles', 'scripts'], () => {
  return gulp
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
    .pipe(gulp.dest('dist'));
});

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

gulp.task('fonts', () => {
  return gulp
    .src('src/fonts/**/*')
    .pipe($.if(dev, gulp.dest('.tmp/fonts'), gulp.dest('dist/fonts')));
});

function modernizerTask(dest) {
  return () => {
    gulp
      .src([`${dest}/scripts/{,*/}*.js`, `${dest}/styles/{,*/}*.css`, `!${dest}/scripts/vendor/*`])
      .pipe($.modernizr())
      .pipe($.uglify())
      .pipe(gulp.dest(`${dest}/scripts/vendor/`));
  };
}

gulp.task('modernizr:serve', modernizerTask('.tmp'));

gulp.task('modernizr:build', modernizerTask('dist'));

gulp.task('rev', () => {
  gulp
    .src('dist/**/*.{js,css}')
    .pipe(revAll.revision({ debug: true }))
    .pipe(gulp.dest('dist/'))
    .pipe(revAll.versionFile())
    .pipe(gulp.dest('dist/'))
    .pipe(revAll.manifestFile())
    .pipe(gulp.dest('dist'));
});

gulp.task('extras', () => {
  return gulp
    .src(['src/*', '!src/*.html', '!src/*.pug', '!src/includes'], {
      dot: true
    })
    .pipe(gulp.dest('dist'));
});

gulp.task('lint:css', function lintCssTask() {
  return gulp.src('src/styles/**/*.css').pipe(
    gulpStylelint({
      reporters: [{ formatter: 'string', console: true }]
    })
  );
});

//Pre-caching
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

gulp.task('sw:build', () => {
  return generateSW('dist')
    .then(({ warnings }) => {
      // In case there are any warnings from workbox-build, log them.
      for (const warning of warnings) {
        console.warn(warning);
      }
      console.info('Service worker generation completed.');
    })
    .catch(error => {
      console.warn('Service worker generation failed:', error);
    });
});

gulp.task('sw:serve', () => {
  return generateSW('.tmp')
    .then(({ warnings }) => {
      // In case there are any warnings from workbox-build, log them.
      for (const warning of warnings) {
        console.warn(warning);
      }
      console.info('Service worker generation completed.');
    })
    .catch(error => {
      console.warn('Service worker generation failed:', error);
    });
});

// I dont need to clean dist as the clean task is called on serve only
gulp.task('clean:build', del.bind(null, ['dist']));
gulp.task('clean:serve', del.bind(null, ['.tmp']));

// @Task is used to optimize images in src directory
gulp.task('optimize:images', () => {
  return gulp
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
    .pipe(gulp.dest('dist/images'));
});

gulp.task('images', () => {
  return gulp
    .src('src/images/**/*')
    .pipe($.if(dev, gulp.dest('.tmp/images'), gulp.dest('dist/images')));
});

// @Task unused one
gulp.task('serve:dist', ['default'], () => {
  browserSync.init({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['dist']
    }
  });
});

// @Task unused one
gulp.task('serve:test', ['scripts'], () => {
  browserSync.init({
    notify: false,
    port: 9000,
    ui: false,
    server: {
      baseDir: 'test',
      routes: {
        '/scripts': '.tmp/scripts',
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch('src/scripts/**/*.js', ['scripts']);
  gulp.watch(['test/spec/**/*.js', 'test/index.html']).on('change', reload);
  gulp.watch('test/spec/**/*.js', ['lint:test']);
});

// @Task `serve` is used to serve the content in dev mode
gulp.task('serve', () => {
  runSequence(
    ['clean:serve'],
    ['lint:js', 'lint:css'],
    ['views', 'styles', 'scripts', 'fonts', 'svgSprite'],
    ['modernizr:serve'],
    ['sw:serve'],
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
      gulp.watch('src/**/*.pug', ['views']);
      gulp.watch('src/styles/**/*.css', ['styles', 'lint:css']);
      gulp.watch('src/scripts/**/*.js', ['scripts', 'lint:js']);
      gulp.watch('src/images/**/*', ['optimize:images']);
      gulp.watch('src/fonts/**/*', ['fonts']);
      gulp.watch('bower.json', ['fonts']);
    }
  );
});

// @Task `build` is used to build a production ready dist
gulp.task('build', () => {
  dev = false;
  runSequence(
    ['clean:build'],
    ['html', 'svgSprite', 'fonts', 'extras'],
    ['rev', 'modernizr:build', 'images'],
    ['sw:build'],
    () => {
      return gulp.src('dist/**/*').pipe($.size({ title: 'build', gzip: true }));
    }
  );
});

// @Task Default task to run when you run `gulp` with no arguments
gulp.task('default', () => {
  return new Promise(resolve => {
    runSequence('serve', resolve);
  });
});
