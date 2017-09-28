// dev overrides for eslintrc.dist.js

const OFF = 0
const WARNING = 1
const ERROR = 2

module.exports = {
  extends: './eslintrc.dist.js',
  globals: {
    // mocha testing implicit globals
    after: true,
    afterEach: true,
    before: true,
    beforeEach: true,
    describe: true,
    it: true,
  },
  rules: {
    'padded-blocks': OFF, // i'd prefer to turn it off for functions only, but whatever, let's allow block padding in tests
    'no-console': OFF,
    'no-debugger': OFF,
  },
};
