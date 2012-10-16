/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/

org.goorm.core.help.contents = function () {
	this.dialog = null;
	this.buttons = null;
	this.tabview = null;
	this.treeview = null;
};

org.goorm.core.help.contents.prototype = {
	init: function () {
		var self = this;
		
		var handle_ok = function() { 
			
			this.hide(); 
		};

		var handle_cancel = function() { 
			
			this.hide(); 
		};
		
		this.buttons = [ {text:"OK", handler:handle_ok, isDefault:true},
						 {text:"Cancel",  handler:handle_cancel}]; 
						 
		this.dialog = new org.goorm.core.help.contents.dialog();
		this.dialog.init({
			title:"Help Contents", 
			path:"configs/dialogs/org.goorm.core.help/help.contents.html",
			width:900,
			height:600,
			modal:true,
			yes_text: "OK",
			no_text: "Close",
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
						var resize = new YAHOO.util.Resize("help_contents_left", {
				            handles: ['r'],
				            minWidth: 150,
				            maxWidth: 350
				        });
						
						resize.on('resize', function(ev) {
				            var w = ev.width;
				            $("#help_contents_middle").css('width', (900 - w - 30) + 'px');
				        });
				        
						self.treeview = new YAHOO.widget.TreeView("help_contents_treeview");
						self.treeview.render();
								
						
						
						//$(".yui-content").append(sorting_data[i].url.text());
						
								
					// }
				// });
				
			}			
		
		});
				

		
		
		
		
		
		this.dialog = this.dialog.dialog;
		
		
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
