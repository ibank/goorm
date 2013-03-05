/**
 * Copyright Sung-tae Ryu, Youseok Nam. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/
 
org.goorm.core.auth.manage = {
	dialog: null,
	buttons: null,

	init : function(){
		var self = this;
		this.manager = org.goorm.core.auth.manage.manager;
		this.manager.init();
		
		this.dialog = org.goorm.core.auth.manage.dialog;
	},

	init_dialog: function () {
		var self = this;

		var handle_ok = function() {
			this.hide();
		};

		var handle_cancel = function() { 
			this.hide();
		};
		
		this.buttons = [ {text:"<span localization_key='ok'>OK</span>", handler:handle_ok, isDefault:true},
						 {text:"<span localization_key='cancel'>Cancel</span>",  handler:handle_cancel}];
		
		this.dialog.init({
			localization_key:"title_account_management",
			title:"Account Management", 
			path:"configs/dialogs/org.goorm.core.auth/auth.manage.html",
			width:700,
			height:500,
			modal:true,
			buttons:this.buttons,
			success: function () {
				// create default dialog tree and tabview
				$.getJSON("configs/dialogs/org.goorm.core.auth/tree.json", function(json){
					// construct basic tree structure
					self.manager.create_treeview(json);
					self.manager.create_tabview(json);

					// TreeView labelClick function
					self.manager.treeview.subscribe("clickEvent", function(nodedata){
						var label = nodedata.node.html;
						label = label.replace(/[/#. ]/,"");
						if(/localization_key/.test(label)) label = $('#'+nodedata.node.contentElId).children().attr('tab_action');
						label = label.replace(" ", "");
						
						$("#auth_manage_tabview > *").hide();
						$("#auth_manage_tabview #"+label).show();

						// File_Type이 클릭될 떄에는 항상 오른쪽 칸이 refresh되도록 설정
						// if (/FileType/.test(label)) {
						// 	$(".filetype_list").find("div").first().trigger('click');
						// }
					});

					// Collaboration
					//
					var collaboration = org.goorm.core.auth.manage.collaboration;
					collaboration.init();

					$('#ProjectList [localization_key="collaboration"]').unbind('click')
					$('#ProjectList [localization_key="collaboration"]').click(function(e){
						collaboration.refresh();
					})

					set_dialog_button();

					self.dialog.panel.subscribe('beforeShow', function(e){
						collaboration.refresh();
					})

					core.module.localization.refresh();
				});
			}
		});
		
		var set_dialog_button = function(){
			// set Apply, restore_default Button
			$("#auth_manage_tabview").find(".apply").each(function(i){
				$(this).attr("id","applyBt_"+i);
				new YAHOO.widget.Button("applyBt_"+i,{onclick:{fn:function(){
					self.apply($("#auth_manage_tabview #applyBt_"+i).parents(".yui-navset").attr("id"));
				}}, label:'<span localization_key="apply">Apply</span>' });
			});
			
			$("#auth_manage_tabview").find(".restore_default").each(function(i){
				$(this).attr("id","restore_defaultBt_"+i);
				new YAHOO.widget.Button("restore_defaultBt_"+i,{onclick:{fn:function(){
					self.restore_default($("#auth_manage_tabview #restore_defaultBt_"+i).parents(".yui-navset").attr("id"));
				}}, label:'<span localization_key="restore_default">Restore Default</span>' });
			});
		};
		
		this.dialog = this.dialog.dialog;
	}
}