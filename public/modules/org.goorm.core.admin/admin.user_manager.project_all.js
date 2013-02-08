

org.goorm.core.admin.user_manager.project_all = function () {

};

org.goorm.core.admin.user_manager.project_all.prototype = {
	init : function() {
		this.load();
	},
	
	load : function(){
		var self = this;
		
		$.get("/admin/project/list", function(project_list){
			if(project_list){
				for(var i=0; i<project_list.length; i++){
					var project = project_list[i];
					$(".user_management_projectlist_contents").find(".user_management_project_list").append("<div style='padding:3px;' project_path="+project.project_path+"  class='project_detail_view'>"+project.project_name+"</div>");
				}
				
				$(".user_management_projectlist_contents").find(".project_detail_view").click(function(){
					$(".user_management_projectlist_contents").find(".user_management_project_list").children().each(function () {
						$(this).removeAttr('selected');
						$(this).css('background-color', '#fff');
					});
					$(this).attr('selected', 'selected');
					$(this).css('background-color', '#b3d4ff');
					
					var target = {};
					target['project_path'] = $(this).attr('project_path');
					
					self.detail_project(target);
				});
			}
		});

		$('#user_management_register').hide();
	},

	detail_project : function(project){
		var self = this;
		$(".user_management_projectlist_contents").find(".user_management_project_detail [mode='view']").remove();
		
		$.get('/admin/project/get', project, function(project_data){
			if(project_data){
				var detail_html = self.set_detail_html('view');
				$(".user_management_projectlist_contents").find(".user_management_project_detail").append(detail_html);
				
				self.set_detail_project_content(project_data);
			}
		});
	},

	set_detail_html : function(mode){
		var detail_html = "";
		
		detail_html += 	'<div class="user_management_project_info" mode='+mode+'>';
		detail_html += 		'<span class="user_management_project_span"> Author : </span>'
		detail_html += 		'<input type="text" name="user_management_author_input" class="user_management_project_input" readonly="readonly">'
		detail_html += 		'<span class="user_management_project_span"> Name : </span>'
		detail_html += 		'<input type="text" name="user_management_name_input" class="user_management_project_input" readonly="readonly">'
		detail_html += 		'<span class="user_management_project_span"> Path : </span>'
		detail_html += 		'<input type="text" name="user_management_path_input" class="user_management_project_input" readonly="readonly">'
		detail_html += 		'<span class="user_management_project_span"> Type : </span>'
		detail_html += 		'<input type="text" name="user_management_type_input" class="user_management_project_input" readonly="readonly">'
		detail_html += 		'<span class="user_management_project_div"> Involved Developer : </span>'
		detail_html += 		'<div name="user_management_collaboration_input" style="width: 165px; height: 190px; overflow-y: scroll; border: 1px solid #CCC; font-size: 11px; background-color: white; float: left; padding: 3px; margin: 4px;"></div>'
		detail_html += 	'</div>';
		
		return detail_html;
	},

	set_detail_project_content : function(project_data){
		$('[mode="view"]').find('[name="user_management_author_input"]').val(project_data.author_id);
		$('[mode="view"]').find('[name="user_management_name_input"]').val(project_data.project_name);
		$('[mode="view"]').find('[name="user_management_path_input"]').val(project_data.project_path);
		$('[mode="view"]').find('[name="user_management_type_input"]').val(project_data.project_type);
		$('[mode="view"]').find('[name="user_management_collaboration_input"]').append(project_data.collaboration_list.join("<br />"));
	},

	refresh : function(){
		$(".user_management_projectlist_contents").find("[mode='view']").remove();
		
		$(".user_management_projectlist_contents").find(".user_management_project_list .project_detail_view").remove();
		$(".user_management_projectlist_contents").find(".user_management_project_list").children().each(function () {
			$(this).css('background-color', '#fff');
		});
		
		this.load();
	},
	
	load_default : function(){
		
	}
}
