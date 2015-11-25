var gulp = require('gulp')
  , babel = require('gulp-babel')

gulp.task('build', () => {
  return gulp.src('src/**/*.js')
    .pipe(babel({
      presets: ['stage-0']
    }))
    .pipe(gulp.dest('lib'))
})
