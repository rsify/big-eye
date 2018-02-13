import os from 'os'
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

const markExecutable = async p => {
	let newPath = p
	let newName = path.parse(p).name
	if (process.platform === 'win32') {
		newPath = p + '.CMD'
		newName += '.CMD'
		await fs.move(p, newPath)
	} else {
		await fs.chmod(p, '755')
	}

	return {newPath, newName}
}

test('flagsToOptions no flags', t => {
	const cwd = struc({})

	t.deepEqual(flagsToOptions(cwd, {}), {
		ignore: [],
		watch: ['.']
	})
})

test('flagsToOptions no flags with .gitignore in cwd', t => {
	const cwd = struc({
		'.gitignore': 'foo bar'.split(' ').join(os.EOL)
	})

	t.deepEqual(flagsToOptions(cwd, {}), {
		ignore: ['foo', 'bar'],
		watch: ['.']
	})
})

test('flagsToOptions flags with .gitignore in cwd', t => {
	const cwd = struc({
		'.gitignore': 'foo bar'.split(' ').join(os.EOL)
	})

	t.deepEqual(flagsToOptions(cwd, {
		ignore: 'baz'
	}), {
		ignore: ['baz'],
		watch: ['.']
	})
})

test('flagsToOptions duplicates', t => {
	const cwd = struc({})

	t.deepEqual(flagsToOptions(cwd, {
		ignore: ['foo', 'bar', 'foo'],
		i: ['bar', 'foo', 'baz'],
		watch: ['loo', 'lar'],
		w: 'lar'
	}), {
		ignore: ['bar', 'foo', 'baz'],
		watch: ['lar', 'loo']
	})
})

test('flagsToOptions type casting', t => {
	const cwd = struc({})

	t.deepEqual(flagsToOptions(cwd, {
		ignore: 'foo',
		watch: 'bar',
		lazy: true,
		delay: '10'
	}), {
		ignore: ['foo'],
		watch: ['bar'],
		lazy: true,
		delay: 10
	})
})

test('mergeToArr', t => {
	t.deepEqual(mergeToArr(), [])
	t.deepEqual(mergeToArr('a'), ['a'])
	t.deepEqual(mergeToArr('a', 'b'), ['a', 'b'])
	t.deepEqual(mergeToArr(['a'], 'b'), ['a', 'b'])
	t.deepEqual(mergeToArr('a', ['b']), ['a', 'b'])
	t.deepEqual(mergeToArr(['a'], ['b']), ['a', 'b'])
	t.deepEqual(mergeToArr(['a'], 'a'), ['a'])
	t.deepEqual(mergeToArr(['a', 'a'], 'b'), ['a', 'b'])
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

	t.true(err.message.indexOf('no command specified (') === 0)
})

test('parseCommand no cmd & scripts in package.json', t => {
	const cwd = struc({
		'package.json': '{}'
	})

	const err = t.throws(() => {
		parseCommand(cwd, '')
	})

	t.is(err.message, 'no command specified (missing package.json start script)')
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

	t.is(err.message, 'no command specified (missing package.json start script)')
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

	const {newPath} = await markExecutable(path.join(cwd, 'node_modules/.bin/foo'))

	t.deepEqual(parseCommand(cwd, ''), {
		file: newPath,
		args: ['--bar', 'baz'],
		pretty: 'foo --bar baz'
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
		args: ['--bar', 'baz'],
		pretty: 'echo --bar baz'
	})
})

test('parseCommand .js file', t => {
	const cwd = struc({
		'foo.js': ''
	})

	t.deepEqual(parseCommand(cwd, 'foo.js'), {
		file: which.sync('node'),
		args: ['foo.js'],
		pretty: 'node foo.js'
	})
})

test('parseCommand local executable file', async t => {
	const name = Math.random().toString(36).slice(2)
	const cwd = struc({
		[name]: ''
	})

	const {newPath, newName} = await markExecutable(path.join(cwd, name))

	t.deepEqual(parseCommand(cwd, newName + ' --bar baz'), {
		file: newPath,
		args: ['--bar', 'baz'],
		pretty: newName + ' --bar baz'
	})
})

test('parseCommand local non executable file', t => {
	const name = Math.random().toString(36).slice(2)
	const cwd = struc({
		[name]: ''
	})

	if (process.platform === 'win32') {
		t.deepEqual(parseCommand(cwd, name), {
			file: path.join(cwd, name),
			args: [],
			pretty: name
		})
	} else {
		const err = t.throws(() => {
			parseCommand(cwd, name)
		}, Error)

		t.is(err.message, `${name} is not executable`)
	}
})

test('parseCommand file missing', t => {
	const name = Math.random().toString(36).slice(2)
	const cwd = struc({})

	const err = t.throws(() => {
		parseCommand(cwd, name)
	})

	t.is(err.message, `${name} is not executable`)
})

test('parseCommand executable file from PATH', t => {
	const cwd = struc({})

	t.deepEqual(parseCommand(cwd, 'echo --bar baz'), {
		file: which.sync('echo'),
		args: ['--bar', 'baz'],
		pretty: 'echo --bar baz'
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

	const {newPath} = await markExecutable(path.join(cwd, 'node_modules/.bin/foo'))

	t.deepEqual(parseCommand(cwd, 'foo --bar baz'), {
		file: newPath,
		args: ['--bar', 'baz'],
		pretty: 'foo --bar baz'
	})
})

test('parseCommand directory', t => {
	const cwd = struc({
		foo: {}
	})

	const err = t.throws(() => {
		parseCommand(cwd, 'foo')
	}, Error)

	t.is(err.message, 'foo is not executable')
})

test('parseCommand directory with .js extension', t => {
	const cwd = struc({
		'foo.js': {}
	})

	const err = t.throws(() => {
		parseCommand(cwd, 'foo.js')
	}, Error)

	t.is(err.message, 'foo.js is not executable')
})

test('parseCommand directory and node_module with the same name', async t => {
	const cwd = struc({
		foo: {},
		// eslint-disable-next-line camelcase
		node_modules: {
			'.bin': {
				foo: ''
			}
		}
	})

	const {newPath} = await markExecutable(path.join(cwd, 'node_modules/.bin/foo'))

	t.deepEqual(parseCommand(cwd, 'foo --bar baz'), {
		file: newPath,
		args: ['--bar', 'baz'],
		pretty: 'foo --bar baz'
	})
})
