'use strict';

var path = require('path');
var Agent = require('test-agent'),
    AgentServer = Agent.server,
    WebsocketServer = Agent.WebsocketServer,
    StaticServer = require('node-static').Server;

module.exports = function(grunt) {

  grunt.registerTask('check-browser-build', function(task) {
    if (!task) {
      grunt.task.run('package', 'check-browser-build:verify');
      return;
    }

    var done = this.async();
    grunt.util.spawn({
      cmd: 'git',
      args: ['diff', '--shortstat', 'build/ical.js', 'build/ical.min.js', 'build/ical.min.js.map'],
    }, function(error, result, code) {
      if (result.stdout.length) {
        grunt.fail.fatal('Browser build is not up to date, please run `grunt package`');
      } else {
        grunt.log.ok('Browser build is up to date, good job!');
      }
      done();
    });
  });

  grunt.registerTask('performance-update', function(version) {
    function copyMaster(callback) {
      grunt.util.spawn({
        cmd: 'git',
        args: ['show', 'master:build/ical.js']
      }, function(error, result, code) {
        grunt.file.write(filepath, header + result.stdout + footer);
        callback();
      });
    }

    var filepath = 'build/benchmark/ical_' + version + '.js';
    var header = "var ICAL_" + version + " = (function() { var ICAL = {};\n" +
                 "if (typeof global !== 'undefined') global.ICAL_" + version + " = ICAL;\n";
    var footer = "\nreturn ICAL; }());";

    if (!version) {
      grunt.fail.fatal('Need to specify build version name or "upstream" as parameter');
    } else if (version == "upstream") {
      var done = this.async();
      grunt.util.spawn({
        cmd: 'git',
        args: ['diff', '--shortstat'],
      }, function(error, result, code) {
        if (result.stdout.length) {
          grunt.log.ok('There are git changes, also comparing against master branch');
          copyMaster(done);
        } else {
          grunt.util.spawn({
            cmd: 'git',
            args: ['symbolic-ref', 'HEAD']
          }, function(error, result, code) {
            var branch = result.stdout.replace('refs/heads/', '');
            if (branch == 'master') {
              grunt.log.ok('No git changes, not comparing against master branch');
              grunt.file.delete(filepath);
              done();
            } else {
              grunt.log.ok('Not on master, also comparing against master branch');
              copyMaster(done);
            }
          });
        }
      });
    } else {
      grunt.file.copy('build/ical.js', filepath, {
        process: function(contents) {
          return header + contents + footer;
        }
      });
      grunt.log.ok('Successfully created ' + filepath);
    }
  });

  grunt.registerTask('test-node', 'internal', function(arg) {
    if (!arg || arg == 'performance') {
      grunt.task.run('performance-update:upstream');
    }
    if (grunt.option('debug')) {
      var done = this.async();
      var open = require('biased-opener');
      open('http://127.0.0.1:8080/debug?port=5858', {
          preferredBrowsers : ['chrome', 'chromium', 'opera']
        }, function(err, okMsg) {
          if (err) {
             // unable to launch one of preferred browsers for some reason
             console.log(err.message);
             console.log('Please open the URL manually in Chrome/Chromium/Opera or similar browser');
          }
          done();
      });
      grunt.task.run('concurrent:' + (arg || "all"));
    } else {
      grunt.task.run('mochacli' + (arg ? ":" + arg : ""));
    }
  });

  grunt.registerTask('test-browser', 'Test browser agent', function() {
    var done = this.async();
    var Client = require('test-agent/lib/node/client');

    var client = new Client({ retry: true });
    var port = grunt.option('port') || 8789;
    var reporter = grunt.config.get('mochacli.options.reporter') || 'spec';
    console.log("REPORTER: " + reporter);
    client.url = 'ws://localhost:' + port;
    client.use(AgentServer.MochaTestEvents, {
      reporterClass: require('mocha').reporters[reporter]
    });

    client.on('open', function(socket) {
      var file = grunt.option('test');
      var files = file ? [file] : [];
      client.mirrorServerEvents(['set test envs', 'error', 'test data', 'coverage data'], true);
      client.send('queue tests', {files: files});
    });

    client.on('test runner end', function(runner){
      var reporter = runner.getMochaReporter();
      client.send('close');
      done(reporter.failures == 0);
    });

    client.start();
  });

  grunt.registerTask('run-test-server', 'Start browser test server', function() {
    var done = this.async();

    var server = new WebsocketServer();
    var path = process.env.PWD;
    var port = grunt.option('port') || 8789;

    var staticMiddleware = new StaticServer(path, { cache: 0 });
    var httpServer = require('http').createServer(function (request, response) {
      staticMiddleware.serve(request, response);
    });
    httpServer.listen(port);
    grunt.log.ok("HTTP Server running on port: %s, serving: %s", port, path);
    server.attach(httpServer);

    server.expose('test-agent-server.js', function onExpose(){
      server.use(AgentServer.Responder)
            .use(AgentServer.Broadcast)
            .use(AgentServer.MochaTestEvents)
            .use(AgentServer.BlanketConsoleReporter, {
               path: 'test-agent-coverage.json',
               pattern: /([\S]+)/
             })
            .use(AgentServer.QueueTests)
            .use(AgentServer.StartCoverages)
            .use(AgentServer.EventMirror)
            .use(AgentServer.Watcher)
            .use(AgentServer.RunnerGrowl);
    });
    require('open')('http://localhost:' + port + '/test-agent/');
  });

  grunt.registerTask('test-agent-config', 'Create configuration for test-agent', function() {
    var files = grunt.file.expand('test/**/*_test.js');
    var jsonData = {
      tests: files.map(function(f) { return "/" + f; })
    };
    grunt.file.write(path.join('test-agent', 'config.json'),
                     JSON.stringify(jsonData));
  });
};
