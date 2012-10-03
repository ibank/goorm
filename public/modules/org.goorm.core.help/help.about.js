/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/org.goorm.core.help.about=function(){this.dialog=null,this.buttons=null,this.tabview=null,this.treeview=null},org.goorm.core.help.about.prototype={init:function(){var e=this,t=function(){this.hide()};this.buttons=[{text:"OK",handler:t,isDefault:!0}],this.dialog=new org.goorm.core.help.about.dialog,this.dialog.init({title:"About goorm",path:"configs/dialogs/org.goorm.core.help/help.about.html",width:650,height:600,modal:!0,buttons:this.buttons,success:function(){}}),this.dialog=this.dialog.dialog},show:function(){this.dialog.panel.show()}};