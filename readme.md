# big-eye [![npm](https://img.shields.io/npm/v/big-eye.svg)](https://www.npmjs.com/package/big-eye)

> cli tool to execute specified commands on file changes

[![travis](https://travis-ci.org/Nikersify/big-eye.svg?branch=master)](https://travis-ci.org/Nikersify/big-eye)

# usage

## cli

### `big-eye (command) [-w/--watch file/dir] [-i/--ignore file/dir] [-q/--quiet]`

#### options

##### `command` - required

Command to be executed when a change is detected.

##### `-w` `--watch` - default: `.`

Files/dirs to be watched. If a dir is provided it is watched recursively, unless it's the pwd. Can be used multiple times.

##### `-i` `--ignore` - default: `.git, node_modules`

Files/dirs to be ignored, even when specified by the --watch option. Can be used multiple times.

##### `-q` `--quiet` - default: `false`

Skip all big-eye output, print only command stdout & stderr outputs.

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