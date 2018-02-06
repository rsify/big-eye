import path from 'path'

import bigEye from '../..'

export default (eyeOpts = {}, childArgs = '') => {
	const childPath = path.resolve(__dirname, '../fixtures/child.js')
	const eye = bigEye(`node ${childPath} ${childArgs}`, eyeOpts)

	return eye
}
