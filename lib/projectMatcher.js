// call project specific middleware(app)
var _ = require('lodash')
var installedProject = []
var installedVirtual = []

var middleware = module.exports = function(req, res, next) {
	_.forEach(installedProject.concat(installedVirtual), function(inst) {
		if(inst.matchDomain(req.hostname)) {
			req.handler = inst
			inst.getMiddleware()(req, res, next)
			return false
		}
	})
	if(!req.handler) {
		next('No project found, List all project')
	}
}

middleware.installedProject = installedProject
middleware.installedVirtual = installedVirtual
