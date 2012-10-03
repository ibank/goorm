/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/org.goorm.core.file.switch_workspace=function(){this.dialog=null,this.buttons=null,this.tabview=null,this.treeview=null},org.goorm.core.file.switch_workspace.prototype={init:function(){var e=function(){this.hide()},t=function(){this.hide()};this.buttons=[{text:"OK",handler:e,isDefault:!0},{text:"Cancel",handler:t}],this.dialog=new org.goorm.core.file.switch_workspace.dialog,this.dialog.init({title:"Switch workspace",path:"configs/dialogs/org.goorm.core.file/file.switch_workspace.html",width:600,height:250,modal:!0,buttons:this.buttons}),this.dialog=this.dialog.dialog},show:function(){this.dialog.panel.show()}};