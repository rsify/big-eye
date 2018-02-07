import path from 'path'

import which from 'which'

import bigEye from '../..'

export default (eyeOpts = {}, childArgs = []) => {
	const childPath = path.resolve(__dirname, '../fixtures/child.js')
	const eye = bigEye(
		which.sync('node'),
		[childPath].concat(childArgs),
		eyeOpts
	)

	return eye
}
