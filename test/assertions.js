import test from 'ava'

import bigEye from '../'

test('command must be a string', t => {
	const err = t.throws(() => {
		bigEye({})
	}, TypeError)

	t.is(err.message, 'command must be a string, got object')
})

test('command string must be a non-empty', t => {
	const err = t.throws(() => {
		bigEye('')
	}, Error)

	t.is(err.message, 'command\'s length must be greater than 0')
})

test('delay must be a number', t => {
	const err = t.throws(() => {
		bigEye('echo', {
			delay: {}
		})
	}, TypeError)

	t.is(err.message, 'delay must be a number, got object')
})

test('ignore must be an array or string', t => {
	const err = t.throws(() => {
		bigEye('echo', {
			ignore: {}
		})
	}, TypeError)

	t.is(err.message, 'ignore must be an array or string, got object')
})

test('lazy must be a boolean', t => {
	const err = t.throws(() => {
		bigEye('echo', {
			lazy: {}
		})
	}, TypeError)

	t.is(err.message, 'lazy must be a boolean, got object')
})

test('watch must be an array or string', t => {
	const err = t.throws(() => {
		bigEye('echo', {
			watch: {}
		})
	}, TypeError)

	t.is(err.message, 'watch must be an array or string, got object')
})
