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
	insert = require('gulp-insert'),
	wrap = require('gulp-wrap'),
	strip = require('gulp-strip-comments'),
	stripCSS = require('gulp-strip-css-comments'),
	babel = require('gulp-babel'),
	stylelint = require('gulp-stylelint'),
	sourcemaps = require('gulp-sourcemaps'),
	fs = require('fs');
const gulpsync = require('gulp-sync')(gulp);
const timezones = fs.readFileSync('./timezones/zones.json', 'UTF-8');

// configure
const buildTarget = 'app.js';
const buildTargetMin = 'app.min.js';
const cssBuildTarget = 'app.scss';
const cssBuildTargetMin = 'app.min.scss';
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
	'../css/app/*.scss'
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
	'vendor/jstzdetect/dist/jstz.js',
];
const vendorCssSources = [
	'vendor/fullcalendar/dist/fullcalendar.css',
	'vendor/angular/angular-csp.css',
	'licenses/jquery.timepicker.css',
	'vendor/jquery-timepicker/jquery.ui.timepicker.css'
];

const testSources = ['../tests/js/unit/**/*.js'];
const lintJsSources = jsSources.concat(testSources).concat(['*.js']);
const watchSources = lintJsSources.concat(cssSources);

// tasks
gulp.task('lint', ['jslint', 'csslint']);
gulp.task('default', ['lint', '_buildSource', '_buildVendor']);
gulp.task('build', ['lint', '_buildSource']);

gulp.task('_buildAndMinifyCSSSources', gulpsync.sync(['_buildCSSSources', '_minifyCSSSources']));
gulp.task('_buildAndMinifyJavaScriptSources', gulpsync.sync(['_buildJavaScriptSources', '_minifyJavaScriptSources']));
gulp.task('_buildAndMinifyCSSVendor', gulpsync.sync(['_buildCSSVendor', '_minifyCSSVendor']));
gulp.task('_buildAndMinifyJavaScriptVendor', gulpsync.sync(['_buildJavaScriptVendor', '_minifyJavaScriptVendor']));
gulp.task('_buildAndMinifyIEJavaScriptVendor', gulpsync.sync(['_buildIEJavaScriptVendor', '_minifyIEJavaScriptVendor']));

gulp.task('_buildSource', ['_buildAndMinifyCSSSources', '_buildAndMinifyJavaScriptSources']);
gulp.task('_buildVendor', ['_buildAndMinifyCSSVendor', '_buildAndMinifyJavaScriptVendor', '_buildAndMinifyIEJavaScriptVendor']);

// #############################################################################
// ################################ SOURCE CSS #################################
// #############################################################################
gulp.task('_buildCSSSources', () => {
	return gulp.src(cssSources)
		.pipe(stripCSS({
			preserve: false
		}))
		.pipe(concat(cssBuildTarget))
		.pipe(gulp.dest(cssDestinationFolder));
});

gulp.task('_minifyCSSSources', () => {
	return gulp.src(cssDestinationFolder + cssBuildTarget)
		.pipe(sourcemaps.init({identityMap: true, largeFile: true}))
		.pipe(concat(cssBuildTargetMin))
		.pipe(uglifyCSS())
		.pipe(sourcemaps.write('./', {includeContent: false}))
		.pipe(gulp.dest(cssDestinationFolder));
});

// #############################################################################
// ################################ SOURCE JS ##################################
// #############################################################################
gulp.task('_buildJavaScriptSources', () => {
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
		.pipe(insert.append('\napp.service(\'TimezoneDataProvider\', function () { return '))
		.pipe(insert.append(timezones))
		.pipe(insert.append(';});'))
		.pipe(wrap(`(function(angular, $, oc_requesttoken, undefined){
	<%= contents %>
})(angular, jQuery, oc_requesttoken);`))
		.pipe(gulp.dest(destinationFolder));
});

gulp.task('_minifyJavaScriptSources', () => {
	return gulp.src(destinationFolder + buildTarget)
		.pipe(sourcemaps.init({identityMap: true, largeFile: true}))
		.pipe(concat(buildTargetMin))
		.pipe(uglify())
		.pipe(sourcemaps.write('./', {includeContent: false}))
		.pipe(gulp.dest(destinationFolder));
});

// #############################################################################
// ################################ VENDOR CSS #################################
// #############################################################################
gulp.task('_buildCSSVendor', () => {
	return gulp.src(vendorCssSources)
		.pipe(concat(vendorCssTarget))
		.pipe(gulp.dest(cssDestinationFolder));
});

gulp.task('_minifyCSSVendor', () => {
	return gulp.src([cssDestinationFolder + vendorCssTarget])
		.pipe(sourcemaps.init({identityMap: true, largeFile: true}))
		.pipe(concat(vendorCssTargetMin))
		.pipe(stripCSS({
			preserve: false
		}))
		.pipe(uglifyCSS())
		.pipe(sourcemaps.write('./', {includeContent: false}))
		.pipe(gulp.dest(cssDestinationFolder));
});

// #############################################################################
// ################################# VENDOR JS #################################
// #############################################################################
gulp.task('_buildJavaScriptVendor', () => {
	return gulp.src(vendorSources)
		.pipe(concat(vendorTarget))
		.pipe(gulp.dest(destinationFolder));
});

gulp.task('_minifyJavaScriptVendor', () => {
	return gulp.src([destinationFolder + vendorTarget])
		.pipe(sourcemaps.init({identityMap: true, largeFile: true}))
		.pipe(concat(vendorTargetMin))
		.pipe(strip())
		.pipe(uglify())
		.pipe(sourcemaps.write('./', {includeContent: false}))
		.pipe(gulp.dest(destinationFolder));
});

// #############################################################################
// ############################### VENDOR IE JS ################################
// #############################################################################
gulp.task('_buildIEJavaScriptVendor', () => {
	return gulp.src(['node_modules/babel-polyfill/dist/polyfill.js'].concat(vendorSources))
		.pipe(concat(vendorIETarget))
		.pipe(gulp.dest(destinationFolder));
});

gulp.task('_minifyIEJavaScriptVendor', () => {
	return gulp.src([destinationFolder + vendorIETarget])
		.pipe(sourcemaps.init({identityMap: true, largeFile: true}))
		.pipe(concat(vendorIETargetMin))
		.pipe(strip())
		.pipe(uglify())
		.pipe(sourcemaps.write('./', {includeContent: false}))
		.pipe(gulp.dest(destinationFolder));
});

gulp.task('jslint', () => {
	return gulp.src(lintJsSources)
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
	gulp.watch(watchSources, ['_buildSource']);
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
