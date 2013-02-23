/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/


 //this file upload means google drive upload

org.goorm.core.file.upload = function () {
	this.dialog = null;
	this.buttons = null;
	this.filename = null;
	this.filetype = null;
	this.filepath = null;
	this.dialog_cloud_explorer = null;
	this.target_dir_id=null;
};

org.goorm.core.file.upload.prototype = {
	init: function () { 
		
		var self = this;
				
		var handle_ok = function() { 
			//console.log('hi i am ok ', self.target_dir_id)
			var upload_file=document.getElementById('file_upload_file').files[0];
			//console.log('target is', self.target_dir_id, 'file is',upload_file);
			if(upload_file!==undefined)
			{
				console.log('upload file is',upload_file);
				core.module.layout.cloud_explorer.google.upload(upload_file,upload_file.name, core.cloud.target_id);
				//console.log('upload block by comment')
			}else{
				//alert('Choose');
			}

			this.hide(); 
		};

		var handle_cancel = function() { 
			
			this.hide(); 
		};
	
		
		this.buttons = [ {text:"<span localization_key='ok'>OK</span>", handler:handle_ok, isDefault:true},
						 {text:"<span localization_key='cancel'>Cancel</span>",  handler:handle_cancel}]; 

		this.dialog = new org.goorm.core.file.upload.dialog();
		this.dialog.init({
			localization_key:"title_select_file",
			title:"select file", 
			path:"configs/dialogs/org.goorm.core.file/file.upload.html",
			width:800,
			height:500,
			modal:true,
			buttons:this.buttons, 
			
		});
		this.dialog = this.dialog.dialog;
		
		this.dialog_cloud_explorer = new org.goorm.core.dialog.cloud_explorer();		
	},

	show: function (target_dir_id) {
		var self = this;
	
		//self.target_dir_id=target_dir_id
		//target uuu

		/*file import code
			$("#upload_output").empty();
			$("#file_import_file").val("");
		*/


		self.dialog_cloud_explorer.init("#file_upload", false);
		
		this.dialog.panel.show();
	}
};