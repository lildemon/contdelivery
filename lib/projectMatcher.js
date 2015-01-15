// call project specific middleware(app)
var _ = require('lodash')
var installedProject = {}
var installedVirtual = {}

var middleware = module.exports = function(req, res, next) {
	// TODO: match project base on project's vhost configure
	/*_.forEach(installedProject.concat(installedVirtual), function(inst) {
		if(inst.matchDomain(req.hostname)) {
			req.handler = inst
			inst.getMiddleware()(req, res, next)
			return false
		}
	})*/
	var idx = req.hostname.split('.')[0]
	if(installedProject[idx]) {
		req.handler = installedProject[idx]
		req.handler.getMiddleware()(req, res, next)
	}
	
	/*if(installedProject[idx]) {
		req.handler = installedProject[idx]
		req.handler.getMiddleware()(req, res, next)
	}*/

	if(!req.handler) {
		next('No project found, List all project')
	}
}

middleware.installedProject = installedProject
middleware.installedVirtual = installedVirtual
