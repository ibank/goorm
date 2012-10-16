/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/

org.goorm.core.file.open = function () {
	this.dialog = null;
	this.buttons = null;
	this.filename = null;
	this.filetype = null;
	this.filepath = null;
	this.dialog_explorer = null;
};

org.goorm.core.file.open.prototype = {
	init: function () { 
		
		var self = this;
				
		var handle_ok = function() { 
			
			var data = self.dialog_explorer.get_data();
		
			if(data.path=="" || data.name=="") {
				//alert.show(core.module.localization.msg["alertFileNameEmpty"]);
				alert.show("File Name is Empty.");
				return false;
			}

			core.module.layout.workspace.window_manager.open(data.path, data.name, data.type);
			
			this.hide(); 
		};

		var handle_cancel = function() { 
			
			this.hide(); 
		};
		
		this.buttons = [ {text:"OK", handler:handle_ok, isDefault:true},
						 {text:"Cancel",  handler:handle_cancel}]; 

		this.dialog = new org.goorm.core.file.open.dialog();
		this.dialog.init({
			title:"Open file", 
			path:"configs/dialogs/org.goorm.core.file/file.open.html",
			width:800,
			height:500,
			modal:true,
			buttons:this.buttons, 
			success: function () {
				var resize = new YAHOO.util.Resize("open_dialog_left", {
		            handles: ['r'],
		            minWidth: 200,
		            maxWidth: 400
		        });
				
		        resize.on('resize', function(ev) {
					var width = $("#open_dialog_middle").width();
		            var w = ev.width;
		            $("#open_dialog_center").css('width', (width - w - 9) + 'px');
		        });
		        
		        $("#file_open_project_type").change(function() {
		        	var type = $(this).val();
		        	$("#open_dialog_center").find(".file_item").each(function() {
		        		if (type==0) {
		        			$(this).css("display","block");
		        		}
		        		else if($(this).attr('filetype')==type) {
		        			$(this).css("display","block");
		        		}
		        		else {
		        			$(this).css("display","none");
		        		}
		        	});
		        });
		        
			}
		});
		this.dialog = this.dialog.dialog;
		
		this.dialog_explorer = new org.goorm.core.dialog.explorer();		
	},

	show: function () {
		var self = this;
	
		this.dialog.panel.show();
		
		self.dialog_explorer.init("#file_open", false);
		
	}
};