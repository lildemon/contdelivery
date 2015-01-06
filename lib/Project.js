var fs = require('fs')
var path = require('path')
var Datastore = require('nedb')
var extend = require('extend')
var Base = require('./Base')
var util = require('util')
var ssiMiddleware = require('./middleware/ssi')
var webpackMiddleware = require('./middleware/webpack')
var express = require('express')
// var livepool...
//var ProjectModel = require('./ProjectModel')

module.exports = Project

function Project(projectPath) {
	// use project model to store mock data definition, etc
	this.path = projectPath
	this.db = new Datastore({ filename: path.join(projectPath, 'DEV-INF', 'project.db'), autoload: true })
	this.updateMiddleware()
	this.initVDomains()
}

util.inherits(Project, Base)

extend(Project.prototype, {
	getMocks: function(callback) {
		// TODO: save to this.mocks or init this.mocks
		this.db.findOne({type: 'mock'}, callback)
	},
	saveMock: function(mockData, callback) {
		this.db.update({type: 'mock'}, mockData, {upsert: true}, callback)
		this.updateMiddleware()
	},
	installWebpack: function(router) {
		var self = this
		this.db.findOne({type: 'wpconf'}, function(err, doc) {
			if(!doc) {
				self.wpconf = {
					/* wpconf default */
					projectPath: self.path,
					wwwPath: path.join(self.path, 'wwwroot')
				}
				self.saveData({type: 'wpconf'}, self.wpconf)
			} else {
				self.wpconf = doc
			}
			var wpserver = webpackMiddleware(self.wpconf)
			self._activeWPMiddleware = wpserver.middleware
			router.use(wpserver.app)
		})
	},
	saveData: function(query, data, callback) {
		this.db.update(query, data, {upsert: true}, callback)
	},
	initVDomains: function() {
		var self = this
		this.db.findOne({type: 'vdomain'}, function(err, doc) {
			if(!doc) {
				self.vdomains = []
				self.saveData({type: 'vdomain'}, {vdomains: self.vdomains})
			} else {
				self.vdomains = doc.vdomains
			}
		})
	},
	updateMiddleware: function() {
		if(this.middleware) {
			// close existing watchers
			this._activeWPMiddleware.close()
		}
		var router = this.middleware = express.Router()
		router.use(ssiMiddleware(path.join(this.path, 'wwwroot')).middleware)
		this.installWebpack(router)
		//this.installMock(router)
		//this.installPool(router)
	},
	getMiddleware: function() {
		// middleware might change, so we need to call it on every request
		return this.middleware
	},
	initWatcher: function() {
		// TODO: unified file watcher
	},
	initDir: function() {
		// TODO: use grunt-init task to create new proj dir
	}
})


Project.isValid = function(projectPath) {
	return fs.existsSync(projectPath)
}