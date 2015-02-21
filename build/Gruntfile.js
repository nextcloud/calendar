/**
 * ownCloud - Calendar App
 *
 * @author Raghu Nayyar
 * @copyright 2014 Raghu Nayyar <beingminimal@gmail.com>
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


module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-wrap');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-phpunit');

	grunt.initConfig({

		meta: {
			pkg: grunt.file.readJSON('package.json'),
			version: '<%= meta.pkg.version %>',
			buildJS: '../js/app/',
			productionJS: '../js/public/',
			buildCSS: '../sass/',
			productionCSS: '../css/'
		},

		concat: {
			options: {
				stripBanners: true
			},
			dist: {
				src: [
					'../js/config/app.js',
					'<%= meta.buildJS %>/**/*.js'
				],
				dest: '<%= meta.productionJS %>app.js'
			}
		},

		wrap: {
			app: {
				src: ['<%= meta.productionJS %>app.js'],
				dest: '',
				wrapper: [
					'(function(angular, $, oc_requesttoken, undefined){\n\n\'use strict\';\n\n',
					'\n})(angular, jQuery, oc_requesttoken);'
				]
			}
		},

		jshint: {
			files: [
				'Gruntfile.js',
				'<%= meta.buildJS %>**/*.js',
				'../js/config/*.js',
				'../tests/js/unit/**/*.js',
				'<%= meta.productionJS %>app.js'
			],
			exclude: [
				'<%= meta.productionJS %>app.js'
			],
			options: {
				// options here to override JSHint defaults
				globals: {
					console: true,
					sub: true
				}
			}
		},

		sass: {
			dist: {
				files: {
					'<%= meta.productionCSS %>main.css': '<%= meta.buildCSS %>base.scss'
				},
				options: {
					style: 'nested',
					sourcemap: 'none'
				}
			},
		},

		watch: {
			concat: {
				files: [
					'<%= meta.buildJS %>**/*.js',
					'../js/config/*.js',
					'<%= meta.buildCSS %>**/*.scss'
				],
				tasks: ['build', 'sass']
			}
		},

		phpunit: {
			classes: {
				dir: '../tests/php/unit'
			},
			options: {
				colors: true
			}
		},

		karma: {
			unit: {
				configFile: '../tests/js/config/karma.js'
			},
			continuous: {
				configFile: '../tests/js/config/karma.js',
				singleRun: true,
				browsers: ['PhantomJS'],
				reporters: ['progress']
			}
		}

	});

	// make tasks available under simpler commands
	grunt.registerTask('build', ['jshint', 'concat', 'wrap']);

};