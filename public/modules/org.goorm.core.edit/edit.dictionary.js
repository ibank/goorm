/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
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
		

		var dict_box_html='';
		dict_box_html+="<div class='dictionary_box' >";
		dict_box_html+=		"<div class='top_dictionary_list'  ><table><tr><td style='padding-left : 1px;width: 40px; border-right :black solid 1px;'>Type</td><td style='padding-left:4px'>Name</td></tr></table></div>";
		dict_box_html+=		"<div class='dictionary_list'></div>";
		dict_box_html+=		"<div class='dictionary_desc'></div>";
		dict_box_html+="</div>";
		//$(this.target).append("<div class='dictionary_box'><div class='has_dictionary_list'> type | name <div class='dictionary_list'></div></div> <div class='has_dictionary_desc'>description<div class='dictionary_desc' style='display : none;'></div></div> </div>");
		$(this.target).append(dict_box_html);
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
				else if (code == 37 || code == 39) {
					self.hide();
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

		if(this.result[0].is_not_data) this.result.pop();
		if (this.result.length > 0) {
			var string = this.result[this.index].keyword;
			
			var from = {line:cursor.line, ch:token.start};
			var to = {line:cursor.line, ch:token.end};
			if(token.string == ".") {
				from.ch += 1;
				to.ch += 1;
			}
			//console.log('token.string',token.string,'string',string,'from',from,'to',to);
			this.editor.replaceRange(string, from, to);
		}
		
		this.hide();
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
	
	},
	
	set: function () {
		var self = this;
		
		//$(this.target).find(".dictionary_list").empty();
		$(".dictionary_list").empty();

		 if(this.result.length == 0){
		 	var not_data = {
				'is_not_data' : true,
		 		'keyword' : core.module.localization.msg['alert_no_have_data']
			}
		 	this.result.push(not_data);
		 }


		//$(self.target).find('.dictionary_desc').empty();
		$('.dictionary_desc').empty();
		$(self.target).find('.dictionary_desc').css("display","none");
		$(this.result).each(function (i) {
			var ele_id="dict_"+i;
			

			//empty data
			if(this.is_not_data){
				this.type='';
			}
			//too long keyword
			
			var print_key='';
			print_key+=this.keyword;
			
			if(print_key.length>18){
				print_key=print_key.substring(0,14);
				print_key+="...";
			}
		
			var ele_html="";
			ele_html+="<div class='dictionary_element' id='"+ele_id+"'>";
			ele_html+=	"<table><tr>";
			ele_html+=		"<td width='40px' style='font-size:9px' >"+this.type+"</td><td width='90px'>"+print_key+"</td>"
			ele_html+=	"</tr></table>"
			ele_html+="</div>";
			$(self.target).find(".dictionary_list").append(ele_html);


			var desc_id=ele_id+"_desc";
			var desc_html="";
			desc_html+="<div class='dictionary_desc_list' id='"+desc_id+"'>";
			desc_html+=		"<div style='background:#ccc;font-size:11px;' >Description</div>";
			desc_html+=		this.description;
			desc_html+="</div>";
			$(self.target).find(".dictionary_desc").append(desc_html);

			$('.dictionary_desc_list').css("display","none");

		});
		$(this.target).find(".dictionary_list .dictionary_element").hover(
			function () {
				//hover
				$(self.target).find(".dictionary_list .hovered").removeClass("hovered");
				$(this).addClass("hovered");

				var g_ele_target=$(this).attr('id');
				display_desc=function(ele_target){
					if($('#'+ele_target).hasClass('hovered')){
						///still hovered
						$(self.target).find('.dictionary_desc').css("display","");
						var desc_target=ele_target+"_desc";
						$(self.target).find('#'+desc_target).css("display","");
					
					}
				
				}

				setTimeout(function(){
					display_desc(g_ele_target);
				},500);
			},
			function () {
				//unhover

				var desc_target=$(this).attr('id')+"_desc";
				$(self.target).find('#'+desc_target).css("display","none");
				$(self.target).find('.dictionary_desc').css("display","none");

				$(this).removeClass("hovered");
			}
		);
		
	 	if(this.result[0].is_not_data==true){
	 			$(this.target).find(".dictionary_list .dictionary_element").unbind();
	 	}
	 
		
		$(this.target).find(".dictionary_list .dictionary_element").each(function (i) {
			if($(this).attr('filter')!='not_data'){
				$(this).click(function () {
					self.index = i;
					self.complete();
				});
			}
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
	
	show: function (cm) {
		var cursor = cm.getCursor();
		var cursor_pos = cm.charCoords({line:cursor.line, ch:cursor.ch}, "local");
		var scroll = cm.getScrollInfo();
		var gutter = cm.getGutterElement();
		var gutter_width = $(gutter).outerWidth() + 15;
		
		var left = cursor_pos.x + gutter_width;
		var top = cursor_pos.y - scroll.y + 20;
		
		var wrapper = $(cm.getWrapperElement());
		var wrapper_height = wrapper.outerHeight();
		var dictionary_box = $(this.target).find(".dictionary_box");
		var workspace = $("#workspace");
		
		if(top < 0) top = 5;
		
		if(top > wrapper_height) {
			top = wrapper_height - dictionary_box.height();
		}
		
		// 딕셔너리박스가 아래라인을 넘어가면 밀림현상 발생.
		if(workspace.offset().top + workspace.height() -1 < wrapper.offset().top + top + dictionary_box.height()) {
			if(top < wrapper_height) {
				top = top - dictionary_box.height() - 18;
			}
			else {
				top = wrapper_height - dictionary_box.height();
			}
		}
		
		dictionary_box.css('left', left);
		dictionary_box.css('top', top);
		dictionary_box.show();
		
		var dictionary_desc = $(this.target).find(".dictionary_desc");
		var tmpleft=20+dictionary_box.width();
		//console.log(tmpleft);
		tmpleft+="";
		dictionary_desc.css('left', tmpleft+"px");
		//dictionary_desc.css('display','none');
		//dictionary_desc.show();
		
		$(this.target).find(".dictionary_list .hovered").removeClass("hovered");
		$(this.target).find(".dictionary_list .dictionary_element:first").addClass("hovered");
		
		dictionary_box.attr("tabindex", -1).focus();
		
		this.index = 0;
	},
	
	hide: function () {
		$(this.target).find(".dictionary_box").hide();
		$(this.target).find(".dictionary_desc").hide();
	},
	
	search: function (keyword) {
		
		var self = this;
		self.result = [];
		var reg_exp = new RegExp('^' + keyword, '');

		self.get_dictionary(keyword,function(){
			$(self.contents).each(function (i) {
				if (reg_exp.test(this.keyword)) {
					self.result.push(this);
				}
			});
			
		self.set();
		});
		
	},
	get_dictionary : function(keyword,callback){
		var self=this;
		var reg_exp = new RegExp('^' + keyword, '');
		$.get('/edit/get_dictionary'
			,{
				selected_file_path :  core.module.layout.workspace.window_manager.active_filename
			}
			,function(data){
				//console.log(data);
				if(data.v!=undefined){
					for(var i=0;i<data.v.length;i++){
						if(reg_exp.test(data.v[i])){
							self.result.push({
								'description' : data.v[i]+"<br>global variable<br>",
								'keyword' : data.v[i],
								'type': 'global'
							});
						}
					}
				}//global var end
				if(data.l!=undefined){
					for(var i=0;i<data.l.length;i++){
						if(reg_exp.test(data.l[i])){
							self.result.push({
								'description' : data.l[i]+"<br>local variable<br>",
								'keyword' : data.l[i],
								'type': 'local'
							});
						}
					}
				}//local var end				
				if(data.f!=undefined){
					for(var i=0;i<data.f.length;i++){
						if(reg_exp.test(data.f[i])){
							self.result.push({
								'description' : data.f[i]+"<br>function<br>",
								'keyword' : data.f[i],
								'type': 'func'
							});
						}
					}
				}//function end
				if(data.m!=undefined){
					for(var i=0;i<data.m.length;i++){
						if(reg_exp.test(data.m[i])){
							self.result.push({
								'description' : data.m[i]+"<br>method<br>",
								'keyword' : data.m[i],
								'type': 'method'
							});
						}
					}
				}//method end
				if(data.c!=undefined){
					for(var i=0;i<data.c.length;i++){
						if(reg_exp.test(data.c[i])){
							self.result.push({
								'description' : data.c[i]+"<br>className<br>",
								'keyword' : data.c[i],
								'type': 'class'
							});
						}
					}
				}//class
				 if( typeof callback === "function" ) {
					callback();
				}
			}
		);
	}

};