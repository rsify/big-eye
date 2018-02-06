import path from 'path'

import delay from 'delay'
import struc from 'struc'
import test from 'ava'

import spawnServer from './helpers/server'
import touch from './helpers/touch'

test('initial', async t => {
	const {stat} = await spawnServer()

	await delay(2000)

	// Not killed
	t.is(await stat.connectionCount(), 1)
	t.is(stat.execCount, 1)
})

test('on change', async t => {
	const p = struc({
		a: ''
	})

	const {stat} = await spawnServer({
		watch: p
	})

	await delay(2000)
	t.is(stat.execCount, 1)

	touch(p + '/a')
	await delay(2000)

	t.is(stat.execCount, 2)
})

test('after child exit', async t => {
	const p = struc({
		a: ''
	})

	const {stat} = await spawnServer({
		watch: p
	})

	await delay(2000)
	t.is(await stat.connectionCount(), 1)
	const socket = stat.firstSocket

	socket.write('exit 1')

	await delay(2000)
	t.is(await stat.connectionCount(), 0)

	touch(p + '/a')
	await delay(2000)

	t.is(await stat.connectionCount(), 1)
})

test('no initial with lazy option', async t => {
	const {stat} = await spawnServer({
		lazy: true
	})

	await delay(2000)

	t.is(await stat.connectionCount(), 0)
	t.is(stat.execCount, 0)
})

test('ignores files with ignore option', async t => {
	const p = struc({
		a: ''
	})

	const {stat} = await spawnServer({
		watch: p,
		ignore: path.join(p, '/a'),
		lazy: true
	})

	await delay(2000)
	touch(p + '/a')

	await delay(2000)
	t.is(stat.execCount, 0)
})

test('ignores directories with ignore option', async t => {
	const p = struc({
		a: {
			b: ''
		}
	})

	const {stat} = await spawnServer({
		watch: p,
		ignore: path.join(p + '/a'),
		lazy: true
	})

	await delay(2000)
	touch(p + '/a/b')

	await delay(2000)
	t.is(stat.execCount, 0)
})

test('debounce executions with delay option', async t => {
	const p = struc({
		a: ''
	})

	const {stat} = await spawnServer({
		watch: p,
		delay: 500
	})

	await delay(2000)
	t.is(stat.execCount, 1)

	touch(p + '/a')
	await delay(300)

	t.is(stat.execCount, 1)

	await delay(2000)
	t.is(stat.execCount, 2)
})
