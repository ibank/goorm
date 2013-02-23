
org.goorm.core.collaboration.invite = function () {
	this.socket = null;
	this.dialogs = [];
	this.index = 0;
}

org.goorm.core.collaboration.invite.prototype = {
	init : function(){
		var self = this;

		this.socket = io.connect();
		this.socket.on('invitation_message', function(data){
			var project_data = JSON.parse(data);

			function is_ok() {
				// invitation list edit in target project
				//
				var pulldata = {
					'project_path' : project_data.project_path,
					'target_id' : core.user.id,
					'target_type' : core.user.type
				}
				$.post('/user/project/collaboration/invitation/pull', pulldata, function(data){});

				// invitation answer to author
				//
				var senddata = {
					'channel' : 'workspace',
					'action' : 'invitation_answer',
					'invite_answer_list' : [{
						'id' : project_data.author_id,
						'type' : project_data.author_type 
					}],
					'project_path' : project_data.project_path,
					'project_name' : project_data.project_name,
					'project_type' : project_data.project_type,
					'user_id' : core.user.id,
					"user_type" : core.user.type,
					'state' : 'sure'
				}
				self.socket.emit("invite", JSON.stringify(senddata))
			}

			function is_no() {
				// invitation list edit in target project
				//
				var pulldata = {
					'project_path' : project_data.project_path,
					'target_id' : core.user.id,
					'target_type' : core.user.type
				}
				$.post('/user/project/collaboration/invitation/pull', pulldata, function(data){});

				// invitation answer to author
				//
				var senddata = {
					'channel' : 'workspace',
					'action' : 'invitation_answer',
					'invite_answer_list' : [{
						'id' : project_data.author_id,
						'type' : project_data.author_type 
					}],
					'project_path' : project_data.project_path,
					'project_name' : project_data.project_name,
					'project_type' : project_data.project_type,
					'user_id' : core.user.id,
					"user_type" : core.user.type,
					'state' : 'refused'
				}
				self.socket.emit("invite", JSON.stringify(senddata))
			}

			self.init_dialog(project_data, is_ok, is_no);
		})

		this.socket.on('invitation_message_answer', function(data){
			var project_data = JSON.parse(data);

			self.init_answer_dialog(project_data);
		});
	},

	// project_data
	//  'author_id' : msg.user_id,
	//  'author_type' : msg.user_type,
	//  'project_path' : msg.project_path,
	//  'project_type' : msg.project_type,
	//  'project_name' : msg.project_name
	//
	init_dialog : function(project_data, is_ok, is_no){
		var self = this;

		var handle_yes = function(){
			var this_panel = this;
			var postdata = {
				'project_path' : project_data.project_path,
				'target_id' : core.user.id,
				'target_type' : core.user.type
			}

			$.post('/user/project/collaboration/push', postdata, function(data){
				if(is_ok)
					is_ok.call()

				core.dialog.open_project.open(project_data.project_path, project_data.project_name, project_data.project_type);
				this_panel.hide();
			});
		}

		var handle_yes_but = function(){
			var this_panel = this;
			var postdata = {
				'project_path' : project_data.project_path,
				'target_id' : core.user.id,
				'target_type' : core.user.type
			}

			$.post('/user/project/collaboration/push', postdata, function(data){
				if(is_ok)
					is_ok.call()

				this_panel.hide();
			});
		}

		var handle_no = function(){
			if(is_no)
				is_no.call()

			this.hide();
		}

		var handle_close = function(){
			this.hide();
		}

		var buttons = [];

		if(project_data.state == 'sent'){
			buttons = [ {text:"<span localization_key='yes'>Yes</span>", handler:handle_yes, isDefault:true},
						{text:"<span localization_key='no'>No</span>",  handler:handle_no},
						{text:"<span localization_key='yes_but'>Yes, but I'll continue my project.</span>",  handler:handle_yes_but}]; 
		}
		else{
			buttons = [{text:"<span localization_key='close'>Close</span>",  handler:handle_close}]
		}

		self.dialogs[self.index] = new org.goorm.core.collaboration.invite.dialog();
		self.dialogs[self.index].init({
			localization_key:"title_invite_project",
			title:"Invite Project", 
			path:"configs/dialogs/org.goorm.core.collaboration/collaboration.invite.html",
			width:400,
			height:230,
			modal:true,
			buttons: buttons,
			success: function () {
				var container_id = '#'+this.container_id

				$(container_id).find('[name="invite_project_author"]').val(project_data.author_id)
				$(container_id).find('[name="invite_project_name"]').val(project_data.project_name)
				$(container_id).find('[name="invite_project_type"]').val(project_data.project_type)
				$(container_id).find('[name="invite_project_path"]').val(project_data.project_path)

				if(project_data.state != 'sent'){
					if(project_data.state == 'sure'){
						$(container_id).find('.project_invite_confirmation').append('<div class="answer_content"><span class="answer_head">[Accept] </span><span class="answer_content">You has accepted the proposition.</span></div>')
					}
					else if(project_data.state == 'refused'){
						$(container_id).find('.project_invite_confirmation').append('<div class="answer_content"><span class="answer_head">[Refused] </span><span class="answer_content">You has refused the proposition.</span></div>')
					}
				}

				self.dialogs[self.index] = self.dialogs[self.index].dialog;
				self.index++;

				this.panel.show();
			}
		})
	},


	// 'answerer_id' : msg.user_id,
	// 'answerer_type' : msg.user_type,
	// 'project_path' : msg.project_path,
	// 'project_name' : msg.project_name,
	// 'project_type' : msg.project_type,
	// 'state' : msg.state
	//
	init_answer_dialog : function(project_data){
		var self = this;

		var handle_close = function(){
			this.hide();
		}

		var buttons = [{text:"<span localization_key='close'>Close</span>",  handler:handle_close}]

		self.dialogs[self.index] = new org.goorm.core.collaboration.invite.dialog();
		self.dialogs[self.index].init({
			localization_key:"title_invitation_answer",
			title:"Invitation Answer", 
			path:"configs/dialogs/org.goorm.core.collaboration/collaboration.invitation.answer.html",
			width:400,
			height:230,
			modal:true,
			buttons: buttons,
			success: function () {
				var container_id = '#'+this.container_id

				$(container_id).find('[name="invite_project_answerer"]').val(project_data.answerer_id)
				$(container_id).find('[name="invite_project_name"]').val(project_data.project_name)
				$(container_id).find('[name="invite_project_type"]').val(project_data.project_type)
				$(container_id).find('[name="invite_project_path"]').val(project_data.project_path)

				if(project_data.state != 'sent'){
					if(project_data.state == 'sure'){
						$(container_id).find('.project_invitation_answer').append('<div class="answer_content"><span class="answer_head">[Accept] </span><span class="answer_content">'+project_data.answerer_id+' has accepted the proposition.</span></div>')
					}
					else if(project_data.state == 'refused'){
						$(container_id).find('.project_invitation_answer').append('<div class="answer_content"><span class="answer_head">[Refused] </span><span class="answer_content">'+project_data.answerer_id+' has refused the proposition.</span></div>')
					}
				}

				self.dialogs[self.index] = self.dialogs[self.index].dialog;
				self.index++;

				this.panel.show();
			}
		})
	},

	get_html : function(message){
		if(message.type == 'invite_user'){
			var html = "";
			var __class = message.checked ? 'checked' : 'unchecked';
			var content = message.data.author_id + ' has invited you to \"' + message.data.project_name + '\" project.';

			html 	+= '<div class="'+__class+'"><div class="message_head" _id="'+message._id+'">[Invite to workspace] </div><div class="message_content">'+content+'</div></div>';
			return html;
		}
		else if (message.type == 'invite_answer'){
			var html = "";
			var __class = message.checked ? 'checked' : 'unchecked';
			var content = message.data.answerer_id + ' has answered to you about \"' + message.data.project_name + '\" project.';

			html 	+= '<div class="'+__class+'"><div class="message_head" _id="'+message._id+'">[Answer to workspace invitation] </div><div class="message_content">'+content+'</div></div>';
			return html;
		}
	},

	action : function(message){
		var self = this;

		if(message.type == 'invite_user'){
			if(message.data.state == 'sent'){

				function is_ok() {

					// current message edit
					//
					var editdata = {
						'_id' : message._id,
						'data' : message.data
					}
					editdata.data.state = 'sure';
					editdata.data = JSON.stringify(editdata.data);

					$.post('/message/edit', editdata, function(data){});

					// invitation list edit in target project
					//
					var pulldata = {
						'project_path' : message.data.project_path,
						'target_id' : core.user.id,
						'target_type' : core.user.type
					}
					$.post('/user/project/collaboration/invitation/pull', pulldata, function(data){});

					// invitation answer to author
					//
					var senddata = {
						'channel' : 'workspace',
						'action' : 'invitation_answer',
						'invite_answer_list' : [{
							'id' : message.data.author_id,
							'type' : message.data.author_type 
						}],
						'project_path' : message.data.project_path,
						'project_name' : message.data.project_name,
						'project_type' : message.data.project_type,
						'user_id' : core.user.id,
						"user_type" : core.user.type,
						'state' : 'sure'
					}
					self.socket.emit("invite", JSON.stringify(senddata))
				}

				function is_no() {

					// current message edit
					//
					var editdata = {
						'_id' : message._id,
						'data' : message.data
					}
					editdata.data.state = 'refused';
					editdata.data = JSON.stringify(editdata.data);

					$.post('/message/edit', editdata, function(data){});

					// invitation list edit in target project
					//
					var pulldata = {
						'project_path' : message.data.project_path,
						'target_id' : core.user.id,
						'target_type' : core.user.type
					}
					$.post('/user/project/collaboration/invitation/pull', pulldata, function(data){});

					// invitation answer to author
					//
					var senddata = {
						'channel' : 'workspace',
						'action' : 'invitation_answer',
						'invite_answer_list' : [{
							'id' : message.data.author_id,
							'type' : message.data.author_type 
						}],
						'project_path' : message.data.project_path,
						'project_name' : message.data.project_name,
						'project_type' : message.data.project_type,
						'user_id' : core.user.id,
						"user_type" : core.user.type,
						'state' : 'refused'
					}
					self.socket.emit("invite", JSON.stringify(senddata))
				}

				self.init_dialog(message.data, is_ok, is_no);
			}
			else if(message.data.state == 'sure'){
				self.init_dialog(message.data)
			}
			else if(message.data.state == 'refused'){
				self.init_dialog(message.data)
			}
		}
		else if(message.type == 'invite_answer'){
			self.init_answer_dialog(message.data);
		}
	}
}