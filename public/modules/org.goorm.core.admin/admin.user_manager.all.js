

org.goorm.core.admin.user_manager.all = function () {
	this.add_button = null;
	this.del_button = null;
	this.register_button = null;
	
	this.index = 0;
	this.target_index = 0;
};

org.goorm.core.admin.user_manager.all.prototype = {
	init : function() {
		this.load();
		
		this.add_button =  new YAHOO.widget.Button("user_management_add", { onclick: { fn: this.add } });
		this.del_button =  new YAHOO.widget.Button("user_management_delete", { onclick: { fn: this.del } });
		this.register_button = new YAHOO.widget.Button("user_management_register", { onclick: { fn: this.register } });
	},
	
	load : function(){
		var self = this;
		
		$.post("/user/get/list", function(user_list){
			if(user_list){
				for(var i=0; i<user_list.length; i++){
					var user = user_list[i];
					$(".user_management_list_contents").find(".user_management_list").append("<div style='padding:3px;' user_id="+user.id+" type="+user.type+" class='user_detail_view'>"+user.name+"</div>");
				}
				
				$(".user_management_list_contents").find(".user_detail_view").click(function(){
					$(".user_management_list_contents").find(".user_management_list").children().each(function () {
						$(this).removeAttr('selected');
						$(this).css('background-color', '#fff');
					});
					$(this).attr('selected', 'selected');
					$(this).css('background-color', '#b3d4ff');
					
					var target = {};
					target['id'] = $(this).attr('user_id');
					target['type'] = $(this).attr('type');
					
					$('#user_management_register').hide();
					self.detail_user(target);
				});
			}
		});
	},
	
	detail_user : function(user){
		var self = this;
		$(".user_management_list_contents").find(".user_management_detail [mode='view']").remove();
		$(".user_management_list_contents").find(".user_management_detail [mode='new']").hide();
		
		$.post('/user/get', user, function(user_data){
			if(user_data){
				var detail_html = self.set_detail_html('view');
				$(".user_management_list_contents").find(".user_management_detail").append(detail_html);
				
				self.set_detail_user_content(user_data);
			}
		});
	},
	
	set_detail_html : function(mode){
		var detail_html = "";
		
		detail_html += 	'<div class="user_management_profile" mode='+mode+'>';
		detail_html += 		'<span class="user_management_user_span"> ID : </span>'
		detail_html += 		'<input type="text" name="user_management_id_input" class="user_management_user_input" readonly="readonly">'
		detail_html += 		'<span class="user_management_user_span"> Name : </span>'
		detail_html += 		'<input type="text" name="user_management_name_input" class="user_management_user_input" readonly="readonly">'
		detail_html += 		'<span class="user_management_user_span"> Nickname : </span>'
		detail_html += 		'<input type="text" name="user_management_nick_input" class="user_management_user_input" readonly="readonly">'
		detail_html += 		'<span class="user_management_user_span"> E-mail : </span>'
		detail_html += 		'<input type="text" name="user_management_email_input" class="user_management_user_input" readonly="readonly">'
		detail_html += 		'<span class="user_management_user_span"> Type : </span>'
		detail_html += 		'<input type="text" name="user_management_type_input" class="user_management_user_input" readonly="readonly">'
		detail_html += 		'<span class="user_management_user_span"> Level : </span>'
		detail_html += 		'<input type="text" name="user_management_level_input" class="user_management_user_input" readonly="readonly">'
		detail_html += 	'</div>';
		
		return detail_html;
	},
	
	set_signup_html : function(mode, index){
		var detail_html = "";
		
		detail_html += 	'<div class="user_management_profile" mode='+mode+' index='+index+'>';
		detail_html += 		'<span class="user_management_user_span"> ID : </span>'
		detail_html += 		'<input type="text" name="user_management_signup_id_input" class="user_management_user_input" readonly="readonly">'
		detail_html += 		'<span class="user_management_user_span"> PW : </span>'
		detail_html += 		'<input type="password" name="user_management_signup_pw_input" class="user_management_user_input" readonly="readonly">'
		detail_html += 		'<span class="user_management_user_span"> PW(Confirm) : </span>'
		detail_html += 		'<input type="password" name="user_management_signup_re_pw_input" class="user_management_user_input" readonly="readonly">'
		detail_html += 		'<span class="user_management_user_span"> Name : </span>'
		detail_html += 		'<input type="text" name="user_management_signup_name_input" class="user_management_user_input" readonly="readonly">'
		detail_html += 		'<span class="user_management_user_span"> Nickname : </span>'
		detail_html += 		'<input type="text" name="user_management_signup_nick_input" class="user_management_user_input" readonly="readonly">'
		detail_html += 		'<span class="user_management_user_span"> E-mail : </span>'
		detail_html += 		'<input type="text" name="user_management_signup_email_input" class="user_management_user_input" readonly="readonly">'
		detail_html += 		'<span class="user_management_user_span"> Level : </span>'
		detail_html += 		'<select name="user_management_signup_level_input" class="user_management_user_input" readonly="readonly">'
		detail_html +=			'<option value="Member">Member</option>'
		detail_html +=			'<option value="Admin">Admin</option>'
		detail_html += 		'</select>'
		detail_html += 	'</div>';
		
		return detail_html;
	},
	
	set_detail_user_content : function(user_data){
		$('[mode="view"]').find('[name="user_management_id_input"]').val(user_data.id);
		$('[mode="view"]').find('[name="user_management_name_input"]').val(user_data.name);
		$('[mode="view"]').find('[name="user_management_nick_input"]').val(user_data.nick);
		$('[mode="view"]').find('[name="user_management_email_input"]').val(user_data.email);
		$('[mode="view"]').find('[name="user_management_level_input"]').val(user_data.level);
		
		if(user_data.type == 'password') user_data.type = 'Generic';
		$('[mode="view"]').find('[name="user_management_type_input"]').val(user_data.type);
	},
	
	add : function(){
		var self = core.module.admin.user_manager.all;
		
		$(".user_management_list_contents").find("[mode='view']").remove();
		$(".user_management_list_contents").find("[mode='new']").hide();

		$(".user_management_list_contents").find(".user_management_list").append("<div style='padding:3px;' class='target_user_detail_view' target='"+self.index+"'>New User</div>");

		var detail_html = self.set_signup_html('new', self.index);
		$(".user_management_list_contents").find(".user_management_detail").append(detail_html);
		$('#user_management_register').show();
		
		$(document).on("click", ".user_management_list_contents .target_user_detail_view", function(){
			$(".user_management_list_contents").find(".user_management_list").children().each(function () {
				$(this).removeAttr('selected');
				$(this).css('background-color', '#fff');
			});
			$(this).attr('selected', 'selected');
			$(this).css('background-color', '#b3d4ff');
			
			core.status.focus_on_inputbox = true;

			$(".user_management_list_contents").find("[mode='view']").remove();
			$(".user_management_list_contents").find("[mode='new']").hide();

			var index = $(this).attr('target');
			self.target_index = index;
			
			$(".user_management_list_contents").find("[index="+index+"] input").removeAttr('readonly')
			$(".user_management_list_contents").find("[index="+index+"] select").removeAttr('readonly')
			$(".user_management_list_contents").find("[index="+index+"]").show();
			$('#user_management_register').show();
		});
		
		$(".user_management_list_contents").find(".user_management_list [target="+self.index+"]").click();
		self.index++;
	},
	
	del : function(){
		var self = core.module.admin.user_manager.all;
		
		var target_class = $(".user_management_list_contents").find('[selected="selected"]').attr('class');
		
		if(target_class && confirm('Are you sure?')){
			if(target_class == 'target_user_detail_view'){
				$(".user_management_list_contents").find('[target='+self.target_index+']').remove();
				$(".user_management_list_contents").find('[index='+self.target_index+']').remove();
			}
			else if(target_class == 'user_detail_view'){
				var postdata = {
					'id' : $(".user_management_list_contents").find('[selected="selected"]').attr('user_id'),
					'type' : $(".user_management_list_contents").find('[selected="selected"]').attr('type')
				}
				
				$.post('/admin/user/del', postdata, function(remove_result){
					if(remove_result){
						self.refresh();
					}
				});
			}
		}
	},
	
	register : function(){
		var self = core.module.admin.user_manager.all;
		
		var index = self.target_index;
		var postdata = {
			'id' : $(".user_management_list_contents").find("[index="+index+"] [name='user_management_signup_id_input']").val(),
			'pw' : $(".user_management_list_contents").find("[index="+index+"] [name='user_management_signup_pw_input']").val(),
			're_pw' : $(".user_management_list_contents").find("[index="+index+"] [name='user_management_signup_re_pw_input']").val(),
			'name' : $(".user_management_list_contents").find("[index="+index+"] [name='user_management_signup_name_input']").val(),
			'nick' : $(".user_management_list_contents").find("[index="+index+"] [name='user_management_signup_nick_input']").val(),
			'email' : $(".user_management_list_contents").find("[index="+index+"] [name='user_management_signup_email_input']").val(),
			'level' : $(".user_management_list_contents").find("[index="+index+"] [name='user_management_signup_level_input']").val(),
			'type' : 'password'
		}
		
		$.post('/admin/user/add', postdata, function(add_result){
			if(add_result.type == 'signup'){
				if(add_result.data){
					$(".user_management_list_contents").find(".user_management_list [target="+self.target_index+"]").remove();
					core.status.focus_on_inputbox = false;
					self.refresh();
				}
			}
			else if(add_result.type == 'check'){
				if(!add_result.data.result) core.module.auth.signup.signup_error_message(add_result.data);
			}
		});
	},
	
	refresh : function(){
		$(".user_management_list_contents").find("[mode='view']").remove();
		$(".user_management_list_contents").find("[mode='new']").hide();
		
		$(".user_management_list_contents").find(".user_management_list .user_detail_view").remove();
		$(".user_management_list_contents").find(".user_management_list").children().each(function () {
			$(this).css('background-color', '#fff');
		});
		
		this.load();
	}
}
