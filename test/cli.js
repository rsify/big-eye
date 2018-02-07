import path from 'path'

import execa from 'execa'
import struc from 'struc'
import test from 'ava'

import pkg from '../package'

import {flagsToOptions, mergeToArr} from '../lib/cli-helpers'

const moduleRoot = path.dirname(__dirname)
const cli = (args, opts) => execa(path.join(moduleRoot, 'cli.js'), args, opts)

test('is executable', async t => {
	const {stdout} = await cli(['--version'])
	t.is(stdout.indexOf(pkg.name), 0)
})

test('converts flags to options', t => {
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

	process.chdir(struc({
		'.gitignore': 'hello\nworld\n'
	}))

	t.deepEqual(flagsToOptions({}), {
		watch: ['.'],
		ignore: ['hello', 'world']
	})

	process.chdir(struc({}))

	t.deepEqual(flagsToOptions({}), {
		watch: ['.'],
		ignore: []
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
