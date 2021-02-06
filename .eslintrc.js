module.exports = {
  'env': {
    'browser': true,
    'es2021': true
  },
  'extends': 'eslint:recommended',
  'parserOptions': {
    'ecmaVersion': 12
  },
  'rules': {
    'indent': ['error', 2],
    'linebreak-style': ['error', 'windows'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'space-before-function-paren': ['error', 'never'],
    'semi-spacing': ['error', {'before': false, 'after': true}],
    'keyword-spacing': ['error'],
    'no-multi-spaces': ['error'],
    'space-in-parens': ['error', 'never'],
    'arrow-spacing': ['error'],
    'comma-spacing': ['error'],
    'key-spacing': ['error'],
    'space-infix-ops': ['error']
  }
};
