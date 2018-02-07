import test from 'ava'

import bigEye from '../'

test('constructor (file)', t => {
	t.notThrows(() => {
		bigEye('foo')
	})
})

test('constructor (file, options)', t => {
	t.notThrows(() => {
		bigEye('foo', {})
	})
})

test('constructor (file, args)', t => {
	t.notThrows(() => {
		bigEye('foo', [])
	})
})

test('constructor (file, args, options)', t => {
	t.notThrows(() => {
		bigEye('foo', [], {})
	})
})

test('file must be a string', t => {
	const err = t.throws(() => {
		bigEye({})
	}, TypeError)

	t.is(err.message, 'file must be a string, got object')
})

test('file string must be a non-empty', t => {
	const err = t.throws(() => {
		bigEye('')
	}, Error)

	t.is(err.message, 'file\'s length must be greater than 0')
})

test('args must be an array', t => {
	const err = t.throws(() => {
		bigEye('echo', {}, {})
	}, Error)

	t.is(err.message, 'args must be an array, got object')
})

test('delay must be a number', t => {
	const err = t.throws(() => {
		bigEye('echo', {
			delay: {}
		})
	}, TypeError)

	t.is(err.message, 'opts.delay must be a number, got object')
})

test('ignore must be an array or string', t => {
	const err = t.throws(() => {
		bigEye('echo', {
			ignore: {}
		})
	}, TypeError)

	t.is(err.message, 'opts.ignore must be an array or string, got object')
})

test('lazy must be a boolean', t => {
	const err = t.throws(() => {
		bigEye('echo', {
			lazy: {}
		})
	}, TypeError)

	t.is(err.message, 'opts.lazy must be a boolean, got object')
})

test('watch must be an array or string', t => {
	const err = t.throws(() => {
		bigEye('echo', {
			watch: {}
		})
	}, TypeError)

	t.is(err.message, 'opts.watch must be an array or string, got object')
})
