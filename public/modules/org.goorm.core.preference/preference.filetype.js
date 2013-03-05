/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.preference.filetype = {
	add_button: null,
	del_button: null,
	save_button: null,
	is_adding: false,

	init: function () {
		var self = this;
		
		// Initializing
		this.init_filetype_tab();
		
		this.is_adding = false;
		core.module.auth.get_info(function(user_reg){
			$.getJSON("auth/get_info", function(user_data){
				if(user_data && (user_data.level == 'Assistant')){
					self.readonly = false;
					// Buttons on dialog
					self.add_button =  new YAHOO.widget.Button("filetype_add", { onclick: { fn: function() { self.add(); } }, label:'<span localization_key="add">Add</span>' });
					self.del_button =  new YAHOO.widget.Button("filetype_delete", 
						{
							onclick: { 
								fn: function() { 
									confirmation.init({
										// title: core.module.localization.msg["confirmation_new_title"], 
										message: core.module.localization.msg["confirmation_delete_filetype"],
										yes_text: core.module.localization.msg["confirmation_yes"],
										no_text: core.module.localization.msg["confirmation_no"],
							
										//title: "Confirmation", 
										//message: "Exist file. Do you want to make anyway?",
										//yes_text: "yes",
										//no_text: "no",
							
										title: "Confirmation", 
										// message: "<span localization_key='confirmation_new_message'>Exist file. Do you want to make anyway?</span>",
										// yes_text: "<span localization_key='yes'>Yes</span>",
										// no_text: "<span localization_key='no'>No</span>",
							
							
										yes: function () {
											self.del();
										}, no: function () {
										}
									});
									
									confirmation.panel.show();
								}
							}, 
							label:'<span localization_key="delete">Delete</span>'
						 });
					self.save_button =  new YAHOO.widget.Button("filetype_save", { onclick: { fn: function() { self.save(); } }, label:'<span localization_key="save">Save</span>' });
				} else {
					self.readonly = true;
					$('#filetype_add').hide();
					$('#filetype_delete').hide();
					$('#filetype_save').hide();
				}
			});
		});
		
	},

	add: function () {
		var self = this;
		
		if (self.is_adding == false) {
			self.is_adding = true;
			
			self.update();
			// Temporary type element is added to file type list.
			$(".filetype_contents").find(".filetype_list").append("<div class='list_item new_extension'>New Extention</div>");
			$(".filetype_contents").find(".filetype_list").scrollTop(9999999);
			
			// Event handler for creating filetype detail view is registered
			$(".filetype_contents").find(".filetype_list").find(".new_extension").click(function () {
				
				// highlighting in filetype list
				$(".filetype_contents").find(".filetype_list").children().each(function () {
					$(this).css('background-color', '#fff');
				});
				$(this).css('background-color', '#b3d4ff');
				
				// removing old filetype detail view
				$(".filetype_contents").find(".filetype_detail").children().each(function() { 
					$(this).remove(); 
				});
				
				// creating new filetype detail view
				self.create_filetype_detail("", null, "", null, null);
			});
			
			$(".filetype_contents").find(".filetype_list").find(".new_extension").trigger("click");
		}
	},

	del: function () {
		var self = this;
		
		// This part find file type is viewing in filetype detail view from filetype list and remove it.
		$(".filetype_contents").find(".filetype_list").children().each(function() {
			var target = $(".filetype_contents").find(".file_extension").val() || 'new_extension';
			
			if ($(this).text() == target) {
				var temp = [];
				for (var i = 0; i < core.filetypes.length; i++) {
					if (core.filetypes[i].file_extension != $(this).text()) {
						
						// Keep filetype element except one user want to delete.
						temp.push(core.filetypes[i]);
					}
				}
				
				// Update filetype information.
				core.filetypes = temp;
				
				// Remove this filetype from filetype list.
				$(this).remove();
				
				var filedata = JSON.stringify(core.filetypes, null, '\t');

				$.ajax({
					url: "preference/put_filetypes",
					type: "GET",
					data: { data: filedata },
					success: function(data) {
						//console.log("Save complete! ( filetypes.json )");
					}
				});
			}
		});
		
		// Remove this filetype detail from filetype detail view.
		$(".filetype_contents").find(".filetype_detail").children().each(function() {
			$(this).remove();
		});
				
		
	},
	
	save: function() {
		var self = this;
		var found = false;

		var old_extension = $(".filetype_contents").find(".filetype_detail").find(".file_extension_hidden").val();
		var new_extension = $(".filetype_contents").find(".filetype_detail").find(".file_extension").val();
		
		// If the file type of current information is already exist, update the information
		$(core.filetypes).each(function (i) {
			if (this.file_extension == new_extension && this.file_extension != old_extension) {
				found = true;
			}
		});
			
		if (found) {
			alert.show(core.module.localization.msg.alert_filetype_same_name);
		}
		else {
			self.update();
			
			var filedata = JSON.stringify(core.filetypes, null, '\t');
			
			$.ajax({
				url: "preference/put_filetypes",
				type: "GET",
				data: { data: filedata },
				success: function(data) {
					core.module.toast.show(core.module.localization.msg['toast_filetype_save_complete']);
					
					//self.update();
					
					if (self.is_adding == true) {
						self.is_adding = false
					}
				}
			});
		}
	},
	
	update: function () {
		var self = this;
		
		var found = false;

		if ($(".filetype_contents").find(".filetype_detail").find(".file_extension").length != 0) {
			var old_extension = $(".filetype_contents").find(".filetype_detail").find(".file_extension_hidden").val();
			var new_extension = $(".filetype_contents").find(".filetype_detail").find(".file_extension").val();
			
			// If the file type of current information is already exist, update the information
			for (var i = 0; i < core.filetypes.length; i++) {
			//	console.log($(".filetype_contents").find(".filetype_detail").find(".file_extension").val());
				
				if (core.filetypes[i].file_extension == old_extension) {
					found = true;
					
					core.filetypes[i].file_extension = new_extension;
					core.filetypes[i].editor = $(".filetype_contents").find(".filetype_detail").find(".editor").attr("value");
					core.filetypes[i].type = $(".filetype_contents").find(".filetype_detail").find(".type").attr("value");
					core.filetypes[i].mode = $(".filetype_contents").find(".filetype_detail").find(".mode").attr("value");
					core.filetypes[i].description = $(".filetype_contents").find(".filetype_detail").find(".description").val();
					
					
					$(".filetype_contents .filetype_list ." + old_extension).html(core.filetypes[i].file_extension);
					$(".filetype_contents .filetype_list ." + old_extension).removeClass(old_extension).addClass(new_extension);
				}
			}
			// If the file type is new, add the information of the new file type
			if (found == false && new_extension != "") {
				var temp = {
					file_extension: new_extension,
					editor: $(".filetype_contents").find(".filetype_detail").find(".editor").attr("value"),
					description: $(".filetype_contents").find(".filetype_detail").find(".description").val(),
					type: $(".filetype_contents").find(".filetype_detail").find(".type").attr("value"),
					mode: $(".filetype_contents").find(".filetype_detail").find(".mode").attr("value")
				}
				//console.log("push?!")
				core.filetypes.push(temp);
				
				// Temporary name in file type list have to be updated to right file type name
				var ext = $(".filetype_contents").find(".filetype_detail").find(".file_extension").val();
				
				//console.log(ext);
				
				$(".filetype_contents").find(".filetype_list").find(".new_extension").html(ext);
				$(".filetype_contents").find(".filetype_list").find(".new_extension").addClass(ext);
				
				$(".filetype_contents").find("."+ext).click(function () {
					
					self.update();
					// highlight refresh
					$(".filetype_contents").find(".filetype_list").children().each(function () {
						$(this).css('background-color', '#fff');
					});
					$(this).css('background-color', '#b3d4ff');
					
					// clearing type information area 
					$(".filetype_contents").find(".filetype_detail").children().each(function() { 
						$(this).remove(); 
					});
					
					var extension = $(this).text();
					var editor = self.get_filetype_info(extension, "editor");
					var description = self.get_filetype_info(extension, "description");
					var type = self.get_filetype_info(extension, "type");
					var mode = self.get_filetype_info(extension, "mode");
					self.create_filetype_detail(extension, editor, description, type, mode);
				});
			}
		}		

	},

	get_filetype_info: function (ext, attr) {
		
		for (var i = 0; i < core.filetypes.length; i++) {
			if (core.filetypes[i].file_extension == ext) {
				if (attr == "editor")
					return core.filetypes[i].editor;
				else if (attr == "description")
					return core.filetypes[i].description;
				else if (attr == "type")
					return core.filetypes[i].type;
				else if (attr == "mode")
					return core.filetypes[i].mode;					
			}
		}
	},

	init_filetype_tab: function () {
	
		var self = this;
		
		// Get filetype information from the file, filetype.json.
		$.getJSON("configs/filetype/filetype.json", function(data) {
			
			// Loading the information to core.filetypes.
			core.filetypes = eval(data);
			
			var filetypes = core.filetypes;
		
			// For all filetypes, 
			for (var i = 0; i<core.filetypes.length; i++) {
				
				var extension_name = filetypes[i].file_extension;
				var editor = filetypes[i].editor;
				var description = filetypes[i].description;
				var type = filetypes[i].type;
				var mode = filetypes[i].mode;
				
				// Add filetype label to filetype list,
				$(".filetype_contents").find(".filetype_list").append("<div class='list_item "+extension_name+"'>"+extension_name+"</div>");
				
				// And register event handler.
				$(".filetype_contents").find("."+extension_name).click(function () {
					
					self.update();
					// highlight refresh
					$(".filetype_contents").find(".filetype_list").children().each(function () {
						$(this).css('background-color', '#fff');
					});
					$(this).css('background-color', '#b3d4ff');
					
					// clearing type information area 
					$(".filetype_contents").find(".filetype_detail").children().each(function() { 
						$(this).remove(); 
					});	
					
					var extension = $(this).text();
					var editor = self.get_filetype_info(extension, "editor");
					var description = self.get_filetype_info(extension, "description");
					var type = self.get_filetype_info(extension, "type");
					var mode = self.get_filetype_info(extension, "mode");
					self.create_filetype_detail(extension, editor, description, type, mode);
					
				});
				
				$(".filetype_contents").find(".filetype_list").find(".list_item:eq(0)").trigger("click");
			} 
		});
	},
	
	create_filetype_detail: function (extension_name, editor, description, type, mode) {
		// Creating name field.
		$(".filetype_contents").find(".filetype_detail").append("<div style='width:100%;'>Extention Name</div>");
		$(".filetype_contents").find(".filetype_detail").append("<div style='width:100%; margin-top:4px;'><input class='file_extension_hidden' type='hidden' style='width:280px;' value='"+ extension_name +"' /></div><input class='file_extension' style='width:280px;' value='"+ extension_name +"' /></div>");
		
		// Creating Editor field.
		$(".filetype_contents").find(".filetype_detail").append("<div style='width:100%; margin-top:7px;'>Editor</div>");
		$(".filetype_contents").find(".filetype_detail").append("<div style='width:100%; margin-top:4px;'>"+
															"<select class='editor' style='width:280px;'>"+
															"<option value='Editor'>Editor</option>"+
															"<option value='Designer'>Designer</option>"+
															"<option value='Rule_Editor'>Rule_Editor</option></select></div>");
		// "selected" decision.
		$(".filetype_contents").find(".filetype_detail").find("option").each(function() {
			if ($(this).attr("value") == editor)
				$(this).attr("selected", "selected");
		});


		
		// Creating Type fieldl
		$(".filetype_contents").find(".filetype_detail").append("<div style='width:100%; margin-top:7px;'>Type</div>");
		$(".filetype_contents").find(".filetype_detail").append("<div style='width:100%; margin-top:4px;'>"+
															"<select class='type' style='width:280px;'>"+
															"<option value='Code'>Code</option>"+
															"<option value='uml'>uml</option>"+
															"<option value='ui'>ui</option>"+
															"<option value='xml'>xml</option></select></div>");
		// "selected" decision.												
		$(".filetype_contents").find(".filetype_detail").find("option").each(function() {
			if ($(this).attr("value") == type)
				$(this).attr("selected", "selected");
		});
		
		// Creating syntax highlighting mode field.
		$(".filetype_contents").find(".filetype_detail").append("<div style='width:100%; margin-top:7px;'>Syntax Highlighting Mode</div>");
		$(".filetype_contents").find(".filetype_detail").append("<div style='width:100%; margin-top:4px;'><select class='mode' style='width:280px;'>"+
															"<option value='text/javascript'>text/javascript</option>"+
															"<option value='application/json'>application/json</option>"+
															"<option value='application/xml'>application/xml</option>"+
															"<option value='text/html'>text/html</option>"+
															"<option value='text/css'>text/css</option>"+
															"<option value='text/x-python'>text/x-python</option>"+
															"<option value='application/x-httpd-php'>application/x-httpd-php</option>"+
															"<option value='text/x-php'>text/x-php</option>"+
															"<option value='text/x-diff'>text/x-diff</option>"+
															"<option value='text/x-csrc'>text/x-csrc</option>"+
															"<option value='text/x-c++src'>text/x-c++src</option>"+
															"<option value='text/x-java'>text/x-java</option>"+
															"<option value='text/x-go'>text/x-go</option>"+
															"<option value='text/x-dart'>text/x-dart</option>"+
															"<option value='text/x-groovy'>text/x-groovy</option>"+
															"<option value='text/stex'>text/stex</option>"+
															"<option value='text/x-haskell'>text/x-haskell</option>"+
															"<option value='text/x-ruby'>text/x-ruby</option>"+
															"<option value='text/x-coffeescript'>text/x-coffeescript</option>"+
															"<option value='text/x-stsrc'>text/x-stsrc</option>"+
															"<option value='text/x-plsql'>text/x-plsql</option>"+
															"<option value='text/x-sql'>text/x-sql</option>"+
															"<option value='text/x-lua'>text/x-lua</option>"+
															"<option value='text/x-scheme'>text/x-scheme</option>"+
															"<option value='text/x-clojure'>text/x-clojure</option>"+
															"<option value='text/x-rst'>text/x-rst</option>"+
															"<option value='text/x-yaml'>text/x-yaml</option>"+
															"<option value='application/x-sparql-query'>application/x-sparql-query</option>"+
															"<option value='application/x-sparql-query'>application/x-sparql-query</option>"+
															"<option value='text/velocity'>text/velocity</option>"+
															"<option value='text/x-rsrc'>text/x-rsrc</option></select></div>");
		// "selected" decision.
		$(".filetype_contents").find(".filetype_detail").find("option").each(function() {
			if ($(this).attr("value") == mode)
				$(this).attr("selected", "selected");
		});
		
		// Creating description field.
		$(".filetype_contents").find(".filetype_detail").append("<div style='width:100%; margin-top:7px;'>Description</div>");
		$(".filetype_contents").find(".filetype_detail").append("<div style='width:100%; margin-top:4px;'><textarea class='description' style='resize: none; width:280px; height:84px; overflow:auto;'>" + description + "</textarea></div>");
		if(this.readonly){
			$(".filetype_contents").find(".filetype_detail").find(".file_extension").attr("readonly","readonly");
			$(".filetype_contents").find(".filetype_detail").find(".editor").attr("disabled","disabled");
			$(".filetype_contents").find(".filetype_detail").find(".type").attr("disabled","disabled");
			$(".filetype_contents").find(".filetype_detail").find(".mode").attr("disabled","disabled");
			$(".filetype_contents").find(".filetype_detail").find(".description").attr("readonly","readonly");
		}
	}
};
