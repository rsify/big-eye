import {ChildProcess} from 'child_process'
import path from 'path'

import delay from 'delay'
import fs from 'fs-extra'
import sinon from 'sinon'
import struc from 'struc'
import test from 'ava'

import makeEye from './helpers/make-eye'
import spawnServer from './helpers/server'
import touch from './helpers/touch'

test('executing initial', async t => {
	const eye = makeEye()

	const spy = sinon.spy()
	eye.on('executing', spy)

	await delay(1000)

	t.true(spy.calledOnce)
	t.is(spy.args[0][0].constructor, ChildProcess)
})

test('executing on update', async t => {
	const p = struc({
		a: ''
	})

	const eye = makeEye({
		watch: p,
		lazy: true
	})

	const spy = sinon.spy()
	eye.on('executing', spy)

	await delay(1000)

	touch(p + '/a')
	await delay(1000)

	t.true(spy.calledOnce)
	t.is(spy.args[0][0].constructor, ChildProcess)
})

test('changes', async t => {
	const p = struc({
		a: ''
	})

	const eye = makeEye({
		watch: p
	})

	const spy = sinon.spy()
	eye.on('changes', spy)

	await delay(1000)

	touch(p + '/a')
	await delay(1000)
	t.is(spy.callCount, 1)
	t.true(spy.lastCall.calledWith('change', path.join(p + '/a')))

	await fs.writeFile(p + '/b', '')
	await delay(1000)
	t.is(spy.callCount, 2)
	t.true(spy.lastCall.calledWith('add', path.join(p + '/b')))

	await fs.remove(p + '/b')
	await delay(1000)
	t.is(spy.callCount, 3)
	t.true(spy.lastCall.calledWith('unlink', path.join(p + '/b')))

	await fs.mkdir(p + '/c')
	await delay(1000)
	t.is(spy.callCount, 4)
	t.true(spy.lastCall.calledWith('addDir', path.join(p + '/c')))

	await fs.remove(p + '/c')
	await delay(1000)
	t.is(spy.callCount, 5)
	t.true(spy.lastCall.calledWith('unlinkDir', path.join(p + '/c')))
})

test('changes debounced', async t => {
	const p = struc({
		a: ''
	})

	const eye = makeEye({
		watch: p,
		delay: 500
	})

	const spy = sinon.spy()
	eye.on('changes', spy)

	await delay(1000)

	touch(p + '/a')
	await delay(100)
	touch(p + '/a')
	await delay(800)
	t.is(spy.callCount, 1)

	await delay(1000)
	touch(p + '/a')
	await delay(1000)
	t.is(spy.callCount, 2)
})

test('exited', async t => {
	const p = struc({
		a: ''
	})

	const {stat, eye} = await spawnServer({
		watch: p
	})

	const spy = sinon.spy()

	eye.on('exited', spy)

	t.is(spy.callCount, 0)

	await delay(2000)
	stat.firstSocket.write('exit 0')
	await delay(1000)
	t.is(spy.callCount, 1)
	t.is(typeof spy.lastCall.args[0], 'number')
	touch(p + '/a')

	await delay(1000)
	stat.firstSocket.write('exit 69')

	await delay(1000)
	t.is(spy.callCount, 2)
	t.is(typeof spy.lastCall.args[0], 'number')
	t.is(spy.lastCall.args[1], 69)
})

test('killed', async t => {
	const p = struc({
		a: ''
	})

	const eye = makeEye({
		watch: p
	})

	const spy = sinon.spy()
	eye.on('killed', spy)

	await delay(1000)
	t.true(spy.notCalled)

	touch(p + '/a')
	await delay(1000)

	t.true(spy.calledOnce)
	t.true(spy.calledWith('SIGTERM'))
})
