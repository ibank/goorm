/**
 * Copyright Sung-tae Ryu. All rights reserved
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.cloud.google = function () {
	
	this.handle_auth_click = null;
	this.all_data_from_gd=null;
 	this.tree_data={};			///this is root
 	this.tree_node={};
 	this.id_index={};
 	this.index_obj=[];	
};

org.goorm.core.cloud.google.prototype ={

	after_login : function(){
		var self=this;

		$('#upload_file').unbind('change');
		$('#upload_file').change(function(){
			var files = document.getElementById('upload_file').files;
			var file = files[0];

			if(file!==undefined){
				confirmation.init({
					message: core.module.localization.msg["confirmation_file_upload"],
					yes_text: core.module.localization.msg["confirmation_yes"],
					no_text: core.module.localization.msg["confirmation_no"],
					title: "Confirmation", 

					yes: function () {
						var file_name=file.name;
						self.upload(file,file_name);

						$('#upload_file').hide();

					}, no: function () {
						$('#upload_file').val("")
					}
				});
				
				confirmation.panel.show();
			}else{
				alert.show(core.module.localization.msg["alert_file_not_defined"]);
			}
		})

		$('.google_drive_login_label').hide();
		$('.google_drive_logout_label').show();
		self.display();
	},

	after_logout : function(){
		var self = this;

		$('.google_drive_login_label').show();
		$('.google_drive_logout_label').hide();

		alert.show(core.module.localization.msg["alert_google_drive_not_auth"])
		$('#cloud_selectbox').val("");
		this.handle_auth_click();
	},

	logout : function(){
		this.clear();

		var iframe=document.getElementById('google_logout_frame');
		iframe.src='https://www.google.com/accounts/Logout';
		document.getElementById('cloud_selectbox').options[0].selected=true;
		core.module.layout.cloud_explorer.on_cloud_selectbox_change("");

		$('.google_drive_login_label').show();
		$('.google_drive_logout_label').hide();
	},

	refresh : function(){
		this.clear();
		this.display();
	},

	auth : function(){
		var self = this;

		var clientId = '555016447711.apps.googleusercontent.com';
   		var scopes = 'https://www.googleapis.com/auth/drive';	
		
		function check_auth() {
      		self.gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, function(result){
      			self.handle_auth_result(result);
      		});
    		}

    		this.handle_auth_result = function(auth_result) {
			if (auth_result && !auth_result.error) {
				self.after_login();
			} else {
				self.after_logout();
			}
 		}

		this.handle_auth_click = function (event) {
   			self.gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, function(result){
				self.handle_auth_result(result);
   			});
 		}

		window.handleClientLoad = function(){   //this code is for callback in client.js 
			self.gapi = gapi;
			setTimeout(function(){
				//self.gapi.client.setApiKey(apiKey);
			  	check_auth();
			}, 500);	
		}
		//auth start body 
		$.getScript('/lib/com.cloud.code/google.client.js');
		//auth body
	},//auth end

	display : function(){
			
		var self=this;

		var treeview = {
			get_index_by_id : function(id){
				return self.id_index[id];
			},

			set_child : function(child_item, parent_item){
				parent_item.child.push(child_item);
			},

			set_family : function (callback){
				self.tree_data.child=[];

				for(var i=0;i<self.all_data_from_gd.items.length;i++){
					if(self.index_obj[i].parents && self.index_obj[i].parents[0].isRoot!=true){
			    	 			treeview.set_child(self.index_obj[i], self.index_obj[self.id_index[self.index_obj[i].parents[0].id].index] );
			    	 	}else{
		    	 			treeview.set_child(self.index_obj[i],self.tree_data);
			    	 	}
				}
				callback(true);
			},

			make_tree_data : function(callback){
				this.async_loop(self.all_data_from_gd.items.length, function(loop){

			       	 var i = loop.iteration();

		   	 		self.index_obj[i]=self.all_data_from_gd.items[i];
		   	 		self.index_obj[i].child=[];

		   	 		loop.next();

		   	 	},function(){
		   	 		treeview.set_family(callback);
		   	 	});
			},

			make_tree_node : function(data, node){
				for(var i=0;i<data.child.length;i++){
					var extension=data.child[i].fileExtension;
				
					node.children[i]={
						type : "html",
						children : []
					};
					if(extension==undefined){
						var gfiletype = data.child[i].mimeType.split('.').pop();
						var gextension = {
							'spreadsheet' : 'gssh',
							'document' : 'gwpr',
							'presentation' : 'gprs',
							'form' : 'gfom',
							'drawing' : 'gimg',
							'script' : 'gscr',
							'folder' : 'gdir'
						}
						node.children[i].filetype = gextension[gfiletype];
					}
					else
						node.children[i].filetype = extension;
					
					node.children[i].file_id = data.child[i].id;
					node.children[i].cls = (node.children[i].filetype=='gdir')? "folder gfolder":"file";
					node.children[i].title=data.child[i].title;
					node.children[i].html = "<div class='node'>" 
					 				+ "<img src=images/icons/filetype/"
					 				+ node.children[i].filetype
					 				+ ".filetype.png class='directory_icon "+node.children[i].cls+"' />"
									+ node.children[i].title
								 	+ "</div>";
					
					if(node.children[i].cls=="file"){
						node.children[i].link_url = data.child[i].alternateLink;
						node.children[i].download_url = data.child[i].webContentLink;
					}

					for(var j=0; j<data.child[i].child.length;j++)
						node.children[i].children[j]={};

					treeview.make_tree_node(data.child[i], node.children[i]);
				}
			},

			async_loop : function(iterations, func, callback){
				var index=0;
				var done = false;
				var loop={
					next : function(){
						if(done){
							return;
						}
						if(index<iterations){
							index++;
							func(loop);
						}else{
							done=true;
							callback();
						}
					},

					iteration: function(){
						return index-1;
					},

					finish: function(){
						done=true;
						callback();
					}
				};

				loop.next();
				return loop;
			}
		};

		function make_api_call_for_all_data() {
			self.gapi.client.load('drive', 'v2', function() {
				var req_all_from_gd = self.gapi.client.drive.files.list ();

				req_all_from_gd.execute(function(resp) { 
					// make tree start

					self.all_data_from_gd=resp;

					treeview.async_loop(resp.items.length, function(loop){
						var i = loop.iteration();
						var id = resp.items[i].id;
						self.id_index[id]={
							'id':resp.items[i].id,
							'index':i
						};
				
						loop.next();

					}, function(){
						treeview.make_tree_data(function(){
							var html = "";
							html +=	"<div class='node'>";
							html +=		"<img src='images/icons/filetype/gdir.filetype.png' class='directory_icon folder gfolder'>"
							html +=		"<span>Google Drive Root</span>"
							html += "</div>"

							self.tree_node = [{
								type : "html",
								children : [],
								html : html,
								cls : "folder"
							}];

							treeview.make_tree_node(self.tree_data, self.tree_node[0]);
							$(document).trigger('tree_node_complete', self.tree_node);
						});
					});
				}); 	//get all data 
			});
		}

		make_api_call_for_all_data();
	},//display end


	upload : function(uploadFile,fileName,parent){
		

		var self=this;
		var tmp=self.id_index[parent];
		//console.log(parent);
		//console.log('1',tmp);
		 var argu_parent=true;
		 if(parent==undefined){	//parent will be root
		 	argu_parent=false;
		}

		function insert_file(fileData,fileName,parents, callback) {
		
			  const boundary = '-------314159265358979323846';
			  const delimiter = "\r\n--" + boundary + "\r\n";
			  const close_delim = "\r\n--" + boundary + "--";

			  var reader = new FileReader();
			  reader.readAsBinaryString(fileData);
			  reader.onload = function(e) {
			 
			  	
			    var contentType = fileData.type || 'application/octet-stream';
			    
			    var metadata = {
			      'title': fileName,
			      'parents' : parents,
			      'mimeType': contentType
			    };
			    if(parents==0){
			    	metadata={
				      'title': fileName,
				      'mimeType': contentType
				    };
			    }

			    var base64Data = btoa(reader.result);
			
			    var multipartRequestBody =
			        delimiter +
			        'Content-Type: application/json\r\n\r\n' +
			        JSON.stringify(metadata) +
			        delimiter +
			        'Content-Type: ' + contentType + '\r\n' +
			        'Content-Transfer-Encoding: base64\r\n' +
			        '\r\n' +
			        base64Data +
			        close_delim;

			
			    var request = gapi.client.request({
			    	'title' : fileName,
			        'path': '/upload/drive/v2/files',
			        'method': 'POST',
			        'params': {'uploadType': 'multipart'},
			        'headers': {
			          'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
			        },
			        'body': multipartRequestBody});
			    if (!callback) {
			      callback = function(file) {
			      	//console.log('callback????',file);
					//$('#upload_file').show();
					notice.show(core.module.localization.msg['notice_file_upload_done']);
			        self.display();//makeApiCall_forAllData();
				  // $('#upload_file').val("")

			      };
			    }
			   /* request.execute(callback,function(data){
			    	console.log(data);
			    	notice.show(core.module.localization.msg['notice_file_upload_done']);
			    });*/
				request.execute(callback);
			 }
		}
		if(argu_parent){
			//console.log('not root')
			var parents=[];
			parents[0]={
				'id' : parent
			}
			insert_file(uploadFile,fileName,parents);
		}else{
			//console.log('root');
			insert_file(uploadFile,fileName,0);
		}	

	},	//upload end

	delete :function(target){
		var self=this;

		function delete_file(fileId) {
 			var request = gapi.client.drive.files.delete({
   				 'fileId': fileId
  			});

 		 	request.execute(function(){
 		 		self.display();
 		 	});
		}

		delete_file(target);
	},//delete end

	update : function(target){
		var self=this;
	},//update end

	clear : function(){
		$('#google_drive_treeview').empty();
	}
	
};

