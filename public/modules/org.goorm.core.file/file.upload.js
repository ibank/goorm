/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/


 //this file upload means google drive upload
/*
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
	
		self.target_dir_id=target_dir_id
		//target uuu

		// /file import code
		// 	$("#upload_output").empty();
		// 	$("#file_import_file").val("");
		// /
		console.log('target!!!!!',self.target_dir_id);


		self.dialog_cloud_explorer.init("#file_upload", false);
		
		this.dialog.panel.show();
	}
};*/



org.goorm.core.file.upload = function () {
	this.dialog = null;
	this.buttons = null;
	this.tabview = null;
	this.dialog_explorer = null;
};

org.goorm.core.file.upload.prototype = {
	init: function () { 
		var self = this;
		
		var handle_ok = function() {			
			var data = self.dialog_explorer.get_data();

			if(data.path=="" || data.name=="") {
				alert.show(core.module.localization.msg["alert_filename_empty"]);
				// alert.show("Not Selected.");
				return false;
			}

			var name = core.user.id;

			var postdata = {
				user: name,
				path: data.path,
				file: data.name,
			};
	

			core.module.loading_bar.start("Export processing...");
			
			$.get("file/export", postdata, function (data) {
				
				
				
				//console.log('data from server',data);
				if (data.err_code == 0) {
					self.dialog.panel.hide();
					
					
				
					$.get("send_file",
					{
						file : data.path
					},
					function(data){
						//console.log('sendfile result',data);
						var please=data;
						var aFileParts = [];
 						aFileParts.push(please);
 						var oMyBlob = new Blob(aFileParts); // the blob
						core.module.layout.cloud_explorer.google.upload(oMyBlob, postdata.file , core.cloud.target_dir_id);
						core.module.loading_bar.stop();
					});

				}
				else {
					alert.show(data.message);
				}
			});






		};

		var handle_cancel = function() { 
			
			this.hide(); 
		};
		
		this.buttons = [ {text:"<span localization_key='ok'>OK</span>", handler:handle_ok, isDefault:true},
						 {text:"<span localization_key='cancel'>Cancel</span>",  handler:handle_cancel}]; 
						 
		this.dialog = new org.goorm.core.file._export.dialog();
		this.dialog.init({
			localization_key:"title_cloud_upload_file",
			title:"Upload File", 
			path:"configs/dialogs/org.goorm.core.file/file.upload.html",
			width:800,
			height:500,
			modal:true,
			yes_text:"<span localization_key='open'>Open</span>",
			no_text:"<span localization_key='cancel'>Cancel</span>",
			buttons:this.buttons,
			success: function () {
				var resize = new YAHOO.util.Resize("file_cloud_upload_dialog_left", {
		            handles: ['r'],
		            minWidth: 200,
		            maxWidth: 400
		        });
				
		        resize.on('resize', function(ev) {
					var width = $("#file_cloud_upload_dialog_middle").width();
		            var w = ev.width;
		            $("#file_cloud_upload_files").css('width', (width - w - 9) + 'px');
		        });
			}
		});
		this.dialog = this.dialog.dialog;
		
		this.dialog_explorer = new org.goorm.core.dialog.explorer();
		
		//this.dialog.panel.setBody("AA");
	},
	
	show: function (target_dir_id) {
		var self = this;
		core.cloud={};
		core.cloud.target_dir_id=target_dir_id;
		self.dialog_explorer.init("#file_cloud_upload", false);
	
		this.dialog.panel.show();
	}
};
