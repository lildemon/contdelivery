var ssi = require('ssi')
var fs = require('fs')
var path = require('path')
var url = require('url')
ssi.handlers.jsentry = function(attributes, currentFile, variables) {
	return 'haha entry mangled'
}


module.exports = function(baseDir) {
	var pathMap = {}
	var ssiParser = new ssi(baseDir)

	ssiParser.parser.customHandlers.jsentry = function(attributes, currentFile, variables) {
		return 'haha entry mangled, instance Only'
	}

	var middleware = function(req, res, next) {
		var parsedUrl = url.parse(req.url)
		var ext = path.extname(parsedUrl.pathname)
		if(ext !== '.shtml' && ext !== '.html') {
			return next()
		}
		var pathname = parsedUrl.pathname.replace(/\.html$/, '.shtml')
		var filepath = path.join(baseDir, pathname)
		if(pathMap[filepath]) {
			res.send(pathMap[filepath])
		} else {
			// TODO: handle recursive inclusion, make ssi operation async
			fs.readFile(filepath, function(err, data) {
				if(!err) {
					data = data.toString() // TODO: GBK Encoding detection?
					//console.log('data is: ' + data)
					var parsed = ssiParser.parse(filepath, data)
					if(!(/^_/.test(path.basename(filepath)))) {
						if(req.headers['user-agent'].indexOf("MSIE") >= 0) {
							var myNav = req.headers['user-agent'];
    						var IEbrowser = parseInt(myNav.split('MSIE')[1]) 
    						if(IEbrowser > 9) {
    							addLrScript()
    						}
						} else {
							addLrScript()
						}
						
					}
					function addLrScript() {
						parsed.contents = parsed.contents.replace('</body>', '<script src="//' + req.hostname + ':35730/livereload.js' + '"></script></body>')
					}
					res.send(parsed.contents)
				} else {
					next()
				}
			})
		}
	}

	return {
		middleware: middleware,
		// TODO: watcher notify ssi update
		flush: function(name) {
			delete pathMap[name]
		}
	}
}