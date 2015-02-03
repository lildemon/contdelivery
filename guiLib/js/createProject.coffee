path = require('path')
fs = require('fs')

gui = require('nw.gui')
win = gui.Window.get()
win.focus()

wrench = require('wrench')
scaffoldingDir = path.join(path.dirname(process.execPath), 'scaffolding')
Remix.create
	remixEvent:
		'click, close': 'close'
		'click, chooseBasic': 'chooseBasic'
		'click, chooseWebpack': 'chooseWebpack'
	chooseBasic: ->
		unless @projectPath
			alert '找不到项目目录'
			return
		whenChoose('basic', @projectPath)
	chooseWebpack: ->
		@chooseBasic()
	close: ->
		top.frameWindow.get().destroy()
	render: ->
		@projectPath = top.getCreatingProjectPath()
		@refs.currentPath.text(@projectPath)
.bindNode document.getElementById('container')

whenChoose = (type, destPath) ->
	authorInfo = $.extend({}, store('author'))
	dialog = Dialog
		title: "确认项目信息"
		content: Remix.create
			remixEvent:
				'submit': 'onSubmit'
			template:"""
				<form class="form-horizontal" role="form">
				  <div class="form-group">
				    <label for="project_name" class="col-sm-2 control-label">项目名称</label>
				    <div class="col-sm-10">
				      <input type="text" class="form-control" id="project_name" placeholder="英文ID，无空格" ref="projectName" name="name">
				    </div>
				  </div>
				  <div class="form-group">
				    <label for="project_description" class="col-sm-2 control-label">项目简介</label>
				    <div class="col-sm-10">
				      <input type="text" class="form-control" id="project_description" name="description">
				    </div>
				  </div>
				  <div class="form-group">
				    <label for="project_version" class="col-sm-2 control-label">版本号</label>
				    <div class="col-sm-10">
				      <input type="text" class="form-control" id="project_version" value="0.1.0" name="version">
				    </div>
				  </div>
				  <div class="form-group">
				    <label for="project_homepage" class="col-sm-2 control-label">项目主页</label>
				    <div class="col-sm-10">
				      <input type="url" class="form-control" id="project_homepage" name="homepage">
				    </div>
				  </div>
				  <div class="form-group">
				    <label for="author_name" class="col-sm-2 control-label">作者Name</label>
				    <div class="col-sm-10">
				      <input type="text" class="form-control" id="author_name" placeholder="英文ID，无空格" ref="name" name="author">
				    </div>
				  </div>
				  <div class="form-group">
				    <label for="author_email" class="col-sm-2 control-label">Email</label>
				    <div class="col-sm-10">
				      <input type="email" class="form-control" id="author_email" placeholder="邮件地址" ref="email" name="email">
				    </div>
				  </div>
				  <div class="form-group">
				    <label for="author_url" class="col-sm-2 control-label">Url</label>
				    <div class="col-sm-10">
				      <input type="url" class="form-control" id="author_url" placeholder="作者主页" ref="url" name="url">
				    </div>
				  </div>
				  
				  <div class="form-group">
				    <div class="col-sm-offset-2 col-sm-10">
				      <p><strong>注：当前目录下的文件将被清空</strong></p>
				      <button type="submit" class="btn btn-default">保存</button>
				    </div>
				  </div>
				</form>
			"""
			infoKeys: ['name', 'email', 'url']
			onSubmit: (e) ->
				e.preventDefault()
				scaffoldingProjPath = path.join(scaffoldingDir, type)
				try
					wrench.copyDirSyncRecursive scaffoldingProjPath, destPath, 
						forceDelete: true
						preserveFiles: true
					pkgInfo = {}
					@node.serializeArray().forEach (nameVal) ->
						pkgInfo[nameVal.name] = nameVal.value
					fs.writeFileSync(path.join(destPath, 'package.json'), JSON.stringify(pkgInfo, null, 4))
					top.loadProject(destPath)
					top.frameWindow.get().destroy()
				catch error
					Dialog
						title: '创建项目脚手架失败，可能是目录不为空并且已被打开'
						content: error

				#copy files and generate package.json

			render: ->
				for inputName in @infoKeys
					@refs[inputName].val(authorInfo[inputName]) if authorInfo[inputName]