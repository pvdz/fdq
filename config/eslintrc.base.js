/*

Linting rules

Base configurations (no actual rules here).
Base rules are in eslintrc.dist.js and
dev rules are overridden in eslintrc.dev.js

http://eslint.org/docs/user-guide/configuring

*/

module.exports = {
  extends: './eslintrc.standard.js',
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 6,
  },
};
