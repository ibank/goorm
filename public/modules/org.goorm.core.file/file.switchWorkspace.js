/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 * version: 3.0.0
 * This is the module example for YUI_DOCS
 * @module file
 **//**
 * This is an goorm code generator.  
 * goorm starts with this code generator.
 * @class switchWorkspace
 * @extends file
 **/org.goorm.core.file.switchWorkspace=function(){this.dialog=null,this.buttons=null,this.tabView=null,this.treeView=null},org.goorm.core.file.switchWorkspace.prototype={init:function(){var e=function(){this.hide()},t=function(){this.hide()};this.buttons=[{text:"OK",handler:e,isDefault:!0},{text:"Cancel",handler:t}],this.dialog=new org.goorm.core.file.switchWorkspace.dialog,this.dialog.init({title:"Switch Workspace",path:"configs/dialogs/org.goorm.core.file/file.switchWorkspace.html",width:600,height:250,modal:!0,buttons:this.buttons}),this.dialog=this.dialog.dialog},show:function(){this.dialog.panel.show()}};