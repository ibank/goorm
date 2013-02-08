/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.cloud.explorer = function () {
	this.treeview = null;
	this.current_tree_data = null;	
	this.which_cloud=null;

	this.google=null;
};

org.goorm.core.cloud.explorer.prototype = {
	init: function () {
		$("#cloud_explorer").empty();
		var self = this;
		
		this.google = new org.goorm.core.cloud.google();
	
		$("#cloud_explorer").prepend("<div id='cloud_selector'></div>");
		$("#cloud_selector").append("<label class='selectbox'><select id='cloud_selectbox'></select></label>")
		$("#cloud_selector").append("<iframe name='google_logout_frame' id='google_logout_frame' style='display:none'></iframe>")
		$('#cloud_explorer').append('<div id="google_drive_treeview" class="directory_treeview"></div>')

		$("#cloud_selectbox").change(function() {
			self.on_cloud_selectbox_change($(this).val());
		});
	
		this.make_cloud_selectbox();
		console.log(" cloud load complete");
	},

	make_cloud_selectbox: function() {
		var self = this;

		$("#cloud_selectbox").empty();
		
		$("#cloud_selectbox").append("<option value='' selected>Select Cloud</option>");
		$("#cloud_selectbox").append("<option value='google_drive'>Google Drive</option>");	
	},
		
	on_cloud_selectbox_change: function (which_cloud) {
		var self = this;

		this.which_cloud=which_cloud;
		
		self.clear();

		if (which_cloud!="") {
			if(which_cloud=="google_drive"){
				self.select('google_drive');

				$(document).unbind('tree_node_complete')
				$(document).bind('tree_node_complete', function(evt, data){
					if (data != null) {
						var sorting_data = eval(data);

						self.treeview = new YAHOO.widget.TreeView("google_drive_treeview", sorting_data);
						self.current_tree_data = self.treeview.getTreeDefinition();

						self.treeview.subscribe("clickEvent", function(nodedata) { return false; });
						self.treeview.subscribe("dblClickEvent", function(nodedata) {
							if(nodedata.node.data.cls == "file") {
									window.open(nodedata.node.data.link_url);
							}
							else if(/folder/.test(nodedata.node.data.cls)) {
								if (nodedata.node.expanded) {
									nodedata.node.collapse();
								}
								else { 
									nodedata.node.expand();
								}
							}
						});
							

						self.treeview.subscribe("expandComplete", function () {
							self.refresh_context_menu('google_drive');
							self.current_tree_data = self.treeview.getTreeDefinition();
						});
						
						self.treeview.render();

						self.set_context_menu('google_drive');
					}

				});

				self.google.auth();
			}
		}
	},

	set_context_menu: function(cloud) {
		var self = this;

		self.context_menu_file = new org.goorm.core.menu.context();
		self.context_menu_file.init("configs/menu/org.goorm.core.cloud/"+cloud+".explorer.file.html", cloud+".explorer.file", "", null, null, function(){
			self.context_menu_file.menu.subscribe('beforeShow', function(){
				var target = $('#google_drive_treeview').find('.ygtvfocus')[0];
				var link = self.treeview.getNodeByElement(target).data.download_url;

				if(link){
					$('[action="download_google_drive_file"]').attr('href', link);
					$('[action="download_google_drive_file"]').show();
				}
				else{
					$('[action="download_google_drive_file"]').hide();
				}
			});
		});
		
		self.context_menu_folder = new org.goorm.core.menu.context();
		self.context_menu_folder.init("configs/menu/org.goorm.core.cloud/"+cloud+".explorer.folder.html", cloud+".explorer.folder", "", null, null, function(){
			self.context_menu_folder.menu.subscribe('beforeShow', function(){
				var target = $('#google_drive_treeview').find('.ygtvfocus')[0];

				if(self.treeview.getNodeByElement(target).expanded){
					$('[action="google_folder_open_context"]').hide();
					$('[action="google_folder_close_context"]').show();
				}
				else{
					$('[action="google_folder_open_context"]').show();
					$('[action="google_folder_close_context"]').hide();
				}
			})

			core.module.action.init();
			core.module.localization.refresh()
		});

		self.refresh_context_menu(cloud);
	},

	refresh_context_menu : function(cloud){
		var self = this;

		if(cloud == 'google_drive'){
			$("#google_drive_treeview").unbind("mousedown");		
			$("#google_drive_treeview").mousedown(function (e) {

				self.context_menu_file.menu.hide()
				self.context_menu_folder.menu.hide();
			});


			$("#google_drive_treeview").find(".ygtvcell").unbind("mousedown");		
			$("#google_drive_treeview").find(".ygtvcell").mousedown(function (e) {

				self.context_menu_file.menu.hide()
				self.context_menu_folder.menu.hide();

				if ($(this).hasClass("ygtvfocus") == false) {
					$("#google_drive_treeview").find(".ygtvfocus").removeClass("ygtvfocus");
					
					if ($(this).hasClass("ygtvcontent")) {
						$(this).prev().addClass("ygtvfocus");
						$(this).addClass("ygtvfocus");		
					}
				}

				if (e.which == 3) {
					if ($(this).find("img").hasClass("file")) {	
						var offset = 0;
							
						if ( ($(window).height() - 36) < (e.clientY + $("div[id='google_drive.explorer.file']").height()) ) {
							offset = e.clientY + $("div[id='google_drive.explorer.file']").height() - $(window).height() + 36;
						};
						
						self.context_menu_file.menu.show();

						$("div[id='google_drive.explorer.file']").css("left", e.clientX);
						$("div[id='google_drive.explorer.file']").css("top", e.clientY - offset);
					}
					else if ($(this).find("img").hasClass("folder")) {
						var offset = 0;
							
						if ( ($(window).height() - 36) < (e.clientY + $("div[id='google_drive.explorer.folder']").height()) ) {
							offset = e.clientY + $("div[id='google_drive.explorer.folder']").height() - $(window).height() + 36;
						};
						
						self.context_menu_folder.menu.show();

						$("div[id='google_drive.explorer.folder']").css("left", e.clientX);
						$("div[id='google_drive.explorer.folder']").css("top", e.clientY - offset);
					}
				}

				e.stopPropagation();
				e.preventDefault();
				return false;
			});

	 		$(document).on({
	 			mouseenter : function(){
	 				$(this).addClass('yuimenuitem-selected')
	 			},
	 			mouseleave : function(){
	 				$(this).removeClass('yuimenuitem-selected')
	 			}
	 		}, ".yuimenuitem")
		}
	},

	select : function(cloud){
		this.clear();
		$('#'+cloud+'_treeview').show()
	},

	clear : function(){
		$('#google_drive_treeview').hide();
	}
}