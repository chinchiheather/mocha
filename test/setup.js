'use strict';

const unexpected = require('unexpected');
global.expect = require('./assertions').mixinMochaAssertions(
  unexpected.clone()
);

global.assert = require('assert');
