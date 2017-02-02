/**
 * Nextcloud - Calendar
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the COPYING file.
 *
 * @author Bernhard Posselt <dev@bernhard-posselt.com>
 * @copyright Bernhard Posselt 2012, 2014
 *
 * @author Georg Ehrke
 * @copyright 2017 Georg Ehrke <oc.list@georgehrke.com>
 */

/*jslint node: true */
'use strict';

// get plugins
const gulp = require('gulp'),
	ngAnnotate = require('gulp-ng-annotate'),
	uglify = require('gulp-uglify'),
	uglifyCSS = require('gulp-uglifycss'),
	jshint = require('gulp-jshint'),
	KarmaServer = require('karma').Server,
	concat = require('gulp-concat'),
	wrap = require('gulp-wrap'),
	strip = require('gulp-strip-comments'),
	stripCSS = require('gulp-strip-css-comments'),
	babel = require('gulp-babel'),
	stylelint = require('gulp-stylelint'),
	sourcemaps = require('gulp-sourcemaps');
const gulpsync = require('gulp-sync')(gulp);

// configure
const buildTarget = 'app.js';
const buildTargetMin = 'app.min.js';
const cssBuildTarget = 'app.css';
const cssBuildTargetMin = 'app.min.css';
const vendorTarget = 'vendor.js';
const vendorTargetMin = 'vendor.min.js';
const vendorIETarget = 'vendor.ie.js';
const vendorIETargetMin = 'vendor.ie.min.js';
const vendorCssTarget = 'vendor.css';
const vendorCssTargetMin = 'vendor.min.css';
const karmaConfig = __dirname + '/../tests/js/config/karma.js';
const destinationFolder = __dirname + '/public/';
const cssDestinationFolder = __dirname + '/../css/public/';

const jsSources = [
	'config/*.js',
	'app/**/*.js'
];
const cssSources = [
	'../css/app/*.css'
];
const vendorSources = [
	'vendor/angular/angular.js',
	'vendor/angular-bootstrap/ui-bootstrap-tpls.js',
	'vendor/fullcalendar/dist/fullcalendar.js',
	'vendor/fullcalendar/dist/locale-all.js',
	'licenses/hsl_rgb_converter.js',
	'vendor/hsl_rgb_converter/converter.js',
	'vendor/ical.js/build/ical.js',
	'vendor/jquery-timepicker/jquery.ui.timepicker.js',
	'vendor/jstzdetect/jstz.js',
];
const vendorCssSources = [
	'vendor/fullcalendar/dist/fullcalendar.css',
	'licenses/jquery.timepicker.css',
	'vendor/jquery-timepicker/jquery.ui.timepicker.css'
];

const testSources = ['../tests/js/unit/**/*.js'];
const watchSources = jsSources.concat(testSources).concat(['*.js']);
const lintSources = watchSources;

// tasks
gulp.task('default', ['lint', 'csslint', 'buildS', 'vendor']);
gulp.task('build', ['lint', 'csslint', 'buildS']);

gulp.task('buildS', gulpsync.sync(['buildSources', 'minifySources']));
gulp.task('vendor', gulpsync.sync(['buildVendor', 'minifyVendor']));

gulp.task('buildSources', () => {
	gulp.src(cssSources)
		.pipe(stripCSS({
			preserve: false
		}))
		.pipe(concat(cssBuildTarget))
		.pipe(gulp.dest(cssDestinationFolder));

	return gulp.src(jsSources)
		.pipe(babel({
			presets: ['es2015'],
			compact: false,
			babelrc: false,
			ast: false
		}))
		.pipe(ngAnnotate())
		.pipe(strip())
		.pipe(concat(buildTarget))
		.pipe(wrap(`(function(angular, $, oc_requesttoken, undefined){
	<%= contents %>
})(angular, jQuery, oc_requesttoken);`))
		.pipe(gulp.dest(destinationFolder));
});

gulp.task('minifySources', () => {
	gulp.src([cssDestinationFolder + cssBuildTarget])
		.pipe(concat(cssBuildTargetMin))
		.pipe(sourcemaps.init({identityMap: true, largeFile: true}))
		.pipe(uglifyCSS())
		.pipe(sourcemaps.write('./', {includeContent: false}))
		.pipe(gulp.dest(cssDestinationFolder));

	return gulp.src([destinationFolder + buildTarget])
		.pipe(concat(buildTargetMin))
		.pipe(sourcemaps.init({identityMap: true, largeFile: true}))
		.pipe(uglify())
		.pipe(sourcemaps.write('./', {includeContent: false}))
		.pipe(gulp.dest(destinationFolder));
});

gulp.task('buildVendor', () => {
	gulp.src(vendorCssSources)
		.pipe(concat(vendorCssTarget))
		.pipe(gulp.dest(cssDestinationFolder));

	gulp.src(['node_modules/babel-polyfill/dist/polyfill.js'].concat(vendorSources))
		.pipe(concat(vendorIETarget))
		.pipe(gulp.dest(destinationFolder));

	return gulp.src(vendorSources)
		.pipe(concat(vendorTarget))
		.pipe(gulp.dest(destinationFolder));
});

gulp.task('minifyVendor', () => {
	gulp.src([cssDestinationFolder + vendorCssTarget])
		.pipe(concat(vendorCssTargetMin))
		.pipe(sourcemaps.init({identityMap: true, largeFile: true}))
		.pipe(stripCSS({
			preserve: false
		}))
		.pipe(uglifyCSS())
		.pipe(sourcemaps.write('./', {includeContent: false}))
		.pipe(gulp.dest(cssDestinationFolder));

	gulp.src([destinationFolder + vendorIETarget])
		.pipe(concat(vendorIETargetMin))
		.pipe(sourcemaps.init({identityMap: true, largeFile: true}))
		.pipe(strip())
		.pipe(uglify())
		.pipe(sourcemaps.write('./', {includeContent: false}))
		.pipe(gulp.dest(destinationFolder));

	return gulp.src([destinationFolder + vendorTarget])
		.pipe(concat(vendorTargetMin))
		.pipe(sourcemaps.init({identityMap: true, largeFile: true}))
		.pipe(strip())
		.pipe(uglify())
		.pipe(sourcemaps.write('./', {includeContent: false}))
		.pipe(gulp.dest(destinationFolder));
});

gulp.task('lint', () => {
	return gulp.src(lintSources)
		.pipe(jshint('.jshintrc'))
		.pipe(jshint.reporter('default'))
		.pipe(jshint.reporter('fail'));
});

gulp.task('csslint', () => {
	return gulp.src(cssSources)
		.pipe(stylelint ({
			reporters: [{
				formatter: 'string',
				console: true
			}]
		}));
});

gulp.task('watch', () => {
	gulp.watch(watchSources, ['default']);
});

gulp.task('karma', (done) => {
	new KarmaServer({
		configFile: karmaConfig,
		singleRun: true,
		browsers: ['Firefox'],
		reporters: ['progress', 'coverage']
	}, done).start();
});

gulp.task('watch-karma', (done) => {
	new KarmaServer({
		configFile: karmaConfig,
		autoWatch: true,
		browsers: ['Firefox'],
		reporters: ['progress', 'coverage']
	}, done).start();
});
