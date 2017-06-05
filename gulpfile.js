
const path = require('path');
const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const $ = gulpLoadPlugins();

const browserSync = require('browser-sync');
const reload = browserSync.reload;

const del = require('del');
const wiredep = require('wiredep').stream;
const filesToJson = require('gulp-files-to-json')
const scsslint = require('gulp-scss-lint');
const child_process = require('child_process');


const webpack = require('webpack');
const webpackConfig = {
  context: __dirname + "/app",
  entry: "./scripts/main.js",
  output: {
      path: __dirname + "/.tmp/scripts",
      filename: "main.js"
  },
  cache: {},
  module: {
    rules: [
      {
        test: /\.json$/,
        use: 'json-loader'
      }
    ]
  }
};

const webpackCompiler = webpack(webpackConfig);


gulp.task('scripts', (done) => {
  webpackCompiler.run(function (error, result) {
    if (error) {
      $.util.log($.util.colors.red(error));
    }
    result = result.toJson();
    if (result.errors.length) {
      result.errors.forEach(function (error) {
        $.util.log($.util.colors.red(error));
      });
    }
    done();
  });
});

gulp.task('svgmin', function(){
  gulp.src('app/icons/src/**/*.svg')
  .pipe($.svgmin({
    plugins: [
      {removeTitle: true},
      {removeDimensions: true},
      {mergePaths: true},
      {removeUselessStrokeAndFill: true}
      ]
    })
  )
  .pipe(gulp.dest('app/icons/dist'));
})

gulp.task('icons', function () {
    return gulp.src('app/icons/dist/**/*.svg')
    .pipe(filesToJson('icons.json'))
    .pipe(gulp.dest('app/scripts'));
});

gulp.task('styles', () => {
  return gulp.src('app/styles/*.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(reload({stream: true}));
});




function lint(files, options) {
  return gulp.src(files)
    .pipe(reload({stream: true, once: true}))
    .pipe($.eslint(options))
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
}

gulp.task('lint', () => {
  return lint('app/scripts/**/*.js', {
    fix: true
  })
    .pipe(gulp.dest('app/scripts'));
});

gulp.task('lint:test', () => {
  return lint('test/spec/**/*.js', {
    fix: true,
    env: {
      mocha: true
    }
  })
    .pipe(gulp.dest('test/spec/**/*.js'));
});


gulp.task('scsslint', () => {
  return gulp.src('app/styles/**/*.scss')
    .pipe(scsslint({
      'config': 'scss-lint.yml',
      'reporterOutputFormat': 'Checkstyle',
    }))
});


gulp.task('html', ['styles', 'scripts'], () => {
  return gulp.src('app/*.html')
    .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.cssnano({safe: true, autoprefixer: false})))
    .pipe($.if('*.html', $.htmlmin({collapseWhitespace: true})))
    .pipe(gulp.dest('dist'));
});

gulp.task('images', () => {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    })))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', () => {
  return gulp.src(require('main-bower-files')('**/*.{eot,svg,ttf,woff,woff2}', function (err) {})
    .concat('app/fonts/**/*'))
    .pipe(gulp.dest('.tmp/fonts'))
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('extras', () => {
  return gulp.src([
    '.tmp/**/*.js',
    '.tmp/**/*.css',
    'app/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('serve', ['styles', 'icons', 'scripts', 'fonts'], () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['.tmp', 'app'],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  function webpackCache(e) {
    var keys = Object.keys(webpackConfig.cache);
    var key, matchedKey;
    for (var keyIndex = 0; keyIndex < keys.length; keyIndex++) {
      key = keys[keyIndex];
      if (key.indexOf(e.path) !== -1) {
        matchedKey = key;
        break;
      }
    }
    if (matchedKey) {
      delete webpackConfig.cache[matchedKey];
    }
  }

  gulp.task('scripts:watch', ['scripts'], reload);
  gulp.watch('app/scripts/**/*.js', ['scripts:watch']).on('change', webpackCache);


  gulp.watch([
    'app/*.html',
    'app/images/**/*',
    '.tmp/fonts/**/*'
  ]).on('change', reload);

  gulp.watch('app/styles/**/*.scss', ['styles']);
  gulp.watch('app/icons/dist/**/*', ['icons', 'scripts']);
  gulp.watch('app/icons/src/**/*', ['svgmin']);
  gulp.watch('app/scripts/**/*.js', ['scripts']);
  gulp.watch('app/fonts/**/*', ['fonts']);
  gulp.watch('bower.json', ['wiredep', 'fonts']);
});

gulp.task('serve:electron', ['build'], () => {
  var  questions = [{
       type: 'list',
       name: 'example',
       message: 'Choose an example:',
       choices: [ 'components', 'tree', 'ftp' ],
    }
  ];

  gulp.src('examples')
    .pipe(
      $.prompt.prompt(questions, function(res){
        child_process.exec(`electron examples/${res.example}`)
          .stdout.on('data', (data) => {})
        process.exit(1);
      })
    )
});

gulp.task('serve:dist', () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['dist','.tmp']
    }
  });
});

gulp.task('serve:test', ['scripts'], () => {
  browserSync({
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

  gulp.watch('app/scripts/**/*.js', ['scripts']);
  gulp.watch('test/spec/**/*.js').on('change', reload);
  gulp.watch('test/spec/**/*.js', ['lint:test']);
});

// inject bower components
gulp.task('wiredep', () => {
  gulp.src('app/styles/*.scss')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)+/
    }))
    .pipe(gulp.dest('app/styles'));

  gulp.src('app/*.html')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app'));
});

gulp.task('build', ['lint', 'html', 'images', 'fonts', 'extras'], () => {
  return gulp.src(['dist/**/*']).pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], () => {
  gulp.start('build');
});
