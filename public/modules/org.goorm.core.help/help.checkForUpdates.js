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
 * @class checkForUpdates
 * @extends help
 **/org.goorm.core.help.checkForUpdates=function(){this.dialog=null,this.buttons=null,this.currentVersion=null,this.officialVersion=null,this.officialUrl=null},org.goorm.core.help.checkForUpdates.prototype={init:function(){var e=this,t=function(){this.hide()};this.buttons=[{text:"OK",handler:t}],this.dialog=new org.goorm.core.help.checkForUpdates.dialog,this.dialog.init({title:"Checking updates",path:"configs/dialogs/org.goorm.core.help/help.checkForUpdates.html",width:500,height:300,modal:!0,yesText:"OK",noText:"Close",buttons:this.buttons,success:function(){}}),this.dialog=this.dialog.dialog},show:function(){this.dialog.panel.show(),this.checkUpdate()},checkUpdate:function(){var e=this,t="file/get_contents",n="http://skima.skku.edu/~moyara/goorm.xml",r=0;$("#divCheckForUpdate").html(""),core.loadingBar.startLoading("Loading updates..."),$(this).bind("cursorLoadingComplete",function(){core.loadingBar.stopLoading()}),$.ajax({url:t,type:"GET",data:"path="+n,success:function(t){var n=$.parseXML(t);e.officialVersion=$(n).find("version").text(),e.officialUrl=$(n).find("url").text(),$.ajax({type:"POST",dataType:"xml",url:"configs/goorm.xml",success:function(t){e.currentVersion=$(t).find("version").text(),$("#divCheckForUpdate").append("&lt;goorm&gt; Current Version : "+e.currentVersion+" / "+"Official Version : <span style='color:red;'>"+e.officialVersion+"</span><br>"),e.currentVersion!=e.officialVersion&&$("#divCheckForUpdate").append("Update : <a href="+e.officialUrl+">"+e.officialUrl+"<br>");var n=0;for(var r in core.dialogPreference.plugin)n++;for(var i in core.dialogPreference.plugin)var s=core.dialogPreference.plugin[i]},error:function(e,t,n){alert.show(core.localization.msg.alertError+n)}})},error:function(e,t,n){alert.show(core.localization.msg.alertError+n)}})}};