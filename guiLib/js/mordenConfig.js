var _ = require('lodash')
var projectLib = require('./projectLib')
var id = getURLParameter('id')
var project = projectLib.getProjectById(id)

project.updateMiddleware()
var dirty = false
$('table').on('click', function() {
	dirty = true
})
$('#currentPath').text(project.path)

var SaveAll = function() {
	var d = Dialog({
		title: "是否保存更改？",
		content: Remix.create({
			template: [
				'<p style="text-align: right">',
				'<button type="button" class="btn btn-info" tabindex="-1" ref="cancelbtn">否</button>',
				'<button type="button" class="btn btn-primary" tabindex="-1" ref="okbtn">是</button>',
				'</p>'
			].join('\n'),
			remixEvent: {
				'click, okbtn': 'save',
				'click, cancelbtn': 'cancel' // ref 和对象方法不要重名
			},
			onDestroy: function() {
				top.frameWindow.get().destroy()
			},
			save: function() {
				for(var vm in vms) {
					vms[vm].save()
				}
				project.saveProjConfig(function() {
					project.updateMiddleware()
				})
				d.destroy()
			},
			cancel: function() {
				d.destroy()
			}
		})
	})
}

$('#closeWin').click(function() {
	if(dirty) {
		SaveAll()
	} else {
		top.frameWindow.get().destroy()
	}
})

var saveSingle = function(vm) {
	vm.save()
	project.saveProjConfig(function() {
		project.updateMiddleware()
		dirty = false
		alert('保存成功')
	})
}

var parseContainInput = function(event) {
	var char = String.fromCharCode(event.which)
	if(event.keyCode == 13 || !event.which || char == ' ' || char == ',' && event.target.value) {
		event.preventDefault()
		return event.target.value
	}
	return null
}
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
			},
			selectDir: function(e, i) {
				var val = e.target.value
				if(val) {
					$vm.dirs[i].dir = val
				}
			},
			save: function() {
				var saveArr = $vm.dirs.$model.filter(function(def) {
					return !!(def.name && def.dir)
				})
				project.setConfig('dirs', saveArr)
			},
			saveBtn: function() {
				saveSingle($vm)
			}
		})

		function loadDirs() {
			var dirs = project.getConfig('dirs')
			if(dirs && dirs.length) {
				$vm.dirs.clear()
				$vm.dirs.pushArray(dirs)
			}
		}
		loadDirs()
		

		return $vm
	})(),

	"entry-manager": (function() {

		var $vm = avalon.define({
			$id: "entry-manager",
			entries: [],
			containsChange: function(e, i) {
				var val = parseContainInput(e)
				if(val) {
					$vm.entries[i].contains.push(val)
					e.target.value = ''
				}
			},
			changeCommon: function(e, i) {
				if(e.target.checked) {
					$vm.entries.forEach(function(entry, iter_i) {
						if(iter_i == i) return
						entry.isCommon = false
					})
					currentCommonIndex = i
					//$vm.entries[i].isCommon = true
				}
			},
			newEntry: function() {
				$vm.entries.push({
					name: '',
					containsInput: '',
					contains: [],
					isCommon: false
				})
			},
			saveBtn: function() {
				saveSingle($vm)
			},
			save: function() {
				var wpEntry = {}, commonName = ''
				$vm.entries.$model.filter(function(entry) {
					return !!entry.name
				}).forEach(function(entry) {
					wpEntry[entry.name] = entry.contains
					if(entry.isCommon) {
						commonName = entry.name
					}
				})
				project.setConfig('webpack.entry', wpEntry)
				project.setConfig('webpack.common', commonName)
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
	})(),

	// TODO: webpack alias etc..

	"pack-dir": (function() {
		var $vm = avalon.define({
			$id: "pack-dir",
			name: "",
			save: function() {
				project.setConfig('webpack.packDirName', $vm.$model.name)
			},
			saveBtn: function() {
				saveSingle($vm)
			}
		})
		$vm.name = project.getConfig('webpack.packDirName') || 'packed'
		return $vm
	})(),

	"redir": (function() {
		var props = ['redir', 'min', 'png', 'mincss', 'minjs', 'autoReflow', 'autoCombine', 'absolute', 'md5', 'gbk']
		var $vm = avalon.define({
			$id: "redir",
			redir: false,
			min: false,
			png: false,
			mincss: false,
			minjs: false,
			autoReflow: false,
			autoCombine: false,
			md5: false,
			absolute: false,
			gbk: false,
			saveBtn: function() {
				saveSingle($vm)
			},
			save: function() {
				props.forEach(function(prop) {
					project.setConfig('fispack.' + prop, $vm.$model[prop])
				})
				// 开启fis的md5同时开启webpack的bundle的hash
				project.setConfig('webpack.hash', $vm.$model.md5)
			}
		})


		;['autoReflow', 'autoCombine', 'md5', 'absolute'].forEach(function(prop) {
			// md5 support need useStandard to redir src=""
			$vm.$watch(prop, function(checked) {
				if(checked) {
					$vm.redir = true
				}
			})
		})

		props.forEach(function(prop) {
			$vm[prop] = !!project.getConfig('fispack.' + prop)
		})

		return $vm

	})(),

	"custom-pack": (function() {
		var $vm = avalon.define({
			$id: 'custom-pack',
			packs: [],
			containsChange: function(e, i) {
				var val = parseContainInput(e)
				if(val) {
					$vm.packs[i].contains.push(val)
					e.target.value = ''
				}
			},
			newPack: function() {
				$vm.packs.push({
					name: '',
					containsInput: '',
					contains: []
				})
			},
			saveBtn: function() {
				saveSingle($vm)
			},
			save: function() {
				var fisPack = {}
				$vm.$model.packs.filter(function(pack) {
					return !!pack.name
				}).forEach(function(pack) {
					fisPack[pack.name] = pack.contains
				})
				project.setConfig('fispack.pack', fisPack)
			}
		})

		var packs = project.getConfig('fispack.pack')
		if(packs) {
			for(var name in packs) {
				$vm.packs.push({
					contains: packs[name],
					name: name
				})
			}
		}

		return $vm
	})(),

	"fis-domain-image": (function() {
		var $vm = avalon.define({
			$id: "fis-domain-image",
			domains: [],
			domainsChange: function(e) {
				var val = parseContainInput(e)
				if(val) {
					$vm.domains.push(val)
					e.target.value = ''
				}
			},
			save: function() {
				var imgDomains = $vm.$model.domains.map(function(domain) {
					return domain.trim()
				})
				project.setConfig('fispack.domain.images', imgDomains)
			},
			saveBtn: function() {
				saveSingle($vm)
			}
		})

		var domains = project.getConfig('fispack.domain.images')
		if(domains && domains.length) {
			domains.forEach(function(domain) {
				$vm.domains.push(domain)
			})
				
		}

		return $vm
	})(),

	"domain-global": (function() {
		var $vm = avalon.define({
			$id: "domain-global",
			domain: '',
			save: function() {
				project.setConfig('fispack.domain.global', $vm.$model.domain)
				project.setConfig('webpack.domain', $vm.$model.domain)
			},
			saveBtn: function() {
				saveSingle($vm)
			}
		})

		$vm.domain = project.getConfig('fispack.domain.global')

		return $vm
	})(),

	"fis-domain-custom": (function() {
		var $vm = avalon.define({
			$id: "fis-domain-custom",
			customs: [],
			domainsChange: function(e, i) {
				var val = parseContainInput(e)
				if(val) {
					$vm.customs[i].domains.push(val)
					e.target.value = ''
				}
			},
			newCustom: function() {
				$vm.customs.push({
					domains: [],
					glob: ''
				})
			},
			save: function() {
				var customs = {}
				$vm.$model.customs.filter(function(custom) {
					return !!custom.glob
				}).map(function(custom) {
					customs[custom.glob] = custom.domains
				})
				project.setConfig('fispack.domain.customs', customs)
			},
			saveBtn: function() {
				saveSingle($vm)
			}
		})

		var customs = project.getConfig('fispack.domain.customs')
		if(customs) {
			var custom
			for(var glob in customs) {
				custom = customs[glob]
				$vm.customs.push({
					glob: glob,
					domains: custom
				})
			}
		}
		return $vm
	})()
}

avalon.scan()