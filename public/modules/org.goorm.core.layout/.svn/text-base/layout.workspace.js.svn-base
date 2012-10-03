/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/org.goorm.core.layout.workspace=function(){this.window_manager=null},org.goorm.core.layout.workspace.prototype={init:function(e){var t=this;$("#"+e).append("<div id='workspace'></div>"),this.attach_window_manager("workspace"),$("#workspace").mousedown(function(e){$("#workspace").find(".hd").each(function(e){$(this).removeClass("activated")})})},attach_window_manager:function(e){this.window_manager=new org.goorm.core.window.manager,this.window_manager.init(e)}};