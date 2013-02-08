/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.design.canvas.object_explorer = function () {
	this.parent = null;	
	this.object_tree = null;	
};

org.goorm.core.design.canvas.object_explorer.prototype = {
	
	init: function (parent) {
		var self = this;
		
		this.parent = parent;
		
		this.object_tree = new YAHOO.widget.TreeView("object_tree");
		
		$("#object_explorer").append("<input type=button id=refreshButton value='refresh' />");
	},
	
	highlight: function (index) {
			$("#object_tree").find(".ygtvcontent").each(function (i) {
				if("objectInformation"+index == $(this).text()) {
					$(this).parent().parent().parent().parent().addClass("highlighted");
				}
			});
	},
	
	unhighlight: function () {
		$("#object_tree").find(".ygtvcontent").each(function (i) {
			if("objectInformation"+index == $(this).text()) {
				$(this).parent().parent().parent().parent().removeClass("highlighted");
			}
		});
	},
	
	refresh: function () {
		var self=this;
		
		delete this.object_tree;
		this.object_tree = new YAHOO.widget.TreeView("object_tree");
		
		var root = self.object_tree.getRoot();
				
		$(self.parent.objects).each(function (i) {
		    var title_node = new YAHOO.widget.HTMLNode("<div class='object_wrap'><div class='object_"+$(this)[0].type+"_icon'></div>"+"objectInformation"+i+"</div>", root, true);
		    var content_node1 = new YAHOO.widget.TextNode(i + ": " + $(this)[0].properties.name + " (" + $(this)[0].properties.id + ")", title_node, false);
		    var content_node2 = new YAHOO.widget.TextNode("is_dragging: " + $(this)[0].properties.is_dragging + " / is_drawing_finished: " + $(this)[0].properties.is_drawing_finished, title_node, false);
			
/*
			if ($(this)[0].type == 'line') {
				$("#object_explorer").find("#objectInformation" + i).append("<div style='border-bottom:1px solid #666; padding:3px;'>head: " + $(this)[0].properties.connector['head'] + " / tail: " + $(this)[0].properties.connector['tail'] + "</div>");
			}
			else if ($(this)[0].type == 'square') {
				$("#object_explorer").find("#objectInformation" + i).append("<div style='border-bottom:1px solid #666; padding:3px;'>tl: " + $(this)[0].properties.connector['tl'] + " / t: " + $(this)[0].properties.connector['t'] + " / tr: " + $(this)[0].properties.connector['tr'] + " / r: " + $(this)[0].properties.connector['r'] + " / br: " + $(this)[0].properties.connector['br'] + " / b: " + $(this)[0].properties.connector['b'] + " / bl: " + $(this)[0].properties.connector['bl'] + " / l: " + $(this)[0].properties.connector['l'] + "</div>");
			}
*/
		});
		
/*
		$(self.parent.objects).each(function (i) {
			$("#object_explorer").append("<div id='objectInformation" + i + "' class='objectInformation'></div>");
			$("#object_explorer").find("#objectInformation" + i).append("<div style='border-bottom:1px dotted #ccc; padding:3px;'>" + i + ": " + $(this)[0].properties.name + " (" + $(this)[0].properties.id + ")</div>");
			$("#object_explorer").find("#objectInformation" + i).append("<div style='border-bottom:1px dotted #ccc; padding:3px;'>is_dragging: " + $(this)[0].properties.is_dragging + " / is_drawing_finished: " + $(this)[0].properties.is_drawing_finished + "</div>");
			
			if ($(this)[0].type == 'line') {
				$("#object_explorer").find("#objectInformation" + i).append("<div style='border-bottom:1px solid #666; padding:3px;'>head: " + $(this)[0].properties.connector['head'] + " / tail: " + $(this)[0].properties.connector['tail'] + "</div>");
			}
			else if ($(this)[0].type == 'square') {
				$("#object_explorer").find("#objectInformation" + i).append("<div style='border-bottom:1px solid #666; padding:3px;'>tl: " + $(this)[0].properties.connector['tl'] + " / t: " + $(this)[0].properties.connector['t'] + " / tr: " + $(this)[0].properties.connector['tr'] + " / r: " + $(this)[0].properties.connector['r'] + " / br: " + $(this)[0].properties.connector['br'] + " / b: " + $(this)[0].properties.connector['b'] + " / bl: " + $(this)[0].properties.connector['bl'] + " / l: " + $(this)[0].properties.connector['l'] + "</div>");
			}
		});
*/
		$("#refreshButton").click(function () {
			self.refresh();
		});
		
		self.object_tree.render();
	},
};