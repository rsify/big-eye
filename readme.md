# big-eye [![npm](https://img.shields.io/npm/v/big-eye.svg)](https://www.npmjs.com/package/big-eye)

> execute specified command[s] on file change[s]

[![travis](https://travis-ci.org/nikersify/big-eye.svg?branch=master)](https://travis-ci.org/nikersify/big-eye)
[![coveralls](https://coveralls.io/repos/github/nikersify/big-eye/badge.svg?branch=master)](https://coveralls.io/github/nikersify/big-eye?branch=master)

# install

`$ npm install [-g] big-eye`
*(omit -g flag to install big-eye in your project)*

# usage

## cli

```
$ eye --help

  Usage
    $ eye <command>

  Options
    -w, --watch    Files/directories to be watched. [Default: pwd] [Can be used multiple times]
    -i, --ignore   Files/directories to be ignored. [Default: from .gitignore] [Can be used multiple times]
    -q, --quiet    Print only command output
    -v, --version  Show version information

  Examples
    $ eye node app.js
    $ eye node build.js -w src/
    $ eye python module.py -i *.pyc
    $ eye 'g++ main.cpp && ./a.out'
```

# example

```
$ eye "echo hello!" -w lib/ -w index.js -i lib/tmp/
big-eye starting with config:
	command: echo hello!
	watch: lib/, index.js
	ignore: lib/tmp/
hello!
big-eye command exited without error, waiting for changes...
```

# install

`# npm install --save big-eye`

# license

MIT
