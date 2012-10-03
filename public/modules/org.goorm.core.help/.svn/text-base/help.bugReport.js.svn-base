/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 * version: 3.0.0
 * This is the module example for YUI_DOCS
 * @module help
 **//**
 * This is an goorm code generator.  
 * goorm starts with this code generator.
 * @class about
 * @extends help
 **/org.goorm.core.help.bugReport=function(){this.dialog=null,this.buttons=null,this.tabView=null,this.treeView=null},org.goorm.core.help.bugReport.prototype={init:function(){var e=this,t=function(){var e=this;if($("#bugReportsTitle").val()=="")return alert.show(core.localization.msg.alertTitleEmpty),!1;if($("#bugReportsAuthor").val()=="")return alert.show(core.localization.msg.alertAuthorEmpty),!1;if($("#bugReportsEmail").val()=="")return alert.show(core.localization.msg.alertEmailEmpty),!1;if($("#bugReportsVersion").val()=="")return alert.show(core.localization.msg.alertVersionEmpty),!1;if($("#bugReportsModule").val()=="")return alert.show(core.localization.msg.alertModuleEmpty),!1;if($("#bugReportsContent").val()=="")return alert.show(core.localization.msg.alertContentsEmpty),!1;var t=new Date,n={mid:"bugReport",document_srl:"",title:$("#bugReportsTitle").val(),allow_comment:"Y",allow_trackback:"N",nick_name:$("#bugReportsAuthor").val(),password:t.getMinutes()+t.getSeconds(),act:"procBoardInsertDocument",module:"board",email_address:$("#bugReportsEmail").val(),extra_vars1:$("#bugReportsVersion").val(),extra_vars2:$("#bugReportsModule").val(),content:$("#bugReportsContent").val()};$.post("",n,function(t){$(t).find("h1").text()=="success"?(notice.show(core.localization.msg.noticeWriteDone),e.hide()):(alert.show(core.localization.msg.alertCannotWrite),e.hide())})};this.buttons=[{text:"Send",handler:t,isDefault:!0}],this.dialog=new org.goorm.core.help.about.dialog,this.dialog.init({title:"Send Bug Report",path:"configs/dialogs/org.goorm.core.help/help.bugReport.html",width:620,height:550,modal:!0,buttons:this.buttons,success:function(){}}),this.dialog=this.dialog.dialog},show:function(){$("#bugReportsAuthor").val(core.firstName+"_"+core.lastName),$("#bugReportsTitle").val(""),$("#bugReportsEmail").val(""),$("#bugReportsVersion").val(core.version),$("#bugReportsModule").val(""),$("#bugReportsContent").val(""),this.dialog.panel.show()}};