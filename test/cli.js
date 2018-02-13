import path from 'path'

import execa from 'execa'
import test from 'ava'

import pkg from '../package'

const moduleRoot = path.dirname(__dirname)
const cli = (args, opts) => execa(path.join(moduleRoot, 'cli.js'), args, opts)

test('is executable', async t => {
	const {stdout} = await cli(['--version'])
	t.is(stdout, pkg.version)
})
