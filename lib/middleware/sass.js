var sass = require('node-sass')
var path = require('path')
var fs = require('fs')

var sassMiddleware = module.exports = function(baseDir) {

	var pathMap = {}
	// TODO: use Custom Importer to provide constant Compass or Bourbon support
	var middleware = function(req, res, next) {
		if(path.extname(req.url) !== '.css') {
			return next()
		}
		var filepath = path.join(path.join(baseDir, path.dirname(req.url)), path.basename(req.url, '.css') + '.scss')
		sass.render({
			file: filepath,
			success: function(css, map, stats) {
				res.send(css)
			},
			error: function(error) {
				// TODO: notify to websocket

				if(fs.existsSync(filepath)) {
					next(error)
				} else {
					next()
				}
				
				//console.log(error.message);
		        //console.log(error.code);
		        //console.log(error.line);
		        //console.log(error.column); // new in v2
				
			}
		})
	}

	return {
		middleware: middleware,
		flush: function(name) {
			delete pathMap[name]
		}
	}
}