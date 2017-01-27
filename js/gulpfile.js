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
	strip = require('gulp-strip-banner'),
	babel = require('gulp-babel'),
	stylelint = require('gulp-stylelint'),
	sourcemaps = require('gulp-sourcemaps');
const gulpsync = require('gulp-sync')(gulp);

// configure
const buildTarget = 'app.js';
const buildTargetMin = 'app.min.js';
const cssBuildTarget = 'app.css';
const cssBuildTargetMin = 'app.min.css';
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

const testSources = ['../tests/js/unit/**/*.js'];
const watchSources = jsSources.concat(testSources).concat(['*.js']);
const lintSources = watchSources;

// tasks
gulp.task('default', ['lint', 'csslint', 'build']);

gulp.task('build', gulpsync.sync(['buildSources', 'minifySources']));

gulp.task('buildSources', () => {
	gulp.src(cssSources)
		.pipe(strip())
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
