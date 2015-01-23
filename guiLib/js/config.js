
var _ = require('lodash')
//global.console = console
var saveOperations = {
	saveEntry: function(callback) {
		project.projectConfig.webpack.entry = {}
		project.projectConfig.webpack.common = ''
		var $comp = $('#entryConfig')
		var entry = {}
		$comp.find('.form-group').each(function() {
			var $this = $(this)
			var name = $this.find('input[name="entryName"]').val()
			name = $.trim(name)
			if(name) {
				entry[name] = $this.find('input[name="entryFiles"]').tagsinput('items')
			}
		})
		project.projectConfig.webpack.entry = entry

		var $commonChecked = $comp.find('.commonCheck:checked').eq(0)
		if($commonChecked.length) {
			var commonName = $commonChecked.closest('.form-group').find('[name="entryName"]').val()
			if(commonName) {
				project.projectConfig.webpack.common = commonName
			}
			
		} 

		project.saveProjConfig(callback)
	},
	savePackDir: function(callback) {
		var $comp = $('#packNameConfig')
		var dirName = $comp.find('[name="packDirName"]').val()
		if(!dirName) {
			alert('请输入dir名字')
			return
		}
		project.projectConfig.webpack.packDirName = dirName
		project.saveProjConfig(callback)
	},
	saveAutoCombine: function(callback) {
		project.setConfig('fispack.autoCombine', $('#autoCombine input[type="checkbox"]').prop('checked'))
		project.saveProjConfig(callback)
	},
	saveAutoReflow: function(callback) {
		project.setConfig('fispack.autoReflow', $('#autoReflow input[type="checkbox"]').prop('checked'))
		project.saveProjConfig(callback)
	},
	saveMin: function(callback) {
		project.setConfig('fispack.min', $('#min input[type="checkbox"]').prop('checked'))
		project.saveProjConfig(callback)
	}
}

var afterSaveOperations = {
	// get after save from save btn's parent
}

function parallelSave(arr, callback) {
	// parallel save operations, optionally calls callback after all done
	var count = arr.length
	var finishCount = 0
	var checkDone = function() {
		if(finishCount == count) {
			callback()
		}
	}
	arr.forEach(function(s) {
		saveOperations[s](function(err) {
			finishCount++
			checkDone()
		})
	})
}



var projectLib = require('./projectLib')
var id = getURLParameter('id')
var project = projectLib.getProjectById(id)


void function() {
	if(!project) {
		alert('找不到该项目')
		return
	}

	project.updateMiddleware()
}()

//Fis Pack
void function() {
	var $combComp = $('#autoCombine')
	var $reflowComp = $('#autoReflow')
	var $minComp = $('#min')

	project.getProjConfig(function(conf) {
		var fispack = conf.fispack
		if(fispack) {
			if(fispack.autoCombine) {
				$combComp.find('[type="checkbox"]').prop('checked', true)
			}
			if(fispack.autoReflow) {
				$reflowComp.find('[type="checkbox"]').prop('checked', true)
			}

			if(fispack.min) {
				$minComp.find('[type="checkbox"]').prop('checked', true)
			}
		}
		
	})

	$combComp.on('click', '.btnSave', function() {
		saveOperations['saveAutoCombine'](function() {
			alert('保存成功')
		})
	})

	$reflowComp.on('click', '.btnSave', function() {
		saveOperations['saveAutoReflow'](function() {
			alert('保存成功')
		})
	})
	$minComp.on('click', '.btnSave', function() {
		saveOperations['saveMin'](function() {
			alert('保存成功')
		})
	})
}()

//Pack Dir Name
void function() {
	var $comp = $('#packNameConfig')
	project.getProjConfig(function(conf) {
		var wpconf = conf.webpack
		if(wpconf.packDirName) {
			$comp.find('[name="packDirName"]').val(wpconf.packDirName)
		}
	})

	$comp.on('click', '.savePackDirBtn', function() {
		saveOperations['savePackDir'](function() {
			alert('保存成功')
		})
		project.updateMiddleware()
	})
}()

//Entrys
void function() {
	var $comp = $('#entryConfig')
	var $rows = $comp.find('.rows')

	$comp.find('.newEntryBtn').click(function() {
		newRow()
	})
	$comp.on('click', '.removeEntryBtn', function() {
		$(this).closest('.form-group').remove()
	})
	.on('click', '.saveEntryBtn', function() {
		saveOperations['saveEntry'](function() {
			alert('保存成功')
		})
		project.updateMiddleware()
	})
	.on('change', '.commonCheck', function() {
		var $this = $(this)
		if($this.prop('checked')) {
			$comp.find('.commonCheck').not($this).prop('checked', false)
		}
	})

	project.getProjConfig(function(conf) {
		var wpconf = conf.webpack
		var name, files, isCommon = false
		if(wpconf.entry) {
			for(name in wpconf.entry) {
				isCommon = (wpconf.common && wpconf.common == name)
				files = wpconf.entry[name]
				newRow(name, files, isCommon)
			}
		}

	})

	function newRow(name, entries, isCommon) {
		$row = $($.parseHTML(tmpl('entry_row', {
			name: name,
			entrystr: $.isArray(entries) ? entries.join(',') : '',
			isCommon: isCommon
		})))
		$rows.append($row)
		$row.find('input.tags').tagsinput()
	}

}()