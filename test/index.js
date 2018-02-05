import fs from 'fs'

import delay from 'delay'
import struc from 'struc'
import test from 'ava'

import bigEye from '../'
import spawnServer from './helpers/server'

const touch = filePath => {
	fs.closeSync(fs.openSync(filePath, 'w'))
}

test('command must be a string', t => {
	const err = t.throws(() => {
		bigEye(0)
	}, TypeError)

	t.is(err.message, 'command must be a string, got number')
})

test('command string must be a non-empty', t => {
	const err = t.throws(() => {
		bigEye('')
	}, Error)

	t.is(err.message, 'command\'s length must be greater than 0')
})

test('initial exec', async t => {
	const {stat} = await spawnServer()

	await delay(200)

	// Not killed
	t.is(await stat.connectionCount(), 1)
	t.is(stat.execCount, 1)
})

test('no initial exec with lazy option', async t => {
	const {stat} = await spawnServer({
		lazy: true
	})

	await delay(200)

	t.is(await stat.connectionCount(), 0)
	t.is(stat.execCount, 0)
})

test('exec on change', async t => {
	const root = struc({
		a: ''
	})

	const {stat} = await spawnServer({
		watch: root
	})

	await delay(200)
	t.is(stat.execCount, 1)

	touch(root + '/a')
	await delay(200)

	t.is(stat.execCount, 2)
})
