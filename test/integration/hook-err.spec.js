'use strict';

var runMocha = require('./helpers').runMocha;
var splitRegExp = require('./helpers').splitRegExp;
var bang = require('../../lib/reporters/base').symbols.bang;

describe('hook error handling', function() {
  var lines;

  describe('before hook error', function() {
    before(run('hooks/before-hook-error.fixture.js'));
    it('should verify results', function() {
      expect(lines, 'to equal', ['before', bang + 'test 3']);
    });
  });

  describe('before hook error tip', function() {
    before(run('hooks/before-hook-error-tip.fixture.js', onlyErrorTitle()));
    it('should verify results', function() {
      expect(lines, 'to equal', [
        '1) spec 2',
        '"before all" hook for "skipped":'
      ]);
    });
  });

  describe('nested before hook error', function() {
    before(run('hooks/before-nested-hook-error.fixture.js', onlyErrorTitle()));
    it('should verify results', function() {
      expect(lines, 'to equal', [
        '1) spec 1',
        'nested 1',
        '"before all" hook for "blames me":'
      ]);
    });
  });

  describe('before each hook error', function() {
    before(run('hooks/beforeEach-hook-error.fixture.js'));
    it('should verify results', function() {
      expect(lines, 'to equal', ['before', bang + 'test 3']);
    });
  });

  describe('after hook error', function() {
    before(run('hooks/after-hook-error.fixture.js'));
    it('should verify results', function() {
      expect(lines, 'to equal', ['test 1', 'test 2', 'after', bang + 'test 3']);
    });
  });

  describe('nested after hook error', function() {
    before(run('hooks/after-nested-hook-error.fixture.js', onlyErrorTitle()));
    it('should verify results', function() {
      expect(lines, 'to equal', [
        '1) spec 1',
        'nested 1',
        '"after all" hook for "blames me":'
      ]);
    });
  });

  describe('after each hook error', function() {
    before(run('hooks/afterEach-hook-error.fixture.js'));
    it('should verify results', function() {
      expect(lines, 'to equal', ['test 1', 'after', bang + 'test 3']);
    });
  });

  describe('multiple hook errors', function() {
    before(run('hooks/multiple-hook-error.fixture.js'));
    it('should verify results', function() {
      expect(lines, 'to equal', [
        'root before',
        '1-1 before',
        'root before each',
        '1 before each',
        '1-1 before each',
        bang + '1-1 after each',
        '1 after each',
        'root after each',
        '1-1 after',
        bang + '1-2 before',
        'root before each',
        '1 before each',
        '1-2 before each',
        '1-2 test 1',
        '1-2 after each',
        bang + '1 after each',
        'root after each',
        '1-2 after',
        '1 after',
        '2-1 before',
        'root before each',
        '2 before each',
        bang + '2 after each',
        bang + 'root after each',
        '2-1 after',
        '2 after',
        'root after'
      ]);
    });
  });

  describe('async - before hook error', function() {
    before(run('hooks/before-hook-async-error.fixture.js'));
    it('should verify results', function() {
      expect(lines, 'to equal', ['before', bang + 'test 3']);
    });
  });

  describe('async - before hook error tip', function() {
    before(
      run('hooks/before-hook-async-error-tip.fixture.js', onlyErrorTitle())
    );
    it('should verify results', function() {
      expect(lines, 'to equal', ['1) spec 2', '"before all" hook:']);
    });
  });

  describe('async - before each hook error', function() {
    before(run('hooks/beforeEach-hook-async-error.fixture.js'));
    it('should verify results', function() {
      expect(lines, 'to equal', ['before', bang + 'test 3']);
    });
  });

  describe('async - after hook error', function() {
    before(run('hooks/after-hook-async-error.fixture.js'));
    it('should verify results', function() {
      expect(lines, 'to equal', ['test 1', 'test 2', 'after', bang + 'test 3']);
    });
  });

  describe('async - after each hook error', function() {
    before(run('hooks/afterEach-hook-async-error.fixture.js'));
    it('should verify results', function() {
      expect(lines, 'to equal', ['test 1', 'after', bang + 'test 3']);
    });
  });

  describe('async - multiple hook errors', function() {
    before(run('hooks/multiple-hook-async-error.fixture.js'));
    it('should verify results', function() {
      expect(lines, 'to equal', [
        'root before',
        '1-1 before',
        'root before each',
        '1 before each',
        '1-1 before each',
        bang + '1-1 after each',
        '1 after each',
        'root after each',
        '1-1 after',
        bang + '1-2 before',
        'root before each',
        '1 before each',
        '1-2 before each',
        '1-2 test 1',
        '1-2 after each',
        bang + '1 after each',
        'root after each',
        '1-2 after',
        '1 after',
        '2-1 before',
        'root before each',
        '2 before each',
        bang + '2 after each',
        bang + 'root after each',
        '2-1 after',
        '2 after',
        'root after'
      ]);
    });
  });

  function run(fnPath, outputFilter) {
    return function(done) {
      runMocha(fnPath, ['--reporter', 'dot'], function(err, res) {
        expect(err, 'to be falsy');

        lines = res.output
          .split(splitRegExp)
          .map(function(line) {
            return line.trim();
          })
          .filter(outputFilter || onlyConsoleOutput());

        done();
      });
    };
  }
});

function onlyConsoleOutput() {
  var foundSummary = false;
  return function(line) {
    if (!foundSummary) {
      foundSummary = !!/\(\d+ms\)/.exec(line);
    }
    return !foundSummary && line.length > 0;
  };
}

function onlyErrorTitle(line) {
  var foundErrorTitle = false;
  var foundError = false;
  return function(line) {
    if (!foundErrorTitle) {
      foundErrorTitle = !!/^1\)/.exec(line);
    }
    if (!foundError) {
      foundError = /Error:/.exec(line);
    }
    return foundErrorTitle && !foundError;
  };
}
