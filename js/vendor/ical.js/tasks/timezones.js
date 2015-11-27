'use strict';

var util = require('util');
var exec = require('sync-exec');
var path = require('path');

var OLSON_DB_REMOTE = 'http://www.iana.org/time-zones/repository/releases/tzdata%s.tar.gz';
var TZURL_DIR = process.env.TZURL_DIR || path.join(__dirname, '..', 'tools', 'tzurl')
var OLSON_DIR = process.env.OLSON_DIR || path.join(TZURL_DIR, 'olson');

module.exports = function(grunt) {
  grunt.registerTask('timezones', 'Get Olson timezone data', function() {
    var olsonversion = grunt.option('olsondb');
    if (!olsonversion) {
      olsonversion = (new Date()).getFullYear() + "a";
      grunt.fail.warn('Need to specify --olsondb=<version>, e.g. ' + olsonversion);
      return;
    }

    if (grunt.file.isDir(TZURL_DIR)) {
      grunt.log.ok('Using existing tzurl installation');
    } else {
      grunt.log.ok('Retrieving tzurl from svn');
      exec('svn export -r40 http://tzurl.googlecode.com/svn/trunk/ ' + TZURL_DIR);
    }

    if (grunt.file.isDir(OLSON_DIR)) {
      grunt.log.ok('Using olson database from ' + OLSON_DIR);
    } else {
      var url = util.format(OLSON_DB_REMOTE, olsonversion);
      grunt.log.ok('Downloading ' + url);
      grunt.file.mkdir(OLSON_DIR);
      exec('wget ' + url + ' -O - | tar xz -C ' + OLSON_DIR);
    }

    grunt.log.ok('Building tzurl tool');
    exec('make -C "' + TZURL_DIR + '" OLSON_DIR="' + OLSON_DIR + '"');

    grunt.log.ok('Running vzic');
    exec(path.join(TZURL_DIR, 'vzic'));
  });
};
