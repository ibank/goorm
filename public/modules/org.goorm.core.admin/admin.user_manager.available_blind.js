

org.goorm.core.admin.user_manager.available_blind = function () {
	this.change_list = {};
};

org.goorm.core.admin.user_manager.available_blind.prototype = {
	init : function() {
		var self = this;
		
		this.to_blind_button = new YAHOO.widget.Button("user_management_blind", { onclick: { fn: function(){ self.to_blind() } }, label:'>>' });
		this.to_available_button = new YAHOO.widget.Button("user_management_available", { onclick: { fn: function(){ self.to_available() } }, label:'<<' });
		this.apply_button = new YAHOO.widget.Button("user_management_available_blind_apply", { onclick: { fn: function(){ self.apply() } }, label:'<span localization_key="apply">Apply</span>' });

		this.load();
	},
	
	load : function(){
		var self = this;
		
		$.post('/user/get/list', function(user_list){
			if(user_list){
				for(var i=0; i<user_list.length; i++){
					var user = user_list[i];
					if(!user.deleted) $(".user_management_available_blind_contents").find(".user_management_available_list").append("<div style='padding:3px;' user_id="+user.id+" type="+user.type+" class='available_blind_user' status='user_available'>"+user.name+"</div>");
					else $(".user_management_available_blind_contents").find(".user_management_blind_list").append("<div style='padding:3px;' user_id="+user.id+" type="+user.type+" class='available_blind_user' status='user_blind'>"+user.name+"</div>");
				}
				self.highlight_refresh();
			}
		})
	},
	
	load_default : function(){
		this.refresh();
	},
	
	apply : function(){
		// var self = core.module.admin.user_manager.manager.tabview_list['UserList'].available_blind;
		var self = this;
		
		var postdata = {
			data : []
		};
		
		for(var id in self.change_list){
			if(self.change_list[id]){
				postdata.data.push(self.change_list[id])
			}
		}
		
		$.post('/admin/user/avail_blind', postdata, function(apply_result){
			self.refresh();
		});
	},
	
	to_blind : function(){
		// var self = core.module.admin.user_manager.manager.tabview_list['UserList'].available_blind;
		var self = this;
		
		var selected_user = $(".user_management_available_blind_contents").find('[selected="selected"]');

		var user = {
			'id' : selected_user.attr('user_id'),
			'type' : selected_user.attr('type')
		}
		
		var status = selected_user.attr('status');
		
		if(status == 'user_available'){
			user.deleted = true;
			selected_user.attr('changed', 'changed');
			self.change_list[selected_user.attr('user_id')] = user;
			
			$(".user_management_available_blind_contents").find(".user_management_available_list [selected='selected']").remove();
			$(".user_management_available_blind_contents").find(".user_management_blind_list").append(selected_user);
			
			$(".user_management_available_blind_contents").find(".user_management_blind_list [selected='selected']").css('background-color', '#EEFAAF')
			$(".user_management_available_blind_contents").find(".user_management_blind_list [selected='selected']").removeAttr('selected');
		}
		else if(status == 'user_blind'){
			selected_user.removeAttr('changed');
			self.change_list[selected_user.attr('user_id')] = null;
			
			$(".user_management_available_blind_contents").find(".user_management_available_list [selected='selected']").remove();
			$(".user_management_available_blind_contents").find(".user_management_blind_list").append(selected_user);
			
			$(".user_management_available_blind_contents").find(".user_management_blind_list [selected='selected']").css('background-color', '#FFF')
			$(".user_management_available_blind_contents").find(".user_management_blind_list [selected='selected']").removeAttr('selected');
		}
		
		self.highlight_refresh();
	},
	
	to_available : function(){
		// var self = core.module.admin.user_manager.manager.tabview_list['UserList'].available_blind;
		var self = this;
		
		var selected_user = $(".user_management_available_blind_contents").find('[selected="selected"]');
		var user = {
			'id' : selected_user.attr('user_id'),
			'type' : selected_user.attr('type')
		}
		
		var status = selected_user.attr('status');
		
		if(status == 'user_blind'){
			user.deleted = false;
			selected_user.attr('changed', 'changed');
			self.change_list[selected_user.attr('user_id')] = user;
			
			$(".user_management_available_blind_contents").find(".user_management_blind_list [selected='selected']").remove();
			$(".user_management_available_blind_contents").find(".user_management_available_list").append(selected_user);
			
			$(".user_management_available_blind_contents").find(".user_management_available_list [selected='selected']").css('background-color', '#EEFAAF')
			$(".user_management_available_blind_contents").find(".user_management_available_list [selected='selected']").removeAttr('selected');
		}
		else if(status == 'user_available'){
			selected_user.removeAttr('changed');
			self.change_list[selected_user.attr('user_id')] = null;
			
			$(".user_management_available_blind_contents").find(".user_management_blind_list [selected='selected']").remove();
			$(".user_management_available_blind_contents").find(".user_management_available_list").append(selected_user);
			
			$(".user_management_available_blind_contents").find(".user_management_available_list [selected='selected']").css('background-color', '#FFF')
			$(".user_management_available_blind_contents").find(".user_management_available_list [selected='selected']").removeAttr('selected');
		}

		self.highlight_refresh();
	},
	
	highlight_refresh : function(){
		var self = this;
		
		$('.user_management_available_blind_contents').find('.available_blind_user').click(function(){
			$(".user_management_available_blind_contents").find(".user_management_available_list").children().each(function () {
				$(this).removeAttr('selected');
				if($(this).attr('changed') == 'changed') $(this).css('background-color', '#EEFAAF');
				else $(this).css('background-color', '#fff');
			});
			$(".user_management_available_blind_contents").find(".user_management_blind_list").children().each(function () {
				$(this).removeAttr('selected');
				if($(this).attr('changed') == 'changed') $(this).css('background-color', '#EEFAAF');
				else $(this).css('background-color', '#fff');
			});
			
			$(this).attr('selected', 'selected');
			$(this).css('background-color', '#b3d4ff');
		});
	},
	
	refresh : function(){
		var self = this;
		
		$('.user_management_available_blind_contents').find('.available_blind_user').remove();
		$.post('/user/get/list', function(user_list){
			if(user_list){
				for(var i=0; i<user_list.length; i++){
					var user = user_list[i];
					if(!user.deleted) $(".user_management_available_blind_contents").find(".user_management_available_list").append("<div style='padding:3px;' user_id="+user.id+" type="+user.type+" class='available_blind_user' status='user_available'>"+user.name+"</div>");
					else $(".user_management_available_blind_contents").find(".user_management_blind_list").append("<div style='padding:3px;' user_id="+user.id+" type="+user.type+" class='available_blind_user' status='user_blind'>"+user.name+"</div>");
				}
				self.highlight_refresh();
			}
			
			self.change_list = {};
		})
	}
}
