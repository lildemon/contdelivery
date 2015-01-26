var _ = require('lodash')
var projectLib = require('./projectLib')
var id = getURLParameter('id')
var project = projectLib.getProjectById(id)

project.updateMiddleware()

var vms = {
	"virtual-directory": (function() {
		var $vm = avalon.define({
			$id: "virtual-directory",
			dirs: [],
			newDir: function() {
				$vm.dirs.push({
					name: '',
					dir: ''
				})
			}
		})

		var dirs = project.getConfig('dirs')
		if(dirs && dirs.length) {
			$vm.pushArray(dirs)
		}

		return $vm
	})(),

	"entry-manager": (function() {
		var $vm = avalon.define({
			$id: "entry-manager",
			entries: [],
			containsChange: function(e, i) {
				var char = String.fromCharCode(e.which)
				if(char == ' ' || char == ',') {
					e.preventDefault()
					if(e.target.value) {
						var entry = $vm.entries[i]
						entry.contains.push(e.target.value)
						e.target.value = ''
					}
				}
				
			},
			newEntry: function() {
				$vm.entries.push({
					name: '',
					containsInput: '',
					contains: [],
					isCommon: false
				})
			}
		})

		var entries = project.getConfig('webpack.entry')
		var common = project.getConfig('webpack.common')
		if(entries) {
			for(var name in entries) {
				$vm.entries.push({
					isCommon: common == name,
					contains: entries[name],
					name: name
				})
			}
		}

		return $vm
	})()
}

avalon.scan()