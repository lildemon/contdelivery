var fs = require('fs')
var path = require('path')
var Datastore = require('nedb')
var extend = require('extend')
var Base = require('./Base')
var util = require('util')
var ssiMiddleware = require('./middleware/ssi')
var sassMiddleware = require('./middleware/sass')
var webpackMiddleware = require('./middleware/webpack')
var express = require('express')
var Watcher = require('./Watcher')
// var livepool...
//var ProjectModel = require('./ProjectModel')

module.exports = Project

function Project(projectPath) {
	// use project model to store mock data definition, etc
	this.path = projectPath
	this.workingDirName = 'wwwroot'
	this.db = new Datastore({ filename: path.join(projectPath, 'DEV-INF', 'project.db'), autoload: true })
	this.watcher = new Watcher(this)
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
					type: "wpconf",
					projectPath: self.path,
					wwwPath: path.join(self.path, self.workingDirName)
					// 自定义变量、common插件选项
				}
				self.saveData({type: 'wpconf'}, self.wpconf)
			} else {
				self.wpconf = doc
			}
			var wpserver = webpackMiddleware(self.wpconf)
			self._activeWPMiddleware = wpserver.middleware
			self._activeCompiler = wpserver.compiler
			self.watcher.bindCompiler(self._activeCompiler)
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
		router.use(ssiMiddleware(path.join(this.path, this.workingDirName)).middleware)
		router.use(sassMiddleware(path.join(this.path, this.workingDirName)).middleware)
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
		// 新建watcher， 跑一次compile获取filedependency，或者直接监控webroot， 一有变化根据变化的文件来判断是需要怎么通知？

	},
	initDir: function() {
		// TODO: use grunt-init task to create new proj dir
	},
	close: function() {
		this._activeWPMiddleware.close()
		this.watcher.close()
	}
})


Project.isValid = function(projectPath) {
	return fs.existsSync(projectPath)
}