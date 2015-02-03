# coffee -bcw enhancedMain.coffee

gui = require('nw.gui')
path = require('path')



Button = Remix.create
	template: '<button type="button" class="btn"></button>'
	remixEvent:
		'click': 'clickCallback'
	render: (data) ->
		@node.attr 'class', "btn btn-#{data.type} btn-#{data.size}"
		@node.text data.title
		@clickCallback = data.onclick

LoadedItem = Remix.create
	remixChild:
		Button: Button

	template: """
		<div class="col-sm-6 col-md-4" style="display: none">
			<div class="panel panel-primary">
				<div class="panel-heading">
					<button remix="Button" data-type="danger" data-size="xs" data-onclick="@unloadProject" data-title="X" key="unloadBtn"></button> &nbsp;&nbsp;<span ref="pathtxt"></span>
				</div>
				<div class="panel-body">
					
					<ul class="list-group" ref="urlList">
						
					</ul>

					<div class="alert alert-info alert-dismissible" role="alert" ref="alert" style="display: none;">
					  <button type="button" class="close" data-dismiss="alert" ref="closeAlert"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
					  <div ref="alertMsg"></div>
					</div>
				</div>
				<div class="panel-footer">
					<p class="text-right">
			  			<button remix="Button" data-type="primary" data-size="xs" data-onclick="@configProject" data-title="配置" key="configBtn"></button>
			  			<button remix="Button" data-type="info" data-size="xs" data-onclick="@openDirectory" data-title="打开目录" key="openDirBtn"></button>
			  			<button remix="Button" data-type="danger" data-size="xs" data-onclick="@packProject" data-title="打包" key="packBtn"></button>
				  	</p>
				</div>
			</div>
		</div>
	"""

	remixEvent:
		'click, li a, urlList': 'openLink'
		'change, li [type="radio"], urlList': 'switchRoot'
		'click, closeAlert': 'closeMsg'

	onNodeCreated: ->
		@appendTo('#loaded-container')

	initialRender: ->
		#gui.Shell.openExternal(@state.urls[0]) if @state.urls[0]

	render: (data) ->
		@refs.pathtxt.text data.path
		@refs.urlList.empty()
		data.urls.forEach (url) =>
			@refs.urlList.append """
				<li class="list-group-item"><a href="#{url}">#{url}</a><span style="float:right"><input type="radio" name="root" data-url="#{url}"></span></li>
			"""
		# {@openDirectory, @unloadProject, @configProject, @packProject} = data
		@unloadProject = data.unloadProject
		@node.slideDown('fast')


	closeMsg: ->
		@refs.alert.slideUp()

	openLink: (e) ->
		e.preventDefault()
		$this = $(e.target)
		gui.Shell.openExternal($this.attr('href'))

	openDirectory: ->
		projPath = @refs.pathtxt.text()
		gui.Shell.showItemInFolder(projPath)

	configProject: ->
		#gui.Window.open('mordenConfig.html?id=' + @key)
		configPage(@key)

	switchRoot: (e) ->

		@state.switchRoot($(e.target).data('url'))

	packProject: ->
		packProject(@key, @refs.pathtxt.text(), this)

	slideDestroy: ->
		@node.slideUp 'fast', =>
			@destroy()

	openOutput: ->
		projPath = path.join(@refs.pathtxt.text(), 'output')
		gui.Shell.showItemInFolder(projPath)

	msg: (msg) ->
		@refs.alertMsg.html(msg)
		@refs.alert.slideDown()


historyItem = Remix.create
	remixChild:
		Button: Button
	template: """
		<li class="list-group-item">
			<span ref="projPath" class="pathTitle" title=""></span>
			<span class="pull-right"><button type="button" remix="Button" class="btn btn-info btn-xs" data-type="info" data-size="xs" data-title="装载" data-onclick="@loadProject">装载</button>
			</span>
		</li>
	"""
	loadProject: ->
		projectPath = @key
		loadProject(@key)
	render: ->
		@refs.projPath.text(@key).attr('title', @key)


loadHistory = Remix.create
	remixChild:
		historyItem: historyItem
	template: '<ul class="list-group"></ul>'
	onNodeCreated: ->
		$('#historyContainer').empty().append(@node)
	render: (data) -> # should data be a array
		storedPaths = projectPaths.get()
		for history in storedPaths
			@append @historyItem null, history # history is the key
reloadHistory = loadHistory


Dialog = Remix.create
	template: """
		<div class="modal">
			<div class="modal-backdrop fade in"></div>
		  <div class="modal-dialog">
		    <div class="modal-content">
		      <div class="modal-header">
		        <button type="button" class="close" aria-label="Close"><span aria-hidden="true" ref="closeButton">&times;</span></button>
		        <h4 class="modal-title" ref="title">Modal title</h4>
		      </div>
		      <div class="modal-body" ref="body">
		        <p>Loading...</p>
		      </div>
		      <div class="modal-footer" ref="footer">
		      	
		      </div>
		    </div><!-- /.modal-content -->
		  </div><!-- /.modal-dialog -->
		</div>
	"""

	remixEvent:
		'click, closeButton': 'slideAway'

	onNodeCreated: ->
		@appendTo(document.body)

	render: (data) ->
		@refs.title.text data.title
		@refs.body.empty()
		@include data.content, @refs.body

		if data.buttons 
			@include data.buttons, @refs.footer
			@refs.footer.show()
		else @refs.footer.hide()

		@node.slideDown()

	slideAway: ->
		@node.slideUp 300, =>
			@destroy()

choosePort = (callback) ->
	portNum = ''
	portDialog = Dialog
		title: '80端口已被占用，请输入你想要的端口号'
		content: Remix.create
			template: """
				<div class="input-group">
					<input type="text" class="form-control" ref="portNum">
					<div class="input-group-btn">
						<button type="button" class="btn btn-primary" tabindex="-1" ref="okbtn">确认</button>
					</div>
				</div>
			"""
			remixEvent:
				'keyup, portNum': 'updatePortNum',
				'click, okbtn': 'savePort'

			updatePortNum: ->
				val = @refs.portNum.val()
				if /[^\d]/.test val
					val = val.replace(/[^\d]/g, '')
					@refs.portNum.val(val)
				portNum = val

			savePort: ->
				if portNum.length
					callback?(parseInt(portNum))
					LoadedItem.getAll()?.forEach (l) ->
						l.state.reload()
					portDialog.slideAway()
				else
					alert "亲"

setAuthor = ->
	dialog = Dialog
		title: '设置作者信息'
		content: Remix.create
			template: """
				<form class="form-horizontal" role="form">
				  <div class="form-group">
				    <label for="author_name" class="col-sm-2 control-label">Name</label>
				    <div class="col-sm-10">
				      <input type="text" class="form-control" id="author_name" placeholder="英文ID，无空格" ref="name">
				    </div>
				  </div>
				  <div class="form-group">
				    <label for="author_email" class="col-sm-2 control-label">Email</label>
				    <div class="col-sm-10">
				      <input type="email" class="form-control" id="author_email" placeholder="邮件地址" ref="email">
				    </div>
				  </div>
				  <div class="form-group">
				    <label for="author_email" class="col-sm-2 control-label">Url</label>
				    <div class="col-sm-10">
				      <input type="url" class="form-control" id="author_email" placeholder="作者主页" ref="url">
				    </div>
				  </div>
				  
				  <div class="form-group">
				    <div class="col-sm-offset-2 col-sm-10">
				      <button type="submit" class="btn btn-default">保存</button>
				    </div>
				  </div>
				</form>
			"""
			remixEvent:
				"submit": "onSubmit"
			infoKeys: ['name', 'email', 'url']
			render: ->
				storedInfo = store('author')
				if storedInfo
					for inputName in @infoKeys
						@refs[inputName].val(storedInfo[inputName])

			onSubmit: (e) ->
				#TODO: input Remix that validates itself as common validator
				e.preventDefault()
				info = {}
				for inputName in @infoKeys
					info[inputName] = @refs[inputName].val()
				store('author', info)
				dialog.slideAway()

frameWindow = Remix.create
	template: """
		<div class="configPage">
			<iframe ref="frame" src="" frameborder="0"></iframe>
		</div>
	"""
	onNodeCreated: ->
		@appendTo(document.body)
	render: ->
		$(document.body).css('overflow-y', 'hidden')
		@refs.frame.attr('src', @state.src)
	onDestroy: ->
		@state.onDestroy?()
		$(document.body).css('overflow-y', '')
		global.console = window.console

configPage = (id) ->
	frameWindow({
		src: 'mordenConfig.html?id=' + id,
		onDestroy: ->
			LoadedItem.get(id)?.state.reload()
	})

