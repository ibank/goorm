
org.goorm.core.auth.manage.collaboration = function () {
	this.change_list = {};
	this.socket = null;
	this.project = null;
}

org.goorm.core.auth.manage.collaboration.prototype = {
	init : function() {
		var self = this;

		this.del_button =  new YAHOO.widget.Button("project_delete", { onclick: { fn: function() { self.del(); } }, label:'<span localization_key="delete">Delete</span>' });
		this.share_button =  new YAHOO.widget.Button("project_share", { onclick: { fn: function() { self.share(); } }, label:'<span localization_key="share">Share</span>' });
		this.refresh_button = new YAHOO.widget.Button("project_refresh", { onclick: { fn: function() { self.list_refresh(); } }, label:'<span localization_key="refresh">Refresh</span>' })

		this.refresh();
		this.socket = io.connect();
	},

	refresh : function(){
		var self = this;

		var postdata = {
			'get_list_type' : 'owner_list'
		}

		$.getJSON("project/get_list", postdata, function (list) {
			$('.project_list').empty();

			if(list){
				$(list).each(function(i, data){
					var project_html = ""
					project_html = '<div class="list_item project_item" project_path="'+data.name+'">'+data.contents.name+'</div>'

					$('.project_list').append(project_html);
				})

				$('.project_list .list_item').unbind('click')
				$('.project_list .list_item').click(function(e){

					// Highlighting
					//
					$('.project_list').children().each(function(i, l){
						$(this).removeClass('list_item_selected');
					})
					$(this).addClass('list_item_selected');

					// Project Detail
					//
					$('.project_detail_view').remove();
					var postdata = {
						project_path : $(this).attr('project_path')
					}

					$.get('/user/project/get', postdata, function(data){
						self.set(data);
					})
				});
			}
		});
	},

	set : function(project){
		var self = this;

		$.ajax({
			type: "GET",
			dataType: "html",
			async: false,
			url: 'configs/auth/org.goorm.core.project/project.collaboration.detail.html',
			success: function(data) {
				$('.project_detail').append(data);
				
				$('.project_detail_view').attr('project_path', project.project_path);
				$('.project_detail_view').attr('project_name', project.project_name);
				$('.project_detail_view').attr('project_type', project.project_type);

				$('[name="project_detail_name"]').val(project.project_name)
				$('[name="project_detail_type"]').val(project.project_type)
				$('[name="project_detail_path"]').val(project.project_path)

				// this.invite_button =  new YAHOO.widget.Button("collaboration_invite", { onclick: { fn: function() { self.invite(); } }, label:'>>' });
				// this.cancel_button =  new YAHOO.widget.Button("collaboration_cancel", { onclick: { fn: function() { self.cancel(); } }, label:'<<' });

				self.list_refresh();
				self.set_auto_complete();
			}
		})
	},

	set_auto_complete : function(){
		var self = this;

		var data_source_config = {
			'connXhrMode' : 'cancelStaleRequests'
		}

		this.user_data_source = new YAHOO.util.XHRDataSource('/user/project/list/no_co_developers', data_source_config);
		this.user_data_source.responseType = YAHOO.util.XHRDataSource.TYPE_JSARRAY;
		this.user_data_source.responseSchema = {
			fields: ['id', 'type', 'name']
		}

		this.user_auto_complete = new YAHOO.widget.AutoComplete("project_invitation_input", "invitation_user_container", this.user_data_source);
		this.user_auto_complete.generateRequest = function(sQuery){
			var project_path = $('.project_detail_view').attr('project_path')
			return '?project_path=' + project_path + '&query=' + sQuery;
		}

		
	},

	del : function(){

	},

	share : function(){
		var self = this;

		var invite_list = [];

		var delete_user = [];

		// for(var id in self.change_list){
		// 	if(self.change_list[id]){
		// 		if(self.change_list[id].do_action == 'invite'){
		// 			invite_list.push(self.change_list[id]);
		// 		}
		// 		else{
		// 			delete_user.push(self.change_list[id]);
		// 		}
		// 	}
		// }

		// if(invite_list.length != 0){
		// 	var project_path = $('.project_detail_view').attr('project_path');
		// 	var project_name = $('.project_detail_view').attr('project_name');
		// 	var project_type = $('.project_detail_view').attr('project_type');

		// 	var data = {
		// 		'channel' : 'workspace',
		// 		'action' : 'invite',
		// 		'invite_list' : invite_list,
		// 		'project_path' : project_path,
		// 		'project_name' : project_name,
		// 		'project_type' : project_type,
		// 		'user_id' : core.user.id,
		// 		"user_type" : core.user.type
		// 	}

		// 	for(var i=0; i<invite_list.length; i++){
		// 		var postdata = {
		// 			'project_path' : $('.project_detail_view').attr('project_path'),
		// 			'target_id' : invite_list[i].id,
		// 			'target_type' : invite_list[i].type
		// 		}

		// 		$.post('/user/project/collaboration/invitation/push', postdata, function(data){

		// 		})
		// 	}

		// 	self.socket.emit("invite", JSON.stringify(data));
		// 	self.list_refresh();
		// }

		// if(delete_user.length != 0){
		// 	for(var i=0; i<delete_user.length;i++){
		// 		var postdata = {
		// 			'project_path' : $('.project_detail_view').attr('project_path'),
		// 			'target_id' : delete_user[i].id,
		// 			'target_type' : delete_user[i].type
		// 		}

		// 		$.post('/user/project/collaboration/pull', postdata, function(data){
		// 			self.list_refresh();
		// 		})
		// 	}
		// }
	},

	invite : function(){
		var self = this;
		
		// var selected_user = $(".collaboration_userlist").find('.list_item_selected');
		// var user = {
		// 	'id' : selected_user.attr('user_id'),
		// 	'type' : selected_user.attr('user_type')
		// }
		
		// var status = selected_user.attr('status');
		
		// if(status == 'normal_user'){
		// 	user.do_action = 'invite';
		// 	selected_user.attr('changed', 'changed');
		// 	self.change_list[selected_user.attr('user_id')] = user;
			
		// 	$(".collaboration_userlist .list_item_selected").remove();
		// 	$(".collaboration_co_developers").append(selected_user);
			
		// 	$(".collaboration_co_developers .list_item_selected").css('background-color', '#EEFAAF')
		// 	$(".collaboration_co_developers .list_item_selected").removeClass('list_item_selected');
		// }
		// else if(status == 'co_developer_user'){
		// 	selected_user.removeAttr('changed');
		// 	self.change_list[selected_user.attr('user_id')] = null;
			
		// 	$(".collaboration_userlist .list_item_selected").remove();
		// 	$(".collaboration_co_developers").append(selected_user);
			
		// 	$(".collaboration_co_developers .list_item_selected").css('background-color', '#FFF')
		// 	$(".collaboration_co_developers .list_item_selected").removeClass('list_item_selected');
		// }
		
		// self.highlight_refresh();
	},

	cancel : function(){
		var self = this;
		
		// var selected_user = $(".collaboration_co_developers").find('.list_item_selected');
		// var user = {
		// 	'id' : selected_user.attr('user_id'),
		// 	'type' : selected_user.attr('user_type')
		// }

		// var status = selected_user.attr('status');
		
		// if(status == 'co_developer_user'){
		// 	user.do_action = 'cancel';
		// 	selected_user.attr('changed', 'changed');
		// 	self.change_list[selected_user.attr('user_id')] = user;
			
		// 	$(".collaboration_co_developers .list_item_selected").remove();
		// 	$(".collaboration_userlist").append(selected_user);
			
		// 	$(".collaboration_userlist .list_item_selected").css('background-color', '#EEFAAF')
		// 	$(".collaboration_userlist .list_item_selected").removeClass('list_item_selected');
		// }
		// else if(status == 'normal_user'){
		// 	selected_user.removeAttr('changed');
		// 	self.change_list[selected_user.attr('user_id')] = null;
			
		// 	$(".collaboration_co_developers .list_item_selected").remove();
		// 	$(".collaboration_userlist").append(selected_user);
			
		// 	$(".collaboration_userlist .list_item_selected").css('background-color', '#FFF');
		// 	$(".collaboration_userlist .list_item_selected").removeClass('list_item_selected');
		// }

		// self.highlight_refresh();
	},

	highlight_refresh : function(){
		var self = this;
		
		// $('.project_detail_view').find('.list_item').unbind('click');
		// $('.project_detail_view').find('.list_item').click(function(){
		// 	$(".collaboration_userlist").children().each(function () {
		// 		$(this).removeClass('list_item_selected');
		// 		if($(this).attr('changed') == 'changed') $(this).css('background-color', '#EEFAAF');
		// 		else $(this).css('background-color', '#fff');
		// 	});
		// 	$(".collaboration_co_developers").children().each(function () {
		// 		$(this).removeClass('list_item_selected');
		// 		if($(this).attr('changed') == 'changed') $(this).css('background-color', '#EEFAAF');
		// 		else $(this).css('background-color', '#fff');
		// 	});
			
		// 	$(this).addClass('list_item_selected');
		// });
	},


	list_refresh : function(){
		var self = this;

		// var postdata = {
		// 	project_path : $('.project_detail_view').attr('project_path')
		// }

		// $.get('/user/project/get', postdata, function(project){
		// 	$.post('/user/get/list', function(user_list){
		// 		$('.collaboration_userlist').empty();
		// 		$('.collaboration_co_developers').empty();

		// 		if(user_list && project){
		// 			for(var i=0; i<user_list.length; i++){
		// 				var user = user_list[i];
		// 				if(user.id == core.user.id && user.type == core.user.type) continue;

		// 				if(project.collaboration_list.indexOf(user.id+'_'+user.type) != -1){
		// 					var co_developer_user = '<div class="list_item co_developer_user" user_id="'+user.id+'" user_type="'+user.type+'" status="co_developer_user">'+user.name+'</div>'
		// 					$('.collaboration_co_developers').append(co_developer_user);
		// 				}
		// 				else if(project.invitation_list.indexOf(user.id+'_'+user.type) != -1){
		// 					var invitation_user = '<div class="list_item co_developer_user" user_id="'+user.id+'" user_type="'+user.type+'" status="invitation_user" style="width: 110px;">'+user.name+'<span style="float:right"><img src="/images/org.goorm.core.utility/loading.gif"></span></div>'
		// 					$('.collaboration_co_developers').append(invitation_user);
		// 				}
		// 				else{
		// 					var normal_user = '<div class="list_item normal_user" user_id="'+user.id+'" user_type="'+user.type+'" status="normal_user">'+user.name+'</div>'
		// 					$('.collaboration_userlist').append(normal_user);
		// 				}
		// 			}

		// 			self.highlight_refresh();
		// 		}
		// 	})
		// });


		var postdata = {
			project_path : $('.project_detail_view').attr('project_path')
		}

		$.get('/user/project/get', postdata, function(project){
			$.post('/user/get/list', function(user_list){
				$('.collaboration_user_list').empty();

				if(user_list && project){
					for(var i=0; i<user_list.length; i++){
						var user = user_list[i];
						if(user.id == core.user.id && user.type == core.user.type) continue;

						if(project.collaboration_list.indexOf(user.id+'_'+user.type) != -1){
							var co_developer_user = '<div class="list_item co_developer_user" user_id="'+user.id+'" user_type="'+user.type+'" status="co_developer_user"><span>'+user.name+'</span></div>'
							$('.collaboration_user_list').append(co_developer_user);
						}
						else if(project.invitation_list.indexOf(user.id+'_'+user.type) != -1){
							var invitation_user = '<div class="list_item co_developer_user" user_id="'+user.id+'" user_type="'+user.type+'" status="invitation_user"><span>'+user.name+'</span><span style="float:right"><img src="/images/org.goorm.core.utility/loading.gif"></span></div>'
							$('.collaboration_user_list').append(invitation_user);
						}
					}

					// self.highlight_refresh();
				}
			})
		});
	}
}
