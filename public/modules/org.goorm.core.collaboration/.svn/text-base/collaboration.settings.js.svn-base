/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 * version: 3.0.0
 * This is the module example for YUI_DOCS
 * @module collaboration
 **//**
 * This is an goorm code generator.  
 * goorm starts with this code generator.
 * @class settings
 * @extends collaboration
 **/org.goorm.core.collaboration.settings=function(){this.dialog=null,this.buttons=null,this.tabview=null,this.treeview=null},org.goorm.core.collaboration.settings.prototype={init:function(){var e=function(){localStorage.collaboration_nickname=$("#dialog_collaboration_settings #collaboration_nickname").val(),core.preference.collaboration_server_url=$("#dialog_collaboration_settings #collaboration_server_url").val(),core.preference.collaboration_server_port=$("#dialog_collaboration_settings #collaboration_server_port").val(),core.preference.save(),this.hide()},t=function(){this.hide()};this.buttons=[{text:"OK",handler:e,isDefault:!0},{text:"Cancel",handler:t}],this.dialog=new org.goorm.core.collaboration.settings.dialog,this.dialog.init({title:"Settings",path:"configs/dialogs/org.goorm.core.collaboration/collaboration.settings.html",width:700,height:500,modal:!0,buttons:this.buttons,success:function(){self.tabview=new YAHOO.widget.TabView("settings_contents"),self.treeview=new YAHOO.widget.TreeView("settings_treeview"),self.treeview.render();if(localStorage["collaboration_nickname"]==undefined||localStorage["collaboration_nickname"]=="")localStorage.collaboration_nickname="unknownUser"}}),this.dialog=this.dialog.dialog},show:function(){$("#dialog_collaboration_settings #collaboration_server_url").val(core.preference.collaboration_server_url),$("#dialog_collaboration_settings #collaboration_server_port").val(core.preference.collaboration_server_port),core.user.last_name!=null&&core.user.first_name!=null?$("#dialog_collaboration_settings #collaboration_nickname").val(core.user.last_name+" "+core.user.first_name).attr("readonly","readonly"):$("#dialog_collaboration_settings #collaboration_nickname").val(localStorage.collaboration_nickname),this.dialog.panel.show()}};