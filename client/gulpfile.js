/* eslint-disable */

'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');

gulp.task('sass', () => {
    return gulp.src('./styles/main.scss')
            .pipe(sass().on('error', sass.logError))
            .pipe(gulp.dest('./app/public/css'));
});

gulp.task('sass:watch', () => {
    gulp.watch('./styles/**/*.scss', ['sass']);
});
