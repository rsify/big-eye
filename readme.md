# big-eye [![npm](https://img.shields.io/npm/v/big-eye.svg)](https://www.npmjs.com/package/big-eye)

> execute specified command[s] on file change[s]

[![travis](https://travis-ci.org/nikersify/big-eye.svg?branch=master)](https://travis-ci.org/nikersify/big-eye)
[![coveralls](https://coveralls.io/repos/github/nikersify/big-eye/badge.svg?branch=master)](https://coveralls.io/github/nikersify/big-eye?branch=master)

# usage

## cli

### `big-eye (command) [-wiq]`

#### options

##### `command` - required

Type: `string`
Command to be executed when a change is detected.

##### `-w` `--watch` - default: `.`

File/directory/glob to be watched. If a dir is provided it is watched recursively (i.e. all of its children and their children etc.). Can be used multiple times.

##### `-i` `--ignore` - default: `.git, node_modules`

Takes an [anymatch](https://github.com/micromatch/anymatch) compatible definition.
Files/dirs to be ignored, even when specified by the `--watch` option. Can be used multiple times.

##### `-q` `--quiet` - default: `false`

Skip all big-eye related output, print only command stdout & stderr outputs.

# example

```
$ big-eye "echo hello!" -w lib/ -w index.js -i lib/tmp/

big-eye starting with config:
	command: echo hello!
	watch: lib
	ignore: /srv/git/big-eye/.git, /srv/git/big-eye/node_modules
hello!
big-eye command exited without error, waiting for changes...
```

# install

`# npm install --save big-eye`

# license

MIT
