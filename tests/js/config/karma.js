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
   'use strict';

   config.set({
     frameworks: ['jasmine'],
     basePath: '../../../',
     files: [
  			'../../core/vendor/jquery/jquery.js',
  			//'3rdparty/ical/ical.js',
  			'../../core/vendor/moment/min/moment-with-locales.js',
  			'3rdparty/lodash/lodash.min.js',
  			'3rdparty/jstzdetect/jstz.min.js',
  			'3rdparty/fullcalendar/dist/fullcalendar.min.js',
  			'3rdparty/angular/angular.js',
  			'3rdparty/restangular/dist/restangular.js',
  			'3rdparty/angular-route/angular-route.js',
  			'3rdparty/angular-mocks/angular-mocks.js',
  			'3rdparty/angular-ui/angular-ui.js',
  			'3rdparty/angular-ui/angular-ui-calendar.js',
  			'3rdparty/angular-ui/angular-ui-sortable.js',
  			'3rdparty/angular-bootstrap-colorpicker/js/bootstrap-colorpicker-module.js',
  			'3rdparty/appframework/app.js',
  			'tests/js/stubs/app.js',
  			'js/app/**/*.js',
  			'tests/js/unit/**/*.js',
  	],

		exclude: [

		],

		reporters: ['coverage','progress'],

		port: 8080,

		colors: true,

		autoWatch: false,

		browsers: ['Firefox'],

		singleRun: false
	});
};
