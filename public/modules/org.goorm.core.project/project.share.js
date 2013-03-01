
org.goorm.core.project.share = function () {
	this.dialog = null;

	this.selected_user = null;
	this.added_list = {};
	this.socket = null;
}

org.goorm.core.project.share.prototype = {
	init : function(){
		var self = this;

		var handle_close = function() { 
			this.hide();
		};
		
		this.buttons = [ {text:"<span localization_key='share_and_save'>Share & Save</span>", handler:function(){ self.share() }, isDefault:true},
						 {text:"<span localization_key='close'>Close</span>",  handler:handle_close}];

		this.dialog = new org.goorm.core.project.share.dialog();
		this.dialog.init({
			localization_key:"title_project_share",
			title:"Share This Project", 
			path:"configs/dialogs/org.goorm.core.project/project.share.html",
			width:450,
			height:400,
			modal:true,
			buttons:this.buttons,
			success: function () {
				this.add_button = new YAHOO.widget.Button("user_add_button", { onclick: { fn: function(){ self.user_add(); } }, label:'<span localization_key="add">Add</span>' });

				$("#project_share_select_list").change(function() {
					if($(this).val() != ''){
						self.on_project_selectbox_change($(this).val());

						$('#user_search_input').removeAttr('readonly')
						$('#user_search_input').removeClass('readonly');
					}
					else{
						$('#project_share_container .user_list').empty();
						$('#project_share_container .user_list').append('<div class="display_guide">'+core.module.localization.msg["alert_select_project"]+'</div>')

						$('#user_search_input').attr('readonly', 'readonly')
						$('#user_search_input').addClass('readonly');
					}
				});

				$('#user_search_input').keyup(function(e){
					if($(this).val() == ""){
						self.selected_user = null;
					}
					if(e.keyCode == 13){ // Enter
						self.user_add();
					}
				})
			}
		})

		this.dialog = this.dialog.dialog;
		this.socket = io.connect();
	},

	show : function() {
		var self = this;

		this.set_project_list();
		this.set_user_auto_complete();

		this.dialog.panel.show();
	},

	on_project_selectbox_change : function(project_idx){
		var current_project = this.project_data[project_idx];

		this.project_path = current_project.name;
		this.project_name = current_project.contents.name;
		this.project_type = current_project.contents.type;

		this.set_user_list(this.project_path);
	},

	set_project_list : function(){
		var self = this;

		function make_select_box(project_data){
			self.project_data = project_data;

			$("#project_share_select_list").empty();
			$("#project_share_select_list").append("<option value='' selected>Select Project</option>");

			if(project_data){
				for(var project_idx=0; project_idx<project_data.length; project_idx++) {
					var temp_name = project_data[project_idx].name;

					if (project_data[project_idx].name == core.status.current_project_path) {
						$("#project_share_select_list").append("<option value='"+project_idx+"' selected>"+temp_name+"</option>");
						self.on_project_selectbox_change(project_idx);
					}
					else {
						$("#project_share_select_list").append("<option value='"+project_idx+"'>"+temp_name+"</option>");
					}
				}
			}

			if($('#project_share_select_list').val() == ""){
				$('#project_share_container .user_list').empty();
				$('#project_share_container .user_list').append('<div class="display_guide">'+core.module.localization.msg["alert_select_project"]+'</div>')

				$('#user_search_input').attr('readonly', 'readonly')
				$('#user_search_input').addClass('readonly');
			}
		}

		$.get("project/get_list", {'get_list_type' : 'owner_list'}, function (data) {
			make_select_box(data);
		});
	},

	set_user_list : function(project_path){
		var self = this;

		var postdata = {
			'project_path' : project_path
		}

		$.get('/user/project/get', postdata, function(project){
			$.post('/user/get/list', function(user_list){
				$('#project_share_container .user_list').empty();

				function set_developer(user){
					var user_html = "";
					user_html += '<div class="user_item co_developer_user" status="co_developer_user" id="'+user.id+'" type="'+user.type+'">';
					user_html +=		'<div class="user_info_form">'
					user_html +=			'<span class="user_info_name">'+user.name+'</span>'
					user_html +=			'<span class="user_info_email">'+user.email+'</span>'
					user_html +=		'</div>'
					user_html +=		'<div class="user_permission_form">'
					user_html +=		'</div>'
					user_html +=		'<div class="user_tool_form">'
					user_html +=			'<span class="user_tool_delete"><img src="/images/icons/context/closebutton2.png" style="vertical-align:middle"></span>'
					user_html +=		'</div>'
					user_html += '</div>';

					return user_html;
				}

				function set_invited_user(user){
					var user_html = "";
					user_html += '<div class="user_item invited_user" status="invited_user" id="'+user.id+'" type="'+user.type+'">';
					user_html +=		'<div class="user_info_form">'
					user_html +=			'<span class="user_info_name">'+user.name+'</span>'
					user_html +=			'<span class="user_info_email">'+user.email+'</span>'
					user_html +=		'</div>'
					user_html +=		'<div class="user_permission_form">'
					user_html +=		'</div>'
					user_html +=		'<div class="user_tool_form">'
					user_html +=			'<span class="user_tool_waiting"><img src="/images/org.goorm.core.utility/loading.gif" style="vertical-align:middle"></span>'
					user_html +=		'</div>'
					user_html += '</div>';

					return user_html;
				}

				if(user_list && project){
					for(var i=0; i<user_list.length; i++){
						var user = user_list[i];
						if(user.id == core.user.id && user.type == core.user.type) continue;

						if(project.collaboration_list.indexOf(user.id+'_'+user.type) != -1){
							var co_developer = set_developer(user);
							$('#project_share_container .user_list').append(co_developer)
						}
						else if(project.invitation_list.indexOf(user.id+'_'+user.type) != -1){
							var invited_user = set_invited_user(user);
							$('#project_share_container .user_list').append(invited_user)
						}
					}

					if($('.user_item').length == 0){
						$('#project_share_container .user_list').append('<div class="display_guide">'+core.module.localization.msg["alert_no_display_to_data"]+'</div>')
					}

					self.set_tool_event();
				}
			})
		});
	},

	set_user_auto_complete : function(){
		var self = this;

		var data_source_config = {
			'connXhrMode' : 'cancelStaleRequests'
		}

		this.user_data_source = new YAHOO.util.XHRDataSource('/user/project/list/no_co_developers', data_source_config);
		this.user_data_source.responseType = YAHOO.util.XHRDataSource.TYPE_JSARRAY;
		this.user_data_source.responseSchema = {
			fields: ['id', 'type', 'name', 'email']
		}

		this.user_auto_complete = new YAHOO.widget.AutoComplete("user_search_input", "user_search_result_container", this.user_data_source, {
			'animSpeed' : 0,

		});
		this.user_auto_complete.generateRequest = function(sQuery){
			var project_path = self.project_path;
			return '?project_path=' + project_path + '&query=' + sQuery;
		}

		this.user_auto_complete.itemSelectEvent.subscribe(function(sType, aArgs){
			var data = aArgs[2];

			self.selected_user = {
				'id' : data[0],
				'type' : data[1],
				'name' : data[2],
				'email' : data[3]
			}
		});

		this.user_auto_complete.itemMouseOverEvent.subscribe(function(sType, aArgs){
			var data = aArgs[2];

			self.selected_user = {
				'id' : data[0],
				'type' : data[1],
				'name' : data[2],
				'email' : data[3]
			}
		});

		this.user_auto_complete.formatResult = function(oResultData , sQuery , sResultMatch){
			var user = {
				'id' : oResultData[0],
				'type' : oResultData[1],
				'name' : oResultData[2],
				'email' : oResultData[3]
			}

			return '<div class="auto_complete_user_list">['+user.name+'] '+user.id+' <'+user.email+'> </div>';
		}
	},

	set_tool_event : function(){
		var self = this;

		$('.user_tool_delete').unbind('click');
		$('.user_tool_delete').click(function(e){
			var user_html = $(this).parent().parent();
			var status = $(user_html).attr('status');

			var user = {
				'id' : $(user_html).attr('id'),
				'type' : $(user_html).attr('type')
			}

			if(status == 'added_user'){
				self.added_list[user.id] = null;
				$(user_html).remove();

				if($('.user_item').length == 0){
					$('#project_share_container .user_list').append('<div class="display_guide">'+core.module.localization.msg["alert_no_display_to_data"]+'</div>')
				}
			}
			else if(status == 'co_developer_user'){
				confirmation.init({
					message: core.module.localization.msg["alert_confirm_delete_co_developer"],
					yes_text: core.module.localization.msg["confirmation_yes"],
					no_text: core.module.localization.msg["confirmation_no"],
					title: "Confirmation", 

					yes: function () {
						var postdata = {
							'project_path' : self.project_path,
							'target_id' : user.id,
							'target_type' : user.type
						}

						$.post('/user/project/collaboration/pull', postdata, function(data){
							self.set_user_list(self.project_path)
						})
					}, no: function () {
					}
				});
				
				confirmation.panel.show();
			}
		})
	},

	user_add : function(){
		var self = this;

		if(this.selected_user && !self.added_list[self.selected_user.id]){	
			$('.display_guide').remove();

			function set_added_user(user){
				var user_html = "";
				user_html += '<div class="user_item added_user" status="added_user" id="'+user.id+'" type="'+user.type+'">';
				user_html +=		'<div class="user_info_form">'
				user_html +=			'<span class="user_info_name">'+user.name+'</span>'
				user_html +=			'<span class="user_info_email">'+user.email+'</span>'
				user_html +=		'</div>'
				user_html +=		'<div class="user_permission_form">'
				user_html +=		'</div>'
				user_html +=		'<div class="user_tool_form">'
				user_html +=			'<span class="user_tool_delete"><img src="/images/icons/context/closebutton2.png" style="vertical-align:middle"></span>'
				user_html +=		'</div>'
				user_html += '</div>';

				return user_html;
			}

			self.added_list[self.selected_user.id] = self.selected_user;
			
			var added_user = set_added_user(self.selected_user);
			$('#project_share_container .user_list').append(added_user)

			self.set_tool_event();
		}
	},

	share : function(){
		var self = this;

		var invite_list = [];

		for(var id in self.added_list){
			if(self.added_list[id]){
				invite_list.push(self.added_list[id]);
			}
		}

		if(invite_list.length != 0){

			confirmation.init({
				message: core.module.localization.msg["alert_confirm_invite_co_developer"],
				yes_text: core.module.localization.msg["confirmation_yes"],
				no_text: core.module.localization.msg["confirmation_no"],
				title: "Confirmation", 

				yes: function () {
					var data = {
						'channel' : 'workspace',
						'action' : 'invite',
						'invite_list' : invite_list,
						'project_path' : self.project_path,
						'project_name' : self.project_name,
						'project_type' : self.project_type,
						'user_id' : core.user.id,
						"user_type" : core.user.type
					}

					for(var i=0; i<invite_list.length; i++){
						var postdata = {
							'project_path' : self.project_path,
							'target_id' : invite_list[i].id,
							'target_type' : invite_list[i].type
						}

						$.post('/user/project/collaboration/invitation/push', postdata, function(data){
							self.set_user_list(self.project_path);
							self.added_list = {};
							self.selected_user = null;
						})
					}

					self.socket.emit("invite", JSON.stringify(data));

				}, no: function () {
				}
			});
			
			confirmation.panel.show();
		}
	}
}