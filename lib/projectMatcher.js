// call project specific middleware(app)
var _ = require('lodash')
var installedProject = {}
var installedVirtual = {}
var defaultId = null

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
		if(defaultId && installedProject[defaultId]) {
			req.handler = installedProject[defaultId]
			req.handler.getMiddleware()(req, res, next)
		} else {
			next('No project found, List all project')
		}
		
	}
}

middleware.installedProject = installedProject
middleware.installedVirtual = installedVirtual
middleware.setDefault = function(id) {
	defaultId = id
}