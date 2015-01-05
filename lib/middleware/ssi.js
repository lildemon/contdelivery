var ssi = require('ssi')
var fs = require('fs')
var path = require('path')
ssi.handlers.jsentry = function(attributes, currentFile, variables) {
	return 'haha entry mangled'
}


module.exports = function(baseDir) {
	var pathMap = {}
	var ssiParser = new ssi(baseDir)
	var middleware = function(req, res, next) {
		if(path.extname(req.url) !== '.shtml') {
			return next()
		}
		var filepath = path.join(baseDir, req.url)
		if(pathMap[filepath]) {
			res.send(pathMap[filepath])
		} else {
			fs.readFile(filepath, function(err, data) {
				if(!err) {
					data = data.toString() // TODO: GBK Encoding detection?
					//console.log('data is: ' + data)
					var parsed = ssiParser.parse(filepath, data)
					res.send(parsed.contents)
				} else {
					next()
				}
			})
		}
	}

	return {
		middleware: middleware,
		flush: function(name) {
			delete pathMap[name]
		}
	}
}