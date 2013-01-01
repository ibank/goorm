/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.window.manager.transition = function () {
	this.panel = null;
	this.css_data = null;
};

org.goorm.core.window.manager.transition.prototype = {
	init: function () {
		var self= this;

		this.panel = new YAHOO.widget.Panel("toast1234",
			{  
				height:"105px",
			 	fixedcenter:true, 
			 	close:false, 
			 	draggable:false, 
			 	zIndex:9999,
			 	modal:true,
			 	visible:false,
			 	underlay: "none",
			 	effect:{effect:YAHOO.widget.ContainerEffect.FADE, duration:0.5}
			} 
		);

		this.panel.setBody("this is test");
		this.panel.render("goorm_dialog_container");
	},
	focus: function(index){
		var window_manager = core.module.layout.workspace.window_manager;

		$(".window_thumb #window_filename.select").removeClass("select");
		$("#window_thumb_"+index+" #window_filename").addClass("select");
/*
		$("#"+window_manager.window[previous_index].container).css("z-index",1);
		$("#"+window_manager.window[index].container).css("z-index",20000);
*/
	},
	apply_perspective: function(){
		var window_manager = core.module.layout.workspace.window_manager;
		$(".yui-layout-bd .yui-layout-bd-nohd .yui-layout-bd-noft").css("overflow","visible");
		$(".yui-layout-doc").css("overflow","visible");
		$("#workspace").css("-webkit-perspective",800);
		$("#workspace .yui-panel-container").css("-webkit-transform","rotateY(30deg) scale(0.5)");

		for( var i=0; i<window_manager.window.length; i++){
			$("#"+window_manager.window[i].container+"_c").css("top", 100);
			$("#"+window_manager.window[i].container+"_c").css("left", 100*i);
		}
	},
	unapply_perspective: function(){
		$(".yui-layout-bd .yui-layout-bd-nohd .yui-layout-bd-noft").css("overflow","hiden");
		$(".yui-layout-doc").css("overflow","hidden");
		$("#workspace").css("-webkit-perspective",'');
		$("#workspace .yui-panel-container").css("-webkit-transform","");
	},
	arrange_windows: function() {
/* 		window_manager.window[index].activate(); */
	},
	activate: function() {
/* 		unapply_perspective
 		window_manager.window[index].activate();
*/
	},
	load_windows: function() {
		var self = this
		var window_manager = core.module.layout.workspace.window_manager;
		this.panel.setBody("");
		
		var html = "";
		for( var i=0; i<window_manager.window.length; i++){
			html += "<div id=\""+"window_thumb_"+i+"\" class=\"window_thumb\"><img class=\"window_console\" src=\"images/icons/filetype/"+window_manager.window[i].filename.split(".").pop()+".thumb.png"+"\"><div id=\"window_filename\">"+window_manager.window[i].filename+"</div>"+"</div>";
		}
		
		this.panel.setBody(html);
	},
	load_css: function() {
		var self = this;
		var window_manager = core.module.layout.workspace.window_manager;
		
		self.css_data = [];

		for( var i=0; i<window_manager.window.length; i++){
			var node = {};
			node.top = $("#"+window_manager.window[i].container+"_c").css("top");
			node.left = $("#"+window_manager.window[i].container+"_c").css("left");
			self.css_data.push(node);
		}

	},
	revert_css: function() {
		var self = this;
		var window_manager = core.module.layout.workspace.window_manager;
		
		for( var i=0; i<window_manager.window.length; i++){
			$("#"+window_manager.window[i].container+"_c").css("top", self.css_data[i].top);
			$("#"+window_manager.window[i].container+"_c").css("left", self.css_data[i].left);
		}
	},
	show: function () {
		var self = this;
		this.apply_perspective();
		this.panel.show();
	},
	hide: function(){
		var self = this;
		this.revert_css();
		this.unapply_perspective();
		this.panel.hide();
	}
};