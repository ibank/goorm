/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.help.contents = function () {
	this.dialog = null;
	this.buttons = null;
	this.tabview = null;
	this.treeview = null;
	this.top = null;
	this.title = null;
};

org.goorm.core.help.contents.prototype = {
	init: function () {
		var self = this;
		
		var handle_close = function() { 
			
			this.hide(); 
		};
		
		this.buttons = [ {text:"<span localization_key='close'>Close</span>", handler:handle_close, isDefault:true} ];
		
		this.top = [];
		this.title = [];
		
		this.dialog = new org.goorm.core.help.contents.dialog();
		this.dialog.init({
			localization_key:"title_help_contents",
			title:"Help Contents", 
			path:"configs/dialogs/org.goorm.core.help/help.contents.html",
			width:900,
			height:600,
			modal:true,
			yes_text: "<span localization_key='close'>Close</span>",
			buttons:this.buttons,
			success: function () {
				//TabView Init
				//self.tabview = new YAHOO.widget.TabView('help_contentsContents');
				
				//TreeView Init
				// var treeviewUrl = "help/help.treeview";	
// 				
				// $.ajax({
					// url: treeviewUrl,			
					// type: "POST",
					// data: "path="+self.path,
					// success: function(data) {
						//var sorting_data = eval(data);
						
						
						//self.load();
						
						var resize = new YAHOO.util.Resize("help_contents_left", {
				            handles: ['r'],
				            minWidth: 150,
				            maxWidth: 350
				        });
						
						resize.on('resize', function(ev) {
				            var w = ev.width;
				            $("#help_contents_middle").css('width', (900 - w - 50) + 'px');
				        });
				        
						self.treeview = new YAHOO.widget.TreeView("help_contents_treeview");
						self.treeview.render();
						
						for(var i=0; i<self.treeview.root.children.length; i++){
							var target = self.treeview.root.children[i];
							$('#'+target.labelElId).attr('localization_key', target.label)
						}
						
						//$(".yui-content").append(sorting_data[i].url.text());
						
								
					// }
				// });
				
			}			
		
		});
				

		
		
		
		
		
		this.dialog = this.dialog.dialog;
		
		
	},
	
	load: function () {
		var self = this;
		
		$.getJSON("help/get_readme_markdown?language=" + localStorage.getItem("language"), function (data) {
			$("#help_contents_middle").html(data.html);
			
			
			$('#help_contents_middle').find('h2').each(function (i) {
				self.top.push($(this).position().top);
				self.title.push($(this).text());
			});
			
			//console.log(self.top);
			
			$('#help_contents_treeview').find('a').each(function (i) {
				if (i % 2 == 1) {
					//console.log($(this).html());
					var top = self.top.shift();
					var title = self.title.shift();
					
					$(this).html(title);
					$(this).parent().unbind("click");
					$(this).parent().click(function () {
						$('#help_contents_middle').scrollTop(top);
					});
				}
			});
		});
	},

	show: function () {
		this.dialog.panel.show();
		
		
		
		
		// this.treeview.subscribe("clickEvent", function(nodedata) {	
// 
			// var contentsUrl = nodedata.node.data.url;
// 						
// 			
// 					
			// $.ajax({
				// url: contentsUrl,			
				// type: "POST",
				// data: "path="+self.path,
				// success: function(data) {
					// $("#help_contents").empty();
					// $("#help_contents").append(data);	
// 							
				// }
			// });
// 				
// 			
// 			
			// //alert.show(label);
// 
			// /*if(nodedata.node.data.cls == "file") {
				// var filename = nodedata.node.data.filename;
				// var filetype = nodedata.node.data.filetype;
				// var filepath = nodedata.node.data.parentLabel;
// 				
				// self.window_manager.open(filepath, filename, filetype);
			// }*/
		// });
// 		
		
		
	}
	
	
};
