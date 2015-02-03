var sass = require('node-sass')
var path = require('path')
var fs = require('fs')

var sassMiddleware = module.exports = function(baseDir) {

	var pathMap = {}
	// TODO: use Custom Importer to provide constant Compass or Bourbon support
	var middleware = function(req, res, next) {
		var extname = path.extname(req.url)
		if(extname !== '.css' && extname !== '.map') {
			return next()
		}
		var isMap = !!~req.url.indexOf('.map')
		var filebase = path.join(path.join(baseDir, path.dirname(req.url)), path.basename(req.url, (isMap ? '.css.map' : '.css') ))
		var filepath = filebase + '.scss'
		if(!fs.existsSync(filepath)) {
			filepath = filebase + '.sass'
		}
		var stats = {}
		sass.render({
			file: filepath,
			stats: stats,
			outputStyle: 'nested',
			sourceComments: true,
			success: function(css) {
				if(isMap) {
					res.send(stats.sourceMap)
					
				} else {
					res.set('Content-Type', 'text/css')
					res.send(css)
				}
				
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