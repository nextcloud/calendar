//all require paths must be absolute -- use __dirname
var Agent = require('test-agent'),
    Apps = Agent.server,
    Suite = Agent.Suite,
    suite = new Suite({
      paths: [__dirname],
      testDir: 'test/',
      libDir: 'lib/ical/',
      testSuffix: '_test.js'
    });

server.use(Apps.Suite, suite);
