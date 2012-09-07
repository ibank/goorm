/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/

org.goorm.core.preference.filetype = function () {
	this.add_button = null;
	this.del_button = null;
	this.save_button = null;
	this.self = null;
};

org.goorm.core.preference.filetype.prototype = {
	init: function () {
		self = this;
		
		// Initializing
		self.init_filetype_tab();
		
		// Buttons on dialog
		this.add_button =  new YAHOO.widget.Button("filetype_add", { onclick: { fn: this.add } });
		this.del_button =  new YAHOO.widget.Button("filetype_delete", { onclick: { fn: this.del } });
		this.save_button =  new YAHOO.widget.Button("filetypesave", { onclick: { fn: this.save } });
		
	},
	
	add: function () {
		
		// Temporary type element is added to file type list.
		$(".filetype_contents").find(".filetype_list").append("<div style='padding:3px;' class='newExt'>New Extention</div>");
		$(".filetype_contents").find(".filetype_list").scrollTop(9999999);
		
		// Event handler for creating filetype detail view is registered
		$(".filetype_contents").find(".filetype_list").find(".newExt").click(function () {
			
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
	},

	del: function () {
		
		// This part find file type is viewing in filetype detail view from filetype list and remove it.
		$(".filetype_contents").find(".filetype_list").children().each(function() {
			if ($(this).attr("class") == $(".filetype_contents").find(".file_extension").val()){
				var temp = [];
				for (var i = 0; i < core.filetypes.length; i++) {
					if (core.filetypes[i].file_extension != $(this).attr("class")) {
						
						// Keep filetype element except one user want to delete.
						temp.push(core.filetypes[i]);
					}
				}
				
				// Update filetype information.
				core.filetypes = temp;
				
				// Remove this filetype from filetype list.
				$(this).remove();
			}
		});
		
		// Remove this filetype detail from filetype detail view.
		$(".filetype_contents").find(".filetype_detail").children().each(function() {
			$(this).remove();
		});
	},

	save: function () {
		
		var finded = false;
		
		
		if ($(".filetype_contents").find(".filetype_detail").find(".file_extension").length != 0){
			
			// If the file type of current information is already exist, update the information
			for (var i = 0; i < core.filetypes.length; i++) {
				if (core.filetypes[i].file_extension == $(".filetype_contents").find(".filetype_detail").find(".file_extension").val()) {
					finded = true;
					core.filetypes[i].editor = $(".filetype_contents").find(".filetype_detail").find(".editor").attr("value");
					core.filetypes[i].type = $(".filetype_contents").find(".filetype_detail").find(".type").attr("value");
					core.filetypes[i].mode = $(".filetype_contents").find(".filetype_detail").find(".mode").attr("value");
					core.filetypes[i].description = $(".filetype_contents").find(".filetype_detail").find(".description").val();
				}
			}
			// If the file type is new, add the information of the new file type
			if (finded == false && $(".filetype_contents").find(".filetype_detail").find(".file_extension").val() != "") {
				var temp = {
					"file_extension":$(".filetype_contents").find(".filetype_detail").find(".file_extension").val(),
					"editor":$(".filetype_contents").find(".filetype_detail").find(".editor").attr("value"),
					"description":$(".filetype_contents").find(".filetype_detail").find(".description").val(),
					"type":$(".filetype_contents").find(".filetype_detail").find(".type").attr("value"),
					"mode":$(".filetype_contents").find(".filetype_detail").find(".mode").attr("value")
				}
				core.filetypes.push(temp);
				
				// Temporary name in file type list have to be updated to right file type name
				var ext = $(".filetype_contents").find(".filetype_detail").find(".file_extension").val();
				$(".filetype_contents").find(".filetype_list").find(".newExt").html(ext);
				$(".filetype_contents").find(".filetype_list").find(".newExt").attr("class", ext);
				
				$(".filetype_contents").find("."+ext).click(function () {
					
					self.save();
					// highlight refresh
					$(".filetype_contents").find(".filetype_list").children().each(function () {
						$(this).css('background-color', '#fff');
					});
					$(this).css('background-color', '#b3d4ff');
					
					// clearing type information area 
					$(".filetype_contents").find(".filetype_detail").children().each(function() { 
						$(this).remove(); 
					});	
					var en = $(this).attr("class");
					var e = self.get_filetype_info(en, "editor");
					var d = self.get_filetype_info(en, "description");
					var t = self.get_filetype_info(en, "type");
					var m = self.get_filetype_info(en, "mode");
					self.create_filetype_detail(en, e, d, t, m);
								
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
		
		// Get filetype information from the file, filetype.json.
		$.getJSON("configs/filetype/filetype.json", function(data) {
			
			// Loading the information to core.filetypes.
			core.filetypes = eval(data);
			
			var filetypes = core.filetypes;
		
			// For all filetypes, 
			for (var i = 0; i<core.filetypes.length; i++) {
				
				var extName = filetypes[i].file_extension;
				var editor = filetypes[i].editor;
				var description = filetypes[i].description;
				var type = filetypes[i].type;
				var mode = filetypes[i].mode;
				
				// Add filetype label to filetype list,
				$(".filetype_contents").find(".filetype_list").append("<div style='padding:3px;' class="+extName+">"+extName+"</div>");
				
				// And register event handler.
				$(".filetype_contents").find("."+extName).click(function () {
					
					self.save();
					// highlight refresh
					$(".filetype_contents").find(".filetype_list").children().each(function () {
						$(this).css('background-color', '#fff');
					});
					$(this).css('background-color', '#b3d4ff');
					
					// clearing type information area 
					$(".filetype_contents").find(".filetype_detail").children().each(function() { 
						$(this).remove(); 
					});	
					var en = $(this).attr("class");
					var e = self.get_filetype_info(en, "editor");
					var d = self.get_filetype_info(en, "description");
					var t = self.get_filetype_info(en, "type");
					var m = self.get_filetype_info(en, "mode");
					self.create_filetype_detail(en, e, d, t, m);
								
				});
			}
		});
	},
	
	create_filetype_detail: function (extName, editor, description, type, mode) {
		
		// Creating name field.
		$(".filetype_contents").find(".filetype_detail").append("<div style='width:100%;'>Extention Name</div>");
		$(".filetype_contents").find(".filetype_detail").append("<div style='width:100%; margin-top:4px;'><input class='file_extension' style='width:280px;' value='"+ extName +"' /></div>");
		
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
															"<option value='text/x-groovy'>text/x-groovy</option>"+
															"<option value='text/stex'>text/stex</option>"+
															"<option value='text/x-haskell'>text/x-haskell</option>"+
															"<option value='text/x-ruby'>text/x-ruby</option>"+
															"<option value='text/x-coffeescript'>text/x-coffeescript</option>"+
															"<option value='text/x-stsrc'>text/x-stsrc</option>"+
															"<option value='text/x-plsql'>text/x-plsql</option>"+
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
		$(".filetype_contents").find(".filetype_detail").append("<div style='width:100%; margin-top:4px;'><textarea class='description' style='resize: none; width:280px; height:90px; overflow:auto;'>" + description + "</textarea></div>");
	}
};