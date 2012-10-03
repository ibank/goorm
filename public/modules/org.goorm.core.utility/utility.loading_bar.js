/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/org.goorm.core.utility.loading_bar=function(){this.loading_bar=null,this.counter=0},org.goorm.core.utility.loading_bar.prototype={init:function(){var e=this;this.loading_bar=new YAHOO.widget.Panel("wait",{width:"240px",fixedcenter:!0,close:!1,draggable:!1,zIndex:9999,modal:!0,visible:!1}),this.loading_bar.setHeader(""),this.loading_bar.setBody('<img src="images/org.goorm.core.utility/loading_bar.gif" />'),this.loading_bar.render("goorm_dialog_container")},start:function(e){this.loading_bar.setHeader(e),this.loading_bar.show(),this.counter++},stop:function(){this.counter--,this.counter==0&&this.loading_bar.hide()}};