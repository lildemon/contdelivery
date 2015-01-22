// var Watcher = require('webpack/lib/NewWatchingPlugin')


var Watchpack = require("watchpack")
var extend = require('extend')
var path = require('path')
var url = require('url')


// Start a tiny-lr server
var lrServer = require('tiny-lr')()
lrServer.listen(35730, function() {}) // standard port is 35729



// TODO: liveReload protocol & no webpack project refresh support
var Watcher = module.exports = function(project) {
	this.project = project
	this.renewWatcher()
	this.renewTimer = setInterval(function() {
		this.watcher.close()
		this.renewWatcher()
	}.bind(this), 1000 * 60 * 10) //10分钟更新一次watcher
}

Watcher.sockets = null

extend(Watcher.prototype, {
	onFileChange: function(filePath, mtime) {
		if(Watcher.sockets) {
			Watcher.sockets.emit('fileChange', {
				project: this.project.path,
				file: filePath,
				mtime: mtime
			})
		}
	},
	renewWatcher: function() {
		this.watcher = new Watchpack({
			aggregateTimeout: 1000
		})
		this.watcher.on('change', this.onFileChange.bind(this))
		this.watcher.on('aggregated', this.onAggregate.bind(this))
		this.watchTime = Date.now()
		this.watcher.watch([], [path.join(this.project.path, this.project.workingDirName)], this.watchTime)
	},
	onAggregate: function(changes) {
		// TODO: recompile based on file type
		// TODO: on certian condition, force recompile (file not in dependency, etc..)

		if('changes match webpack dependencies') {
			/*if(this.compiling) {
				this.wpInvalid = true
				return
			}
			if(this.compiler) {
				this.compiler.applyPlugins('invalid')
			}*/
			var files = this.watcher.getTimes()
			var changedFiles = []
			for(var file in files) {
				if(files[file] > this.watchTime) {
					changedFiles.push(file)
					if(!!~file.indexOf('.scss')) {
						changedFiles.push(file.replace('.scss', '.css'))
					}
					console.log('File Changed: ' + file)
				}
			}
			this.notifyLrClients(changedFiles)
			this.watchTime = Date.now()
			//this.project._activeWPMiddleware.invalidate()
		}

	},

	bindCompiler: function(compiler) {
		this.compiler = compiler

		// TODO: compiler run once to collect file dependency

		var invalidPlugin = function() {
			if(Watcher.sockets) Watcher.sockets.emit("invalid");
		}.bind(this)
		compiler.plugin("compile", invalidPlugin);
		compiler.plugin("invalid", invalidPlugin);
		compiler.plugin("done", function(stats) {
			if(!Watcher.sockets) return;
			this._sendStats(Watcher.sockets, stats.toJson());
			this._stats = stats;
		}.bind(this))
	},
	notifyLrClients: function(files) {
		var projId = this.project.id
		if(projId) {
			var client, hostpart
			for(var id in lrServer.clients) {
				client = lrServer.clients[id]
				if(client.url) {
					hostpart = url.parse(client.url).host
					if(!!~(hostpart.split('.')[0]).indexOf(projId)) {
						client.reload(files)
					}
				}
			}
		}
	},
	_sendStats: function(socket, stats, force) {
		// TODO: project specific emit
		if(!force && stats && stats.assets && stats.assets.every(function(asset) {
			return !asset.emitted;
		})) return;
		socket.emit("hash", stats.hash);
		if(stats.errors.length > 0)
			socket.emit("errors", stats.errors);
		else if(stats.warnings.length > 0)
			socket.emit("warnings", stats.warnings);
		else
			socket.emit("ok");
		var files = []
		stats.chunks.forEach(function(c) {
			files.push(c.files[0])
		})
		this.notifyLrClients(files)
	},
	close: function() {
		clearInterval(this.renewTimer)
		this.watcher.close()
	}
})