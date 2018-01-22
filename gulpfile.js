/* eslint-disable */

'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');

gulp.task('sass', () => {
    return gulp.src('./client/src/styles/main.scss')
            .pipe(sass().on('error', sass.logError))
            .pipe(gulp.dest('./server/public/css'));
});

gulp.task('sass:watch', () => {
    gulp.watch('./client/src/styles/**/*.scss', ['sass']);
});
