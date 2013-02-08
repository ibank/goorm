/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
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

		this.panel = new YAHOO.widget.Panel("window_transition",
			{
				height:"105px",
				fixedcenter:true, 
				close:false, 
				draggable:false, 
				zIndex:9999,
				modal:true,
				visible:false,
				underlay: "none"
			} 
		);

		this.panel.render("goorm_dialog_container");
	},
	focus: function(index){
		var window_manager = core.module.layout.workspace.window_manager;

		$(".window_thumb #window_filename.select").removeClass("select");
		$("#window_thumb_"+index+" #window_filename").addClass("select");

		$("#workspace .yui-panel-container.left").removeClass("left");
		$("#workspace .yui-panel-container.right").removeClass("right");
		$("#workspace .yui-panel-container.select").removeClass("select");

		for( var i=0; i<window_manager.window.length; i++){
			if( i < index ){
				$("#"+window_manager.window[i].container+"_c").addClass("left");
			}
			else if( i > index ){
				$("#"+window_manager.window[i].container+"_c").addClass("right");
			}
			else {
				$("#"+window_manager.window[i].container+"_c").addClass("select");
			}
		}
	},
	apply_perspective: function(){
		var window_manager = core.module.layout.workspace.window_manager;
		$(".yui-layout-bd .yui-layout-bd-nohd .yui-layout-bd-noft").css("overflow","visible");
		$(".yui-layout-doc").css("overflow","visible");
		$("#workspace").css("-webkit-perspective",800);
		
		$("#workspace .yui-panel-container").addClass("no_select");

		for( var i=0; i<window_manager.window.length; i++){
			if( i < window_manager.active_window ){
				$("#"+window_manager.window[i].container+"_c").addClass("left");
			}
			else if( i > window_manager.active_window ){
				$("#"+window_manager.window[i].container+"_c").addClass("right");
			}
			else {
				$("#"+window_manager.window[i].container+"_c").addClass("select");
			}

			$("#"+window_manager.window[i].container+"_c").css("top", 200-parseInt($("#"+window_manager.window[i].container+"_c").css("height"))/2);
			$("#"+window_manager.window[i].container+"_c").css("left", 100*i);
		}
	},
	unapply_perspective: function(){
		$(".yui-layout-bd .yui-layout-bd-nohd .yui-layout-bd-noft").css("overflow","hiden");
		$(".yui-layout-doc").css("overflow","hidden");
		$("#workspace").css("-webkit-perspective",'');
		$("#workspace .yui-panel-container").css("-webkit-transform","");
	},
	load_windows: function() {
		var self = this;
		var window_manager = core.module.layout.workspace.window_manager;
		
		var html = "";
		for( var i=0; i<window_manager.window.length; i++){
			html += "<div id=\""+"window_thumb_"+i+"\" class=\"window_thumb\"><img class=\"window_console\" src=\"images/icons/filetype/"+window_manager.window[i].filetype+".thumb.png"+"\"><div id=\"window_filename\">"+window_manager.window[i].filename+"</div>"+"</div>";
		}
		this.panel.setBody(html);
		var toast_width = 0;
		$(".window_thumb").each(function() {
			toast_width += parseInt($(this).css("width"));
		});
		toast_width += 20+10*$(".window_thumb").length;
		
		$("#window_transition").css("width",toast_width);
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
			$("#"+window_manager.window[i].container+"_c").removeClass("left");
			$("#"+window_manager.window[i].container+"_c").removeClass("right");
			$("#"+window_manager.window[i].container+"_c").removeClass("select");
			
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