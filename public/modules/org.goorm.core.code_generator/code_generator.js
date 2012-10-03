/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 * version: 3.0.0
 * This is the module example for YUI_DOCS
 * @module code-generator
 **//**
 * This is an goorm code generator.  
 * goorm starts with this code generator.
 * @class code_generator
 **/org.goorm.core.code_generator=function(){},org.goorm.core.code_generator.prototype={init:function(){var e=this},generate:function(){var e=this,t=core.status.selected_file.replace("../../project/"+core.status.current_project_path+"/",""),n=t.replace(".ui",".xml"),r={source:core.status.current_project_path+"/"+t,target:core.status.current_project_path+"/res/layout/"+n};$.post("module/org.goorm.core.code_generator/code_generator.ui2xml.php",r,function(e){core.module.layout.project_explorer.refresh()})},generateByRule:function(){var e={source:core.status.current_project_path,target:core.currentProjectFile};$.post("module/org.goorm.core.code_generator/codeZenerator.php",e,function(e){})}};