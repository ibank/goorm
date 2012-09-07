/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 * version: 3.0.0
 * This is the module example for YUI_DOCS
 * @module design
 **/

/**
 * This is an goorm code generator.  
 * <br>goorm starts with this code generator.
 * @class objectexplorer
 * @extends design
 **/
org.goorm.core.design.canvas.objectexplorer = function () {
	/**
	 * This presents the current browser version
	 * @property parent
	 **/
	this.parent = null;	
	
	/**
	 * This presents the current browser version
	 * @property objectTree
	 **/
	this.objectTree = null;	
};

org.goorm.core.design.canvas.objectexplorer.prototype = {
	
	init: function (parent) {
		var self = this;
		
		this.parent = parent;
		
		this.objectTree = new YAHOO.widget.TreeView("objectTree");
		
		$("#objectExplorer").append("<input type=button id=refreshButton value='refresh' />");
	},
	
	/**
	 * This function is an goorm core initializating function.  
	 * <br>This operates the initialization tasks for layout, actions, plugins...
	 * @method highlight 
	 **/
	highlight: function (index) {
			$("#objectTree").find(".ygtvcontent").each(function (i) {
				if("objectInformation"+index == $(this).text()) {
					$(this).parent().parent().parent().parent().addClass("highlighted");
				}
			});
	},
	
	/**
	 * This function is an goorm core initializating function.  
	 * <br>This operates the initialization tasks for layout, actions, plugins...
	 * @method unhighlight 
	 **/
	unHighlight: function () {
		$("#objectTree").find(".ygtvcontent").each(function (i) {
			if("objectInformation"+index == $(this).text()) {
				$(this).parent().parent().parent().parent().removeClass("highlighted");
			}
		});
	},
	
	/**
	 * This function is an goorm core initializating function.  
	 * <br>This operates the initialization tasks for layout, actions, plugins...
	 * @method refresh 
	 **/
	refresh: function () {
		var self=this;
		
		delete this.objectTree;
		this.objectTree = new YAHOO.widget.TreeView("objectTree");
		
		var root = self.objectTree.getRoot();
				
		$(self.parent.objects).each(function (i) {
		    var titleNode = new YAHOO.widget.HTMLNode("<div class='objectWrap'><div class='object_"+$(this)[0].type+"_icon'></div>"+"objectInformation"+i+"</div>", root, true);
		    var contentNode1 = new YAHOO.widget.TextNode(i + ": " + $(this)[0].properties.name + " (" + $(this)[0].properties.id + ")", titleNode, false);
		    var contentNode2 = new YAHOO.widget.TextNode("isDrag: " + $(this)[0].properties.isDrag + " / isDrawFinished: " + $(this)[0].properties.isDrawFinished, titleNode, false);
			
/*
			if ($(this)[0].type == 'line') {
				$("#objectExplorer").find("#objectInformation" + i).append("<div style='border-bottom:1px solid #666; padding:3px;'>head: " + $(this)[0].properties.connector['head'] + " / tail: " + $(this)[0].properties.connector['tail'] + "</div>");
			}
			else if ($(this)[0].type == 'square') {
				$("#objectExplorer").find("#objectInformation" + i).append("<div style='border-bottom:1px solid #666; padding:3px;'>tl: " + $(this)[0].properties.connector['tl'] + " / t: " + $(this)[0].properties.connector['t'] + " / tr: " + $(this)[0].properties.connector['tr'] + " / r: " + $(this)[0].properties.connector['r'] + " / br: " + $(this)[0].properties.connector['br'] + " / b: " + $(this)[0].properties.connector['b'] + " / bl: " + $(this)[0].properties.connector['bl'] + " / l: " + $(this)[0].properties.connector['l'] + "</div>");
			}
*/
		});
		
/*
		$(self.parent.objects).each(function (i) {
			$("#objectExplorer").append("<div id='objectInformation" + i + "' class='objectInformation'></div>");
			$("#objectExplorer").find("#objectInformation" + i).append("<div style='border-bottom:1px dotted #ccc; padding:3px;'>" + i + ": " + $(this)[0].properties.name + " (" + $(this)[0].properties.id + ")</div>");
			$("#objectExplorer").find("#objectInformation" + i).append("<div style='border-bottom:1px dotted #ccc; padding:3px;'>isDrag: " + $(this)[0].properties.isDrag + " / isDrawFinished: " + $(this)[0].properties.isDrawFinished + "</div>");
			
			if ($(this)[0].type == 'line') {
				$("#objectExplorer").find("#objectInformation" + i).append("<div style='border-bottom:1px solid #666; padding:3px;'>head: " + $(this)[0].properties.connector['head'] + " / tail: " + $(this)[0].properties.connector['tail'] + "</div>");
			}
			else if ($(this)[0].type == 'square') {
				$("#objectExplorer").find("#objectInformation" + i).append("<div style='border-bottom:1px solid #666; padding:3px;'>tl: " + $(this)[0].properties.connector['tl'] + " / t: " + $(this)[0].properties.connector['t'] + " / tr: " + $(this)[0].properties.connector['tr'] + " / r: " + $(this)[0].properties.connector['r'] + " / br: " + $(this)[0].properties.connector['br'] + " / b: " + $(this)[0].properties.connector['b'] + " / bl: " + $(this)[0].properties.connector['bl'] + " / l: " + $(this)[0].properties.connector['l'] + "</div>");
			}
		});
*/
		$("#refreshButton").click(function () {
			self.refresh();
		});
		
		self.objectTree.render();
	},
};