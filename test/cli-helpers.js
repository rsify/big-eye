import path from 'path'

import fs from 'fs-extra'
import struc from 'struc'
import test from 'ava'
import which from 'which'

import {
	flagsToOptions,
	mergeToArr,
	parseCommand
} from '../lib/cli-helpers'

test('flagsToOptions', t => {
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

test('parseCommand no cmd & no package.json', t => {
	const cwd = struc({})

	const err = t.throws(() => {
		parseCommand(cwd, '')
	}, Error)

	t.is(err.message, 'no command specified')
})

test('parseCommand no cmd & invalid package.json', t => {
	const cwd = struc({
		'package.json': ''
	})

	const err = t.throws(() => {
		parseCommand(cwd, '')
	})

	t.true(err.message.indexOf('no command specified & missing package.json' +
		' start script (') === 0)
})

test('parseCommand no cmd & scripts in package.json', t => {
	const cwd = struc({
		'package.json': '{}'
	})

	const err = t.throws(() => {
		parseCommand(cwd, '')
	})

	t.is(err.message, 'no command specified & missing package.json' +
		' start script (Error: missing package.json start script)')
})

test('parseCommand no cmd & no start script in package.json', t => {
	const cwd = struc({
		'package.json': JSON.stringify({
			scripts: {}
		})
	})

	const err = t.throws(() => {
		parseCommand(cwd, '')
	})

	t.is(err.message, 'no command specified & missing package.json' +
		' start script (Error: missing package.json start script)')
})

test('parseCommand no cmd & start script in package.json & executable file from node_modules in package.json', async t => {
	const cwd = struc({
		// eslint-disable-next-line camelcase
		node_modules: {
			'.bin': {
				foo: ''
			}
		},
		'package.json': JSON.stringify({
			scripts: {
				start: 'foo --bar baz'
			}
		})
	})

	// Mark as executable
	await fs.chmod(path.join(cwd, 'node_modules/.bin/foo'), '755')

	t.deepEqual(parseCommand(cwd, ''), {
		file: path.join(cwd, 'node_modules/.bin/foo'),
		args: ['--bar', 'baz']
	})
})

test('parseCommand no cmd & start script in package.json & executable file from PATH', t => {
	const cwd = struc({
		'package.json': JSON.stringify({
			scripts: {
				start: 'echo --bar baz'
			}
		})
	})

	t.deepEqual(parseCommand(cwd, ''), {
		file: which.sync('echo'),
		args: ['--bar', 'baz']
	})
})

test('parseCommand .js file', t => {
	const cwd = struc({
		'foo.js': ''
	})

	t.deepEqual(parseCommand(cwd, 'foo.js'), {
		file: which.sync('node'),
		args: []
	})
})

test('parseCommand local executable file', async t => {
	const name = Math.random().toString(36).slice(2)
	const cwd = struc({
		[name]: ''
	})

	await fs.chmod(path.join(cwd, name), '755')

	t.deepEqual(parseCommand(cwd, name + ' --bar baz'), {
		file: path.join(cwd, name),
		args: ['--bar', 'baz']
	})
})

test('parseCommand local non executable file', t => {
	const name = Math.random().toString(36).slice(2)
	const cwd = struc({
		[name]: ''
	})

	const err = t.throws(() => {
		parseCommand(cwd, name)
	}, Error)

	t.is(err.message, `${name} is not executable`)
})

test('parseCommand file missing', t => {
	const name = Math.random().toString(36).slice(2)
	const cwd = struc({})

	const err = t.throws(() => {
		parseCommand(cwd, name)
	})

	t.is(err.message, `${name} does not exist`)
})

test('parseCommand executable file from PATH', t => {
	const cwd = struc({})

	t.deepEqual(parseCommand(cwd, 'echo --bar baz'), {
		file: which.sync('echo'),
		args: ['--bar', 'baz']
	})
})

test('parseCommand executable file from node_modules', async t => {
	const cwd = struc({
		// eslint-disable-next-line camelcase
		node_modules: {
			'.bin': {
				foo: ''
			}
		}
	})

	await fs.chmod(path.join(cwd, 'node_modules/.bin/foo'), '755')

	t.deepEqual(parseCommand(cwd, 'foo --bar baz'), {
		file: path.join(cwd, 'node_modules/.bin/foo'),
		args: ['--bar', 'baz']
	})
})
