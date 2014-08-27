/**
 * ownCloud - Calendar App
 *
 * @author Raghu Nayyar
 * @author Georg Ehrke
 * @copyright 2014 Raghu Nayyar <beingminimal@gmail.com>
 * @copyright 2014 Georg Ehrke <oc.list@georgehrke.com>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

 module.exports = function(config) {
	config.set({
		frameworks: ['jasmine'],
		basePath: '../../../',
		files: [
			'3rdparty/js/angular/angular.js',
			'3rdparty/js/angular/angular-route.js',
			'3rdparty/js/angular/angular-animate.js',
			'3rdparty/js/angular/angular-mocks.js',
			'3rdparty/js/restangular/restangular.js',
			'tests/js/stubs/**/*.js',
			'js/app/**/*.js',
			'tests/js/unit/**/*.js'
		],
		exclude: [],
		reporters: ['progress'],
		port: 8080,
		runnerPort: 9100,
		colors: true,
		logLevel: config.LOG_INFO,
		autoWatch: true,
		browsers: ['Chrome'],
		captureTimeout: 5000,
		singleRun: false
	});
};