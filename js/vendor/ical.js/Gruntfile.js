'use strict';

var path = require('path');

module.exports = function(grunt) {
  var pkg = grunt.file.readJSON('package.json');
  grunt.initConfig({
    pkg: pkg,
    libinfo: {
      cwd: 'lib/ical',
      doc: 'api',
      files: [
        'helpers.js', 'design.js', 'stringify.js', 'parse.js', 'component.js',
        'property.js', 'utc_offset.js', 'binary.js', 'period.js', 'duration.js',
        'timezone.js', 'timezone_service.js', 'time.js', 'vcard_time.js',
        'recur.js', 'recur_iterator.js', 'recur_expansion.js', 'event.js',
        'component_parser.js'
      ],
      test: {
        head: ['test/helper.js'],
        unit: ['test/*_test.js'],
        acceptance: ['test/acceptance/*_test.js'],
        performance: ['test/performance/*_test.js']
      }
    },

    concat: {
      options: {
        separator: '',
        process: function(src, filepath) {
          return src.replace('"use strict";', '');
        }
      },

      dist: {
        src: ['<%= libinfo.absfiles %>'],
        dest: 'build/ical.js'
      }
    },

    mocha_istanbul: {
      coverage: {
        src: ['<%= libinfo.test.unit %>', '<%= libinfo.test.acceptance %>'],
        options: {
          root: './lib/ical/',
          require: ['<%= libinfo.test.head %>'],
          reporter: 'dot',
          ui: 'tdd'
        }
      }
    },

    coveralls: {
      options: {
        force: true
      },
      unit: {
        src: './coverage/lcov.info'
      }
    },

    'node-inspector': {
      test: {
        hidden: ['node_modules']
      }
    },

    concurrent: {
      all: ['mochacli', 'node-inspector'],
      unit: ['mochacli:unit', 'node-inspector'],
      acceptance: ['mochacli:acceptance', 'node-inspector'],
      single: ['mochacli:single', 'node-inspector'],
    },

    mochacli: {
      options: {
        ui: 'tdd',
        require: ['<%= libinfo.test.head %>'],
        'debug-brk': grunt.option('debug'),
        reporter: grunt.option('reporter') || 'spec'
      },
      performance: {
        src: ['<%= libinfo.test.performance %>']
      },
      acceptance: {
        src: ['<%= libinfo.test.acceptance %>']
      },
      unit: {
        src: ['<%= libinfo.test.unit %>']
      },
      single: {
        src: [grunt.option('test')]
      }
    },

    karma: {
      options: {
        singleRun: true,
        hostname: grunt.option('remote') ? '0.0.0.0' : 'localhost',
        port: 9876,
        colors: true,
        basePath: '',
        logLevel: grunt.option('verbose') ? 'DEBUG' : 'INFO',
        autoWatch: false,
        captureTimeout: 240000,
        browserNoActivityTimeout: 120000,
        frameworks: ['mocha', 'chai'],
        client: {
          mocha: {
            ui: 'tdd'
          }
        },
        files: [
          { pattern: 'samples/**/*.ics', included: false },
          { pattern: 'test/parser/*', included: false },
          '<%= libinfo.relfiles %>',
          '<%= libinfo.test.head %>'
        ]
      },
      ci: {
        exitOnFailure: false,
        customLaunchers: pkg.saucelabs,
        browsers: Object.keys(pkg.saucelabs),
        reporters: ['saucelabs', 'spec'],
        sauceLabs: {
          testName: 'ICAL.js',
          startConnect: true
        },

        files: {
          src: ['<%= libinfo.test.unit %>']
        }
      },
      single: {
        singleRun: !grunt.option('debug'),
        reporters: ['spec'],
        files: {
          src: [grunt.option('test')]
        }
      },
      unit: {
        singleRun: !grunt.option('debug'),
        reporters: ['spec'],
        files: {
          src: ['<%= libinfo.test.unit %>']
        }
      },
      acceptance: {
        singleRun: !grunt.option('debug'),
        reporters: ['spec'],
        files: {
          src: ['<%= libinfo.test.acceptance %>']
        }
      },
    },

    jshint: {
      options: {
        "globalstrict": true,
        "eqeqeq": false,
        "-W041": false,
        "strict": false,
        "proto": true,
        "shadow": true
      },
      lib: {
        options: {
          predef: ['ICAL']
        },
        src: ['<%= libinfo.absfiles %>']
      },
      ICALTester: {
        src: ['tools/ICALTester/**/*.js']
      }
    },
    gjslint: {
      options: {
        flags: ['--flagfile .gjslintrc'],
        reporter: {
          name: 'console'
        }
      },
      lib: {
        src: ['<%= libinfo.absfiles %>']
      },
      ICALTester: {
        src: ['tools/ICALTester/**/*.js']
      }
    },
    uglify: {
      options: {
        sourceMap: true,
        preserveComments: false,
        screwIE8: true,
        compress: {},
        mangle: {
          except: ['ICAL']
        }
      },
      dist: {
        files: {
          'build/ical.min.js': ['build/ical.js']
        }
      }
    },
    release: {
      options: {
        tagName: 'v<%=version%>',
        tagMessage: 'v<%=version%>',
        additionalFiles: ['bower.json'],
        github: {
          repo: 'mozilla-comm/ical.js',
          accessTokenVar: 'GITHUB_TOKEN'
        }
      }
    },
    jsdoc: {
      dist: {
        src: ['<%= libinfo.absfiles %>', 'README.md'],
        options: {
          destination: '<%= libinfo.doc %>',
          template: './node_modules/minami/',
          private: false
        }
      }
    },

    'gh-pages': {
      options: {
        clone: 'jsdoc-stage',
        only: '<%= libinfo.doc %>',
        user: {
          name: 'Travis CI',
          email: 'builds@travis-ci.org',
        },
        repo: 'git@github.com:mozilla-comm/ical.js.git',
        message: 'Update API Documentation for <%= travis.commit %>'
      },
      src: '<%= libinfo.doc %>/**'
    }
  });

  grunt.config.set('libinfo.absfiles', grunt.config.get('libinfo.files').map(function(f) {
    return path.join(grunt.config.get('libinfo.cwd'), f);
  }));
  grunt.config.set('libinfo.relfiles', grunt.config.get('libinfo.files').map(function(f) {
    return path.join("lib", "ical", f);
  }));

  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-coveralls');
  grunt.loadNpmTasks('grunt-gjslint');
  grunt.loadNpmTasks('grunt-gh-pages');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-mocha-cli');
  grunt.loadNpmTasks('grunt-mocha-istanbul');
  grunt.loadNpmTasks('grunt-node-inspector');
  grunt.loadNpmTasks('grunt-release');

  grunt.loadTasks('tasks');

  grunt.registerTask('default', ['package']);
  grunt.registerTask('package', ['concat', 'uglify']);
  grunt.registerTask('coverage', 'mocha_istanbul');
  grunt.registerTask('linters', ['jshint', 'gjslint', 'check-browser-build']);
  grunt.registerTask('test-server', ['test-agent-config', 'run-test-server']);
  grunt.registerTask('test', ['test-browser', 'test-node']);

  grunt.registerTask('doc-ci', ['jsdoc', 'run-on-master-leader:run-with-env:GITHUB_SSH_KEY:gh-pages']);
  grunt.registerTask('unit-ci', ['test-node:unit', 'test-node:acceptance', 'run-on-master-leader:karma:ci']);
  grunt.registerTask('coverage-ci', ['coverage', 'coveralls']);
  grunt.registerTask('test-ci', ['check-browser-build', 'linters', 'unit-ci', 'coverage-ci', 'doc-ci']);

  // Additional tasks:
  //   - tests.js: performance-update, test-node, test-browser,
  //   - timezones.js: timezones
};
