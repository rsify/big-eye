import os from 'os'
import path from 'path'

import execa from 'execa'
import fs from 'fs-extra'
import test from 'ava'

import pkg from '../package'

import {flagsToOptions, mergeToArr} from '../lib/cli-helpers'

const cwd = path.dirname(__dirname)
const cli = (args, opts) => execa(path.join(cwd, 'cli.js'), args, opts)

test('is executable', async t => {
	const {stdout} = await cli(['--version'], {cwd})
	t.is(stdout.indexOf(pkg.name), 0)
})

test('converts flags to options', async t => {
	t.deepEqual(flagsToOptions({
		watch: 'a',
		ignore: 'b',
		lazy: true,
		delay: 10
	}), {
		watch: ['a'],
		ignore: ['b'],
		lazy: true,
		delay: 10
	})

	t.deepEqual(flagsToOptions({
		watch: ['a'],
		ignore: 'b',
		lazy: false
	}), {
		watch: ['a'],
		ignore: ['b'],
		lazy: false
	})

	const gi = await fs.readFile(path.join(cwd, '.gitignore'), 'utf8')

	t.deepEqual(flagsToOptions({}), {
		watch: ['.'],
		ignore: gi.split(os.EOL).filter(x => x.length > 0)
	})
})

test('mergeToArr', t => {
	t.deepEqual(mergeToArr(), [])
	t.deepEqual(mergeToArr('a'), ['a'])
	t.deepEqual(mergeToArr('a', 'b'), ['a', 'b'])
	t.deepEqual(mergeToArr(['a'], 'b'), ['a', 'b'])
	t.deepEqual(mergeToArr('a', ['b']), ['a', 'b'])
	t.deepEqual(mergeToArr(['a'], ['b']), ['a', 'b'])
})
