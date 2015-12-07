var gulp = require('gulp')
  , babel = require('gulp-babel')

gulp.task('build', () => {
  return gulp.src('src/**/*.js')
    .pipe(babel({
      presets: ['stage-0', 'es2015']
    , plugins: ["babel-plugin-transform-runtime"]
    }))
    .pipe(gulp.dest('lib'))
})
