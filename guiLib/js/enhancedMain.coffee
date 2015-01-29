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
					
					<ul ref="urlList">
						
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
		'click, [ref="urlList"] li a': 'openLink'
		'click, [ref="closeAlert"]': 'closeMsg'

	onNodeCreated: ->
		@appendTo('#loaded-container')

	render: (data) ->
		@pathtxt.text data.path
		@urlList.empty()
		data.urls.forEach (url) =>
			@urlList.append """
				<li><a href="#{url}">#{url}</a></li>
			"""
		# {@openDirectory, @unloadProject, @configProject, @packProject} = data
		@unloadProject = data.unloadProject
		@node.slideDown('fast')

	closeMsg: ->
		@alert.slideUp()

	openLink: (e) ->
		e.preventDefault()
		$this = $(e.target)
		gui.Shell.openExternal($this.attr('href'))

	openDirectory: ->
		projPath = @pathtxt.text()
		gui.Shell.showItemInFolder(projPath)

	configProject: ->
		#gui.Window.open('mordenConfig.html?id=' + @key)
		configPage('mordenConfig.html?id=' + @key)

	packProject: ->
		packProject(@key, @pathtxt.text(), this)

	slideDestroy: ->
		@node.slideUp 'fast', =>
			@destroy()

	openOutput: ->
		projPath = path.join(@pathtxt.text(), 'output')
		gui.Shell.showItemInFolder(projPath)

	msg: (msg) ->
		@alertMsg.html(msg)
		@alert.slideDown()


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
		@projPath.text(@key).attr('title', @key)


loadHistory = Remix.create
	remixChild:
		historyItem: historyItem
	template: '<ul class="list-group"></ul>'
	onNodeCreated: ->
		$('#historyContainer').empty().append(@node)
	render: (data) -> # should data be a array
		storedPaths = getProjectPaths()
		for history in storedPaths
			@append @historyItem null, history
reloadHistory = loadHistory


Dialog = Remix.create
	template: """
		<div class="modal">
			<div class="modal-backdrop fade in"></div>
		  <div class="modal-dialog">
		    <div class="modal-content">
		      <div class="modal-header">
		        <button type="button" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>
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
		'click, .close': 'slideAway'

	onNodeCreated: ->
		@appendTo(document.body)

	render: (data) ->
		@title.text data.title
		@body.empty()
		@include @body, data.content

		if data.buttons 
			@include @footer, data.buttons
			@footer.show()
		else @footer.hide()

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
				'keyup, [ref="portNum"]': 'updatePortNum',
				'click, [ref="okbtn"]': 'savePort'

			updatePortNum: ->
				val = @portNum.val()
				if /[^\d]/.test val
					val = val.replace(/[^\d]/g, '')
					@portNum.val(val)
				portNum = val

			savePort: ->
				if portNum.length
					callback?(parseInt(portNum))
					portDialog.slideAway()
				else
					alert "亲"
				
configPage = Remix.create
	template: """
		<div class="configPage">
			<iframe ref="frame" src="" frameborder="0"></iframe>
		</div>
	"""
	onNodeCreated: ->
		@appendTo(document.body)
	render: (src) ->
		$(document.body).css('overflow-y', 'hidden')
		@frame.attr('src', src)
	onDestroy: ->
		$(document.body).css('overflow-y', '')
		global.console = window.console