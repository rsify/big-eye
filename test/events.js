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

	await delay(100)

	t.true(spy.calledOnce)
	t.true(spy.calledWith())
})

test('executing on update', async t => {
	const root = struc({
		a: ''
	})

	const eye = makeEye({
		watch: root,
		lazy: true
	})

	const spy = sinon.spy()
	eye.on('executing', spy)

	await delay(300)

	touch(root + '/a')
	await delay(300)

	t.true(spy.calledOnce)
	t.true(spy.calledWith())
})

test('changes', async t => {
	const root = struc({
		a: ''
	})

	const eye = makeEye({
		watch: root
	})

	const spy = sinon.spy()
	eye.on('changes', spy)

	await delay(300)

	touch(root + '/a')
	await delay(300)
	t.is(spy.callCount, 1)
	t.true(spy.lastCall.calledWith('change', root + '/a'))

	await fs.writeFile(root + '/b', '')
	await delay(300)
	t.is(spy.callCount, 2)
	t.true(spy.lastCall.calledWith('add', root + '/b'))

	await fs.remove(root + '/b')
	await delay(300)
	t.is(spy.callCount, 3)
	t.true(spy.lastCall.calledWith('unlink', root + '/b'))

	await fs.mkdir(root + '/c')
	await delay(300)
	t.is(spy.callCount, 4)
	t.true(spy.lastCall.calledWith('addDir', root + '/c'))

	await fs.remove(root + '/c')
	await delay(300)
	t.is(spy.callCount, 5)
	t.true(spy.lastCall.calledWith('unlinkDir', root + '/c'))
})

test('success & failure', async t => {
	const root = struc({
		a: ''
	})

	const {stat, eye} = await spawnServer({
		watch: root
	})

	const successSpy = sinon.spy()
	const failureSpy = sinon.spy()

	eye.on('success', successSpy)
	eye.on('failure', failureSpy)

	t.is(successSpy.callCount, 0)

	await delay(300)
	stat.firstSocket.write('exit 0')
	await delay(300)
	t.is(successSpy.callCount, 1)
	t.is(failureSpy.callCount, 0)
	touch(root + '/a')

	await delay(300)
	stat.firstSocket.write('exit 69')

	await delay(300)
	t.is(successSpy.callCount, 1)
	t.is(failureSpy.callCount, 1)

	t.is(typeof successSpy.args[0][0], 'number')

	t.is(typeof failureSpy.args[0][0], 'number')
	t.is(failureSpy.args[0][1], 69)
})

test('killed', async t => {
	const root = struc({
		a: ''
	})

	const eye = makeEye({
		watch: root
	})

	const spy = sinon.spy()
	eye.on('killed', spy)

	await delay(300)
	t.true(spy.notCalled)

	touch(root + '/a')
	await delay(300)

	t.true(spy.calledOnce)
	t.true(spy.calledWith('SIGTERM'))
})
