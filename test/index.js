import delay from 'delay'
import struc from 'struc'
import test from 'ava'

import spawnServer from './helpers/server'
import touch from './helpers/touch'

test('initial exec', async t => {
	const {stat} = await spawnServer()

	await delay(500)

	// Not killed
	t.is(await stat.connectionCount(), 1)
	t.is(stat.execCount, 1)
})

test('exec on change', async t => {
	const root = struc({
		a: ''
	})

	const {stat} = await spawnServer({
		watch: root
	})

	await delay(500)
	t.is(stat.execCount, 1)

	touch(root + '/a')
	await delay(500)

	t.is(stat.execCount, 2)
})

test('restart after child exit', async t => {
	const root = struc({
		a: ''
	})

	const {stat} = await spawnServer({
		watch: root
	})

	await delay(500)
	t.is(await stat.connectionCount(), 1)
	const socket = stat.firstSocket

	socket.write('exit 1')

	await delay(100)
	t.is(await stat.connectionCount(), 0)

	touch(root + '/a')
	await delay(500)

	t.is(await stat.connectionCount(), 1)
})

test('no initial exec with lazy option', async t => {
	const {stat} = await spawnServer({
		lazy: true
	})

	await delay(500)

	t.is(await stat.connectionCount(), 0)
	t.is(stat.execCount, 0)
})

test('ignores files with ignore option', async t => {
	const root = struc({
		a: ''
	})

	const {stat} = await spawnServer({
		watch: root,
		ignore: root + '/a',
		lazy: true
	})

	await delay(100)
	touch(root + '/a')

	await delay(1000)
	t.is(stat.execCount, 0)
})

test('ignores directories with ignore option', async t => {
	const root = struc({
		a: {
			b: ''
		}
	})

	const {stat} = await spawnServer({
		watch: root,
		ignore: root + '/a',
		lazy: true
	})

	await delay(100)
	touch(root + '/a/b')

	await delay(1000)
	t.is(stat.execCount, 0)
})

test('debounce executions with delay option', async t => {
	const root = struc({
		a: ''
	})

	const {stat} = await spawnServer({
		watch: root,
		delay: 500
	})

	await delay(1000)
	t.is(stat.execCount, 1)

	touch(root + '/a')
	await delay(500)

	t.is(stat.execCount, 1)

	await delay(1000)
	t.is(stat.execCount, 2)
})
