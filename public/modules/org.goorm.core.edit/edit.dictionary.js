/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.edit.dictionary = function () {
	this.target = null;
	this.editor = null;
	this.dictionary_list = null;
	this.contents = [];
	this.result = [];
	this.index = 0;
};

org.goorm.core.edit.dictionary.prototype = {
	
	init: function (target, editor, filetype){
		this.dictionary_list = [];
		var self = this;
		
		this.target = target;
		this.editor = editor;
		
		this.contents = [];
		this.result = [];

		$(this.target).append("<div class='dictionary_box'><div class='dictionary_list'></div></div>");
		$(this.target).find(".dictionary_box").hide();
		
		this.load(filetype);
		
		CodeMirror.connect($(this.target).find(".dictionary_box").get(0), "keydown", function (e) {
			var code = e.keyCode;
			
			if ($(self.target).find(".dictionary_box").css("display") == "block") {
				if (code == 27) {
					CodeMirror.e_stop(e);
					
					self.hide();
					
					self.editor.focus();
				}
				else if (code == 38) {
					self.select(-1);
				}
				else if (code == 40) {
					self.select(1);
				}
				else if (code == 13) {
					CodeMirror.e_stop(e);
					
					self.complete();
					
					self.editor.focus();
				}
				else {
					self.editor.focus();
				}
			}
		});
	},
	
	complete: function () {
		var cursor = this.editor.getCursor();
		var token = this.editor.getTokenAt(cursor);
		
		if (this.result.length > 0) {
			var string = this.result[this.index].keyword;
			
			var from = {line:cursor.line, ch:token.start};
			var to = {line:cursor.line, ch:token.end};
			if(token.string == ".") {
				from.ch += 1;
				to.ch += 1;
			}
			
			this.hide();
			this.editor.replaceRange(string, from, to);
		}
	},
	
	load: function (filetype) {
		var self = this;
		
		$(this.target).find(".dictionary_list").empty();
		
		$.getJSON("configs/dictionary/dictionary_list.json", function(list_data) {
			if (filetype && list_data[filetype] != null) {
				$.getJSON(list_data[filetype].path, function(data) {
					self.contents = eval(data);
				});
			}
			else{
				$.getJSON(list_data['etc'].path, function(data) {
					self.contents = eval(data);
				});
			}
		});
		
		// if (filetype != null) {
			// $.getJSON("configs/dictionary/" + filetype + ".json", function(data) {
				// self.contents = eval(data);
			// });
		// }
	},
	
	set: function () {
		var self = this;
		
		$(this.target).find(".dictionary_list").empty();
		
		$(this.result).each(function (i) {
			$(self.target).find(".dictionary_list").append("<div class='dictionary_element'>" + this.keyword + "</div>");
		});

		$(this.target).find(".dictionary_list .dictionary_element").hover(
			function () {
				$(self.target).find(".dictionary_list .hovered").removeClass("hovered");
				$(this).addClass("hovered");
			},
			function () {
				$(this).removeClass("hovered");
			}
		);
		
		$(this.target).find(".dictionary_list .dictionary_element").each(function (i) {
			$(this).click(function () {
				self.index = i;
				self.complete();
			});
		});
	},
	
	select: function (direction) {
		var self = this;
		var scroll_height = $(this.target).find(".dictionary_list").prop('scrollHeight') - $(this.target).find(".dictionary_list").prop('clientHeight');
		
		if (direction == -1) {
			if (this.index > 0) {
				this.index--;
				//$(this.target).find(".dictionary_box").scrollTop($(this.target).find(".dictionary_box").scrollTop() - 5);
				
				if (this.index * 20 < scroll_height - 20) {
					$(this.target).find(".dictionary_list").scrollTop($(this.target).find(".dictionary_list").scrollTop() - 20);
				}
			}
			else if (this.result.length != 0) {
				this.index = this.result.length - 1;
				//$(this.target).find(".dictionary_box").scrollTop(20 * (this.result.length - 1));
				
				$(this.target).find(".dictionary_list").scrollTop(this.index * 20);
			}
		}
		else if (direction == 1) {
			if (this.index < this.result.length - 1) {
				this.index++;
				//$(this.target).find(".dictionary_box").scrollTop($(this.target).find(".dictionary_box").scrollTop() + 5);
				
				if (this.index * 20 > $(this.target).find(".dictionary_list").height()) {
					$(this.target).find(".dictionary_list").scrollTop($(this.target).find(".dictionary_list").scrollTop() + 20);
				}
			}
			else {
				this.index = 0;
				//$(this.target).find(".dictionary_box").scrollTop(0);
				
				$(this.target).find(".dictionary_list").scrollTop(0);
			}
		}
		
		$(this.target).find(".dictionary_list .dictionary_element").removeClass("hovered");
		
		$(this.target).find(".dictionary_list .dictionary_element").each(function (i) {
			if (self.index == i) {
				$(this).addClass("hovered");
			}
		});
	},
	
	show: function (cursor_pos) {
		$(this.target).find(".dictionary_box").css('left', cursor_pos.x + 35);
		$(this.target).find(".dictionary_box").css('top', cursor_pos.y + 20);
		$(this.target).find(".dictionary_box").show();
		
		$(this.target).find(".dictionary_desc").css('left', cursor_pos.x + 45 + $(this.target).find(".dictionary_box").width());
		$(this.target).find(".dictionary_desc").css('top', cursor_pos.y + 20);
		$(this.target).find(".dictionary_desc").show();
		
		$(this.target).find(".dictionary_list .hovered").removeClass("hovered");
		$(this.target).find(".dictionary_list .dictionary_element:first").addClass("hovered");
		
		$(this.target).find(".dictionary_box").attr("tabindex", -1).focus();
		
		this.index = 0;
	},
	
	hide: function () {
		$(this.target).find(".dictionary_box").hide();
		$(this.target).find(".dictionary_desc").hide();
	},
	
	search: function (keyword) {
		var self = this;
		this.result = [];
		var reg_exp = new RegExp('^' + keyword, '');
		
		$(this.contents).each(function (i) {
			if (reg_exp.test(this.keyword)) {
				self.result.push(this);
			}
		});
		
		this.set();
	}

};