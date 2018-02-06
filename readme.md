# big-eye
[![Travis build](https://travis-ci.org/nikersify/big-eye.svg?branch=master)](https://travis-ci.org/nikersify/big-eye)
[![AppVeyor build](https://ci.appveyor.com/api/projects/status/f6bhfklqk61bnqrc?svg=true)](https://ci.appveyor.com/project/nikersify/big-eye)
[![Coveralls](https://coveralls.io/repos/github/nikersify/big-eye/badge.svg?branch=master)](https://coveralls.io/github/nikersify/big-eye?branch=master)

> execute specified command[s] on file change[s]

# install

`$ npm install [-g] big-eye`

# usage

## cli

```
$ eye --help

	Usage
	  $ eye <command>

	Options
	  -w, --watch    Files/directories to be watched [Default: pwd]
	  -i, --ignore   Files/directories to be ignored [Default: from .gitignore]
	  -l, --lazy     Don't execute command on startup
	  -d, --delay    Debounce delay in ms between command executions [Default: 10]
	  -q, --quiet    Print only command output

	Examples
	  $ eye node app.js
	  $ eye node build.js -w src/
	  $ eye python module.py -i '*.pyc'
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
