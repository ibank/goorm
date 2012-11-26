/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.design = function () {
	this.title = null;
	this.container = null;
	this.filepath = null;
	this.filename = null;
	this.filetype = null;
	this.ruler = null;
	this.canvas = null;
	this.target = null;
};

org.goorm.core.design.prototype = {
	init: function (target, title) {
		var self = this;
		
		this.container = target;
		this.title = title;
		this.target = target;
		
		this.margin_top = 200;
		
		$(target).append("<div class='canvas_container'></div>");
		
		
		$(target).find(".canvas_container").css("left", 14);
		$(target).find(".canvas_container").css("top", 14);
		
		//Ruler Initialization		
		this.ruler = new org.goorm.core.design.ruler();
		this.ruler.init($(target), "10", "px", this.title);
				
		//Canvas Initialization		
		this.canvas = new org.goorm.core.design.canvas();
		this.canvas.init($(target).find(".canvas_container"), 800, 1000, this.title, this);

		

		//Blocking Context Menus for Empty Space		
		var empty_context_menu = new org.goorm.core.menu.context();
		empty_context_menu.init("", "none", $(target).find(".canvas_container"), "");
		
		//for Test
		//this.set_collaboration_on();		
	},
	
	load: function (filepath, filename, filetype) {
		var self = this;
		
		var url = "file/get_contents";
		var path = "workspace/" + filepath + "/" + filename;
		
		this.filepath = filepath;
		this.filename = filename;
		this.filetype = filetype;
		
		var i = 0;
		this.interval = window.setInterval(function () { if(i<100) { statusbar.progressbar.set('value', i+=10); } else { window.clearInterval(self.interval); } }, 100);
		
		statusbar.start();
		
		$.ajax({
			url: url,			
			type: "GET",
			data: "path="+path,
			success: function(data) {
				//self.editor.setValue(data);
				//self.canvas.objects = [];
				//self.canvas.objects = eval(data);
				var objects;
				
				if (data) {
					filedata = eval("(" + data + ")");
					self.canvas.load(filedata.objects);
					
					
					self.canvas.collaboration.set_filepath();
/* why?
					self.canvas.setSize(parseInt(filedata.canvas_width), parseInt(filedata.canvas_height));
					self.resize_all();
					
					self.canvas.preview.real_width = filedata.canvas_width;
					self.canvas.preview.real_height = filedata.canvas_height;
					self.canvas.preview.set_size();
*/
				}

				statusbar.progressbar.set('value', 100);
				
				if(self.interval) {
					window.clearInterval(self.interval);
				}
				
				statusbar.stop();
			}
		});
	},
	
	save: function () {
		var self = this;
		
		var url = "file/put_contents";
		var path = this.filepath + "/" + this.filename;
		
		var object_data = this.get_source(this.canvas.objects);
		
		var filedata = "{"
			+ '"filename":' + '"' + this.filename + '",'
			+ '"file_type":' + '"' + this.filetype + '",'
			+ '"project_type":' + '"' + core.status.current_project_type + '",'
			+ '"canvas_width":'  + '"' + this.canvas.width + '",'
			+ '"canvas_height":' + '"' + this.canvas.height + '",'
			+ '"last_modified_timestamp":' + '"' + new Date().getTime() + '",'
			+ '"objects":' +  object_data
		+ "}";
		
		$.ajax({
			url: url,			
			//type: "GET",
			type: "POST",
			data: { path: path, data: filedata },
			success: function(data) {
				//self.canvas.objects = [];
				//self.canvas.objects = eval(data);
				//self.canvas.draw();

				m.s("Save complete! (" + self.filename + ")", "org.goorm.core.design");
			}
		});
	},
	
	get_contents: function () {
		var self = this;

		var object_data = this.get_source(this.canvas.objects);
		
		var filedata = "{"
			+ '"filename":' + '"' + this.filename + '",'
			+ '"file_type":' + '"' + this.filetype + '",'
			+ '"project_type":' + '"' + core.status.current_project_type + '",'
			+ '"canvas_width":'  + '"' + this.canvas.width + '",'
			+ '"canvas_height":' + '"' + this.canvas.height + '",'
			+ '"last_modified_timestamp":' + '"' + new Date().getTime() + '",'
			+ '"objects":' +  object_data
		+ "}";

		return filedata;
	},
	
	resize_all: function () {
	
		if(this.canvas.toolbar.is_ruler_on) {
			$(this.container).find(".canvas_container").width($(this.container).parent().width() - 14);
			$(this.container).find(".canvas_container").height($(this.container).parent().height() - 14 - 36);
		}
		else {
			$(this.container).find(".canvas_container").width($(this.container).parent().width());
			$(this.container).find(".canvas_container").height($(this.container).parent().height() - 36);
		}

		$(this.container).find(".ruler_x").width($(this.container).find(".canvas_container").width());
		$(this.container).find(".ruler_y").height($(this.container).find(".canvas_container").height()-1);
		
		
		
		
		if(this.canvas.height + 95 > $(this.container).find(".canvas_container").height()) {
			$(this.container).find(".canvas_container").find(".canvas").css("top", 50);	
			$(this.container).find(".canvas_container").find(".canvas").css("margin-top", 0);
			
			$(this.container).find(".ruler_y").css("background-position", "0px 50px");			
		}
		else {
			$(this.container).find(".canvas_container").find(".canvas").css("top", "50%");
			$(this.container).find(".canvas_container").find(".canvas").css("margin-top", 0 - (this.canvas.height/2) + 10);
			
			$(this.container).find(".ruler_y").css("background-position", "0px " +  2 + ($(this.container).height() - this.canvas.height)/2 + "px");
		}		
		
		if(this.canvas.width + 95 > $(this.container).find(".canvas_container").width()) {
			$(this.container).find(".canvas_container").find(".canvas").css("left", 50);	
			$(this.container).find(".canvas_container").find(".canvas").css("margin-left", 0);
			
			$(this.container).find(".ruler_x").css("background-position", "50px 0px");
		}
		else {
			$(this.container).find(".canvas_container").find(".canvas").css("left", "50%");		
			$(this.container).find(".canvas_container").find(".canvas").css("margin-left", 0 - (this.canvas.width/2) + 10);	
			
			$(this.container).find(".ruler_x").css("background-position", ($(this.container).width() - this.canvas.width)/2 + 2 + "px 0px");
		}

		
		if (this.canvas.skin_width != null) {
			
			if(this.canvas.skin_height + 95 > $(this.container).find(".canvas_container").height()) {
				$(this.container).find(".canvas_container").find(".skin").css("top", 50);	
				$(this.container).find(".canvas_container").find(".skin").css("margin-top", 0);
			}
			else {
				$(this.container).find(".canvas_container").find(".skin").css("top", "50%");		
				$(this.container).find(".canvas_container").find(".skin").css("margin-top", 0 - (this.canvas.skin_height/2) + 10);	
			}		
			
			if(this.canvas.skin_width + 95 > $(this.container).find(".canvas_container").width()) {
				$(this.container).find(".canvas_container").find(".skin").css("left", 50);	
				$(this.container).find(".canvas_container").find(".skin").css("margin-left", 0);
				$(this.container).find(".canvas_container").find(".canvas").css("left", ($(this.container).find(".canvas_container").find(".space").width()-this.canvas.width)/2+1);
				$(this.container).find(".canvas_container").find(".canvas").css("margin-left", 0);	
			}
			else {
				$(this.container).find(".canvas_container").find(".skin").css("left", "50%");		
				$(this.container).find(".canvas_container").find(".skin").css("margin-left", 0 - (this.canvas.skin_width/2) + 10);	
				$(this.container).find(".canvas_container").find(".canvas").css("left", "50%");
				$(this.container).find(".canvas_container").find(".canvas").css("margin-left", 0 - (this.canvas.width/2) + 7);	
			}
			
			$(this.container).find(".canvas_container").find(".canvas").css("margin-top", this.margin_top);	
		}
		
		//this.canvas.preview.set_size();
	},
	
	get_source: function (objects) {
		
		var object_string = "[";
		
		var objectsLength = objects.length;
		
		$(objects).each(function (i) {
			object_string += "{";
			
			var j = 0;
			
			object_string += '"type": "' + this.type + '", ';
			object_string += '"shape_name": "' + this.shape_name + '", ';
			object_string += '"data_uuid": "' + this.data_uuid + '", ';
			
			object_string += "\"properties\": {";

				object_string += '"kind": "' + this.properties.kind + '",';					
				object_string += '"focus": "' + this.properties.focus + '", ';
				object_string += '"is_dragging": "' + this.properties.is_dragging + '", ';
				object_string += '"is_drawing_finished": "' + this.properties.is_drawing_finished + '", ';
				object_string += '"sx": ' + this.properties.sx + ', ';
				object_string += '"sy": ' + this.properties.sy + ', ';
				object_string += '"ex": ' + this.properties.ex + ', ';
				object_string += '"ey": ' + this.properties.ey + ', ';
				object_string += '"previous_x": ' + this.properties.previous_x + ', ';
				object_string += '"previous_y": ' + this.properties.previous_y + ', ';
				object_string += '"id": "' + this.properties.id + '", ';
				object_string += '"name": "' + this.properties.name + '", ';
				object_string += '"x": ' + this.properties.x + ', ';
				object_string += '"y": ' + this.properties.y + ', ';
				object_string += '"width": ' + this.properties.width + ', ';
				object_string += '"height": ' + this.properties.height + ', ';
				
				if (this.type == "line") {
					object_string += '"thickness": "' + this.properties.thickness + '",';
					object_string += '"color": "' + this.properties.color + '",';
					object_string += '"inner_node": [';
					
					var length = this.properties.inner_node;
					$(this.properties.inner_node).each(function (i) {
						object_string += '{"x": ' + this.x + ', "y": ' + this.y + '}';
						
						if (i != length - 1) {
							object_string += ",";
						}	
					});
					object_string += '],';
				}
				
				object_string += '"connector": "' + this.properties.connector + '"';
				//object_string += 'attribute_list: [' + this.properties.attribute_list + ']';
			
			object_string += "}";
			
			if (this.type == "square") {
				//Stencil 占쏙옙占�占썬�占썲�占쏙옙占쏙옙�⑨옙
				object_string += ", \"shape\": {";
				object_string += "\"properties\": {";									
				
				var j = 0;
				var length = 0;
				
				$.each(this.shape.properties, function (key, value) {
					length++;
				});
				
				
				$.each(this.shape.properties, function (key, value) {
					try {
						object_string += '"' + key + '": "' + value + '"';
						
						if (j != length - 1) {
							 object_string += ',';
						}
						
						j++;
					}
					catch (e) {
					}	
				});
				
				
				object_string += "}";
				object_string += "}";
			}			

			object_string += "}";
			
			if (i != objectsLength - 1) {
				object_string += ", ";
			}
		});
		
		object_string += "]";
		
		/*
		object_string = object_string.split(" ,").join("");
		object_string = object_string.split(", }").join("}");
		*/
		
		return object_string;		
	}
};