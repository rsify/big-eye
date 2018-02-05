import fs from 'fs'

import delay from 'delay'
import struc from 'struc'
import test from 'ava'

import spawnServer from './helpers/server'

const touch = filePath => {
	fs.closeSync(fs.openSync(filePath, 'w'))
}

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

test('debounce executions with delay option', async t => {
	const root = struc({
		a: ''
	})

	const {stat} = await spawnServer({
		watch: root,
		delay: 500
	})

	await delay(700)
	t.is(stat.execCount, 1)

	touch(root + '/a')
	await delay(200)

	t.is(stat.execCount, 1)

	await delay(600)
	t.is(stat.execCount, 2)
})
