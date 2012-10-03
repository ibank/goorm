/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 * version: 3.0.0
 * This is the module example for YUI_DOCS
 * @module design
 **//**
 * This is an goorm code generator.  
 * <br>goorm starts with this code generator.
 * @class objectexplorer
 * @extends design
 **/org.goorm.core.design.canvas.objectexplorer=function(){this.parent=null,this.objectTree=null},org.goorm.core.design.canvas.objectexplorer.prototype={init:function(e){var t=this;this.parent=e,this.objectTree=new YAHOO.widget.TreeView("objectTree"),$("#objectExplorer").append("<input type=button id=refreshButton value='refresh' />")},highlight:function(e){$("#objectTree").find(".ygtvcontent").each(function(t){"objectInformation"+e==$(this).text()&&$(this).parent().parent().parent().parent().addClass("highlighted")})},unHighlight:function(){$("#objectTree").find(".ygtvcontent").each(function(e){"objectInformation"+index==$(this).text()&&$(this).parent().parent().parent().parent().removeClass("highlighted")})},refresh:function(){var e=this;delete this.objectTree,this.objectTree=new YAHOO.widget.TreeView("objectTree");var t=e.objectTree.getRoot();$(e.parent.objects).each(function(e){var n=new YAHOO.widget.HTMLNode("<div class='objectWrap'><div class='object_"+$(this)[0].type+"_icon'></div>"+"objectInformation"+e+"</div>",t,!0),r=new YAHOO.widget.TextNode(e+": "+$(this)[0].properties.name+" ("+$(this)[0].properties.id+")",n,!1),i=new YAHOO.widget.TextNode("isDrag: "+$(this)[0].properties.isDrag+" / isDrawFinished: "+$(this)[0].properties.isDrawFinished,n,!1)}),$("#refreshButton").click(function(){e.refresh()}),e.objectTree.render()}};