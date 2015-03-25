var sass = require('node-sass')
var path = require('path')
var fs = require('fs')
var url = require('url')

var sassMiddleware = module.exports = function(baseDir) {

	var pathMap = {}
	// TODO: use Custom Importer to provide constant Compass or Bourbon support
	var middleware = function(req, res, next) {
		var parsedUrl = url.parse(req.url)
		var extname = path.extname(parsedUrl.pathname)
		if(extname !== '.css' && extname !== '.scss' && extname !== '.map') {
			return next()
		}
		var isMap = !!~parsedUrl.pathname.indexOf('.map')
		var filebase = path.join(path.join(baseDir, path.dirname(parsedUrl.pathname)), path.basename(parsedUrl.pathname, (isMap ? '.css.map' : extname) ))
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