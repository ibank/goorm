/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/org.goorm.core.object.manager=function(){this.table_properties=null},org.goorm.core.object.manager.prototype={init:function(e,t){this.table_properties=e,this.canvas=t,e==""&&(this.table_properties=core.module.layout.table_properties),this.table_properties.connect_manager(this)},set:function(e){this.table_properties.set(e)},unset:function(e){this.table_properties.unset()}};