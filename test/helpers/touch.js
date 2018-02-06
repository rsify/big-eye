import fs from 'fs'

export default filePath => {
	fs.closeSync(fs.openSync(filePath, 'w'))
}
