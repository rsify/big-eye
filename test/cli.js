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
	t.not(stdout.indexOf(pkg.name), -1)
})

test('converts flags to options', t => {
	const emptyDir = struc({})

	t.deepEqual(flagsToOptions(emptyDir, {
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

	t.deepEqual(flagsToOptions(emptyDir, {
		watch: ['a'],
		ignore: 'b',
		lazy: false
	}), {
		watch: ['a'],
		ignore: ['b'],
		lazy: false
	})

	t.deepEqual(flagsToOptions(emptyDir, {}), {
		watch: ['.'],
		ignore: []
	})

	t.deepEqual(flagsToOptions(struc({
		'.gitignore': 'hello\nworld\n'
	}), {}), {
		watch: ['.'],
		ignore: ['hello', 'world']
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
