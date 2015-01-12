// var Watcher = require('webpack/lib/NewWatchingPlugin')


var Watchpack = require("watchpack")
var extend = require('extend')
var path = require('path')

// TODO: liveReload protocol & no webpack project refresh support
var Watcher = module.exports = function(project) {
	this.project = project
	this.watcher = new Watchpack({
		aggregateTimeout: 1000
	})
	this.watcher.on('change', this.onFileChange.bind(this))
	this.watcher.on('aggregated', this.onAggregate.bind(this))
	this.watchTime = Date.now()
	this.watcher.watch([], [path.join(project.path, project.workingDirName)], this.watchTime)

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
			for(var file in files) {
				if(files[file] > this.watchTime) {
					console.log('File Changed: ' + file)
				}
			}
			this.watchTime = Date.now()
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
	},
	close: function() {
		this.watcher.close()
	}
})