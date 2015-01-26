Button = Remix.create
	template: '<button type="button" class="btn"></button>'
	remixEvent:
		'click': 'clickCallback'
	render: (data) ->
		@node.attr 'class', "btn btn-#{data.type} btn-#{data.size}"
		@node.text data.title
		@clickCallback = data.onclick

LoadedProject = Remix.create
	remixChild:
		Button: Button

	template: """
		<div class="col-sm-6 col-md-4">
			<div class="panel panel-primary">
				<div class="panel-heading">
					<button remix="Button" data-type="danger" data-size="xs" data-onclick="@unloadProject" data-title="X" key="unloadBtn"></button> &nbsp;&nbsp;<span ref="pathtxt"></span>
				</div>
				<div class="panel-body">
					<ul ref="urlList">
						
					</ul>
				  	
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

	onNodeCreated: ->
		@appendTo('#loaded-container')

	render: (data) ->
		@pathtxt.text data.path
		@urlList.empty()
		data.urls.forEach (url) =>
			@urlList.append """
				<li><a href="#{url}">#{url}</a></li>
			"""
		{@openDirectory, @unloadProject, @configProject, @packProject} = data

	openDirectory: ->

	unloadProject: ->

	configProject: ->

	packProject: ->
