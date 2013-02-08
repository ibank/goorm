/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.help.bug_report = function () {
	this.dialog = null;
	this.buttons = null;
	this.tabview = null;
	this.treeview = null;
};

org.goorm.core.help.bug_report.prototype = {
	init: function () {
		var self = this;
		
		var handle_ok = function() {
			var pan = this;
			
			if($("#bug_reports_title").val()=="") {
				alert.show(core.module.localization.msg["alert_title_empty"]);
				return false;
			}
			else if($("#bug_reports_author").val()=="") {
				alert.show(core.module.localization.msg["alert_author_empty"]);
				return false;
			}
			else if($("#bug_reports_email").val()=="") {
				alert.show(core.module.localization.msg["alert_email_empty"]);
				return false;
			}
			else if($("#bug_reports_version").val()=="") {
				alert.show(core.module.localization.msg["alert_version_empty"]);
				return false;
			}
			else if($("#bug_reports_module").val()=="") {
				alert.show(core.module.localization.msg["alert_module_empty"]);
				return false;
			}
			else if($("#bug_reports_content").val()=="") {
				alert.show(core.module.localization.msg["alert_contents_empty"]);
				return false;
			}
			
			var postdata = {
				title: $("#bug_reports_title").val(),
				explanation: $("#bug_reports_content").val(),
				author: $("#bug_reports_author").val(),
				email: $("#bug_reports_email").val(),
				version: $("#bug_reports_version").val(),
				module: $("#bug_reports_module").val()
			};
						
			$.get("/help/send_to_bug_report", postdata, function (data) {
				if(data.err_code==0) {
					notice.show(core.module.localization.msg["notice_write_done"]);
					pan.hide(); 
				}
				else {
					alert.show(core.module.localization.msg["alert_cannot_write"]);
					pan.hide(); 
				}
			});		
		};
		
		var handle_cancel = function() {
			this.hide();
		};
		
		this.buttons = [ {text:"<span localization_key='send'>Send</span>", handler:handle_ok, isDefault:true},
						 {text:"<span localization_key='cancel'>Cancel</span>",  handler:handle_cancel}];  
						 
		this.dialog = new org.goorm.core.help.about.dialog();
		this.dialog.init({
			localization_key:"title_send_bug_report",
			title:"Send Bug Report", 
			path:"configs/dialogs/org.goorm.core.help/help.bug_report.html",
			width:620,
			height:520,
			modal:true,
			buttons:this.buttons,
			success: function () {
				
			}			
		});
		this.dialog = this.dialog.dialog;
	}, 

	show: function () {
		var name = core.user.name;
		
		$("#bug_reports_author").val(name);
		$("#bug_reports_author").attr('readonly', 'readonly');
		$("#bug_reports_author").addClass('readonly')
		$("#bug_reports_title").val("");
		$("#bug_reports_email").val("");
		$("#bug_reports_version").val(core.env.version);
		$("#bug_reports_module").val("");
		$("#bug_reports_content").val("");
		this.dialog.panel.show();
	}
};
