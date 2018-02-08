# big-eye
[![Travis build](https://travis-ci.org/nikersify/big-eye.svg?branch=master)](https://travis-ci.org/nikersify/big-eye)
[![AppVeyor build](https://ci.appveyor.com/api/projects/status/f6bhfklqk61bnqrc?svg=true)](https://ci.appveyor.com/project/nikersify/big-eye)
[![Coveralls](https://coveralls.io/repos/github/nikersify/big-eye/badge.svg?branch=master)](https://coveralls.io/github/nikersify/big-eye?branch=master)

> execute specified command[s] on file change[s]


# install

```
$ npm install [-g] big-eye
```


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
	  -d, --delay    Debounce delay in ms between command executions [Default: 100]
	  -q, --quiet    Print only command output

	Examples
	  $ eye app.js
	  $ eye build.js -w src/
	  $ eye python module.py -i '*.pyc'
	  $ eye 'g++ main.cpp && ./a.out'

	Tips
	  Run eye without arguments to execute the npm start script.
```

## api

### bigEye(file, [args], [options])

Execute `file` with `args` when a file matching the `options.watch` array
gets modified. Returns a new `Eye` instance.

#### file

Type: `String`

Absolute path to the file to be executed. Must be a non-empty `String`.

#### args

Type: `Array`

Arguments that will be passed to child process when executing `file`.

#### options

Type: `Object`

Options object that can take the following keys:

##### watch

Type: `Array`, `String`

Path(s) to files, dir(s) to be watched recursively, or glob pattern(s).

##### ignore

Type: [anymatch](https://github.com/micromatch/anymatch) compatible definition

Path(s) to files, dir(s) to be ignored, regex(es), or glob pattern(s).

##### lazy

Type: `Boolean`<br>
Default: `false`

If set to `true`, don't exxecute `file` after constructing the instance, but only
on watched file change.

##### delay

Type: `Number`<br>
Default: `100`

Delay in ms when debouncing execution after file changes.

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


# license

MIT © [nikersify](https://nikerino.com)
