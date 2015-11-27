'use strict';

module.exports = function(grunt) {

  grunt.config.set("travis", {
    branch: process.env.TRAVIS_BRANCH,
    leader: (process.env.TRAVIS_JOB_NUMBER || "").substr(-2) == ".1",
    commit: process.env.TRAVIS_COMMIT,
    pullrequest: (process.env.TRAVIS_PULL_REQUEST || "false") == "false" ? null : process.env.TRAVIS_PULL_REQUEST,
    secure: process.env.TRAVIS_SECURE_ENV_VARS == "true",
    tag: process.env.TRAVIS_TAG
  });

  function registerCITask(name, descr, cond) {
    grunt.registerTask(name, function(/* ...tasks */) {
      var task = Array.prototype.join.call(arguments, ":");
      grunt.config.requires("travis");
      var travis = grunt.config.get("travis");

      if (cond(travis, task)) {
        grunt.task.run(task);
      } else {
        grunt.log.ok('Skipping ' + task + ', not on ' + descr);
      }
    });
  }

  grunt.registerTask('run-with-env', function(/* env, ...tasks */) {
    var env = arguments[0];
    var task = Array.prototype.slice.call(arguments, 1).join(":");

    if (process.env[env]) {
      grunt.task.run(task);
    } else {
      grunt.fail.warn('Cannot run ' + task + ', environment ' + env + ' not available');
    }
  });

  registerCITask('run-on-master-leader', 'branch master leader', function(travis) {
    return travis.branch == 'master' && !travis.pullrequest &&
      travis.secure && travis.leader;
  });

  registerCITask('run-on-leader', 'build leader', function(travis) {
    return travis.leader;
  });

  registerCITask('run-on-pullrequest', 'pull request', function(travis) {
    return travis.pullrequest;
  });
};
