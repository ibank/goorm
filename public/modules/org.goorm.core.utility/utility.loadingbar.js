/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 * version: 3.0.0
 * This is the module example for YUI_DOCS
 * @module utility
 **//**
 * This is an goorm code generator.  
 * goorm starts with this code generator.
 * @class statusbar
 * @extends utility
 **/org.goorm.core.utility.loadingbar=function(){this.loadingBar=null,this.counter=0},org.goorm.core.utility.loadingbar.prototype={init:function(){var e=this;this.loadingBar=new YAHOO.widget.Panel("wait",{width:"240px",fixedcenter:!0,close:!1,draggable:!1,zIndex:9999,modal:!0,visible:!1}),this.loadingBar.setHeader(""),this.loadingBar.setBody('<img src="images/org.goorm.core.utility/loading_bar.gif" />'),this.loadingBar.render("goormDialogContainer")},startLoading:function(e){this.loadingBar.setHeader(e),this.loadingBar.show(),this.counter++},stopLoading:function(){this.counter--,this.counter==0&&this.loadingBar.hide()}};