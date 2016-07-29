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
	'use strict';

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-wrap');
	grunt.loadNpmTasks('grunt-ng-annotate');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-phpunit');
	grunt.loadNpmTasks('grunt-babel');
	grunt.loadNpmTasks('grunt-postcss');

	grunt.initConfig({

		meta: {
			pkg: grunt.file.readJSON('package.json'),
			version: '<%= meta.pkg.version %>',
			configJS: 'config/',
			buildJS: 'app/',
			productionJS: 'public/',
			testsJS: '../tests/js/',
			buildCSS: '../css/'
		},

		concat: {
			options: {
				stripBanners: true
			},
			dist: {
				src: [
					'<%= meta.configJS %>*.js',
					'<%= meta.buildJS %>/**/*.js'
				],
				dest: '<%= meta.productionJS %>app.js'
			}
		},

		wrap: {
			app: {
				src: ['<%= meta.productionJS %>app.js'],
				dest: '<%= meta.productionJS %>app.js',
				option: {
					wrapper: [
						'(function(angular, $, oc_requesttoken, undefined){\n\n\'use strict\';\n\n',
						'\n})(angular, jQuery, oc_requesttoken);'
					]
				}
			}
		},

		jshint: {
			files: [
				'Gruntfile.js',
				'<%= meta.configJS %>*.js',
				'<%= meta.buildJS %>**/*.js',
				'<%= meta.testsJS %>**/*.js'
			],
			options: {
				jshintrc: '.jshintrc',
				reporter: require('jshint-stylish')
			}
		},

		watch: {
			concat: {
				files: [
					'<%= meta.buildJS %>**/*.js',
					'<%= meta.configJS %>*.js',
					'<%= meta.buildCSS %>*.css'
				],
				options: {
					livereload: true
				},
				tasks: ['build']
			}
		},

		phpunit: {
			classes: {
				dir: '../tests/unit'
			},
			options: {
				bootstrap: '../tests/bootstrap.php',
				colors: true
			}
		},

		karma: {
			unit: {
				configFile: '<%= meta.testsJS %>config/karma.js',
				browsers: ['Firefox'],
				singleRun: true,
				reporters: ['progress', 'coverage']
			}
		},

		ngAnnotate: {
			app: {
				src: ['<%= meta.productionJS %>app.js'],
				dest: '<%= meta.productionJS %>app.js'
			}
		},

		babel: {
			options: {
				presets: ['es2015'],
				compact: false,
				babelrc: false,
				ast: false
			},
			dist: {
				files: {
					'<%= meta.productionJS %>app.js': '<%= meta.productionJS %>app.js'
				}
			}
		},
		postcss: {
			lint: {
				options: {
					map: false,
					processors: [
						require('stylelint')()
					]
				},
				src: [ "../css/*.css" ]
			}
		}

	});

	// make tasks available under simpler commands
	grunt.registerTask('build', ['jshint', 'postcss', 'concat', 'babel', 'wrap', 'ngAnnotate']);
	grunt.registerTask('js-unit', ['karma']);

};
