/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/

org.goorm.core.file._new.other = function () {
	this.dialog = null;
	this.buttons = null;
};

org.goorm.core.file._new.other.prototype = {
	init: function () {
		var self = this;
		
		var handle_ok = function() {
			var file_type = $("#new_other_file_list .selected_div").attr("value");
			console.log("1");
			var postdata = {
				current_path: core.status.current_project_path,
				file_name: $("#new_other_file_target").val()+"."+file_type
			};
			console.log(postdata);
			if(postdata.file_name=="") {
				//alert.show(core.module.localization.msg["alertFileNameEmpty"]);
				alert.show("File name is empty.");
				return false;
			}
			console.log("2");

			$.get("file/new_other", postdata, function (data) {
				console.log(data);
				if (data.err_code==0) {
					core.module.layout.project_explorer.refresh();
					self.dialog.panel.hide();
				}
				else {
					alert.show(data.message);
				}
			});
			console.log("end");
		};

		var handle_cancel = function() { 
			
			this.hide(); 
		};
		
		this.buttons = [ {text:"OK", handler:handle_ok, isDefault:true},
						 {text:"Cancel",  handler:handle_cancel}]; 
						 
		this.dialog = new org.goorm.core.file._new.other.dialog();
		this.dialog.init({
			title:"New Other File", 
			path:"configs/dialogs/org.goorm.core.file/file._new.other.html",
			width:400,
			height:400,
			modal:false,
			buttons:this.buttons,
			success: function () {
				$("#new_other_file_list .select_div").click(function() {
					$(".select_div").removeClass("selected_div");
					$(this).addClass("selected_div");
				});
			}
		});
		this.dialog = this.dialog.dialog;
		
	},
	
	show: function (context) {
		var self = this;
		$("#new_other_file_current_path").text(core.status.current_project_path+" /");
		$("#new_other_file_target").val("");
		
		this.dialog.panel.show();
	}	
};