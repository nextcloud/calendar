/**
 * Calendar App
 *
 * @author Raghu Nayyar
 * @author Georg Ehrke
 * @copyright 2016 Raghu Nayyar <hey@raghunayyar.com>
 * @copyright 2016 Georg Ehrke <oc.list@georgehrke.com>
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

module.exports = function (config) {
	'use strict';

	config.set({
		basePath: '../../../',
		frameworks: ['jasmine'],
		files: [
			'../../core/vendor/jquery/dist/jquery.js',
			'../../core/vendor/jquery/jquery.js',
			'../../core/vendor/moment/min/moment-with-locales.js',
			'../../core/vendor/moment/min/moment-with-locales.min.js',
			'../../core/vendor/davclient.js/lib/client.js',
			'js/node_modules/jstzdetect/dist/jstz.min.js',
			'js/node_modules/fullcalendar/dist/fullcalendar.min.js',
			'js/node_modules/angular/angular.js',
			'js/node_modules/angular-mocks/angular-mocks.js',
			'js/node_modules/ical.js/build/ical.js',
			'js/node_modules/hsl_rgb_converter/converter.js',
			'tests/js/stubs/app.js',
			'js/app/**/*.js',
			'tests/js/unit/**/*.js'
		],
		exclude: [],
		reporters: ['progress', 'coverage'],
		port: 8080,
		colors: true,
		autoWatch: false,
		browsers: ['Firefox'],
		singleRun: true,
		preprocessors: { 'js/app/**/*.js': ['coverage'] },
		coverageReporter: {
			type: 'lcov',
			dir: 'coverage/'
		}
	});
};
