/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/

org.goorm.core.project.property.manager = function () {
	this.ini = null;
	this.treeview = null;
	this.tabview = null;
};

org.goorm.core.project.property.manager.prototype = {
	init: function (option) {
		
	},
	
	add_treeview: function (treeview, xml){
		if ($(xml).find("project").length > 0) {
			$(xml).find("project").each(function(){
				$(this).find("item").each(function(){
					var tmpnode2 = new YAHOO.widget.TextNode($(this).attr("label"), treeview, false);
				});
			});
		}
	},
	
	create_treeview: function (xml) {
		if ($(xml).find("project").length > 0) {
			var treeview = new YAHOO.widget.TreeView("property_treeview");
			
			$(xml).find("project").each(function(){
				$(this).find("root").each(function(){
					var tmpnode = new YAHOO.widget.TextNode($(this).attr("label"), treeview.getRoot(), $(this).attr("expanded"));
					$(this).find("item").each(function(){
						var tmpnode2 = new YAHOO.widget.TextNode($(this).attr("label"), tmpnode, false);
					});
				});
			});
			treeview.render();
			this.treeview = treeview;
		}	
	},
	
	create_tabview: function (xml) {
		
		var self = this;
		var tabview = null;
		$(xml).find("project").each(function(){
			if ($(this).find("item").length > 0){
				$(this).find("item").each(function(){
					if ($(this).find("tab").length > 0) {
						var label = $(this).attr("label");
						label = "property_"+label.replace(/[/#. ]/g,"");
						
						$("#property_tabview").append("<div id='" + label + "' style='display:none'></div>");
						tabview = new YAHOO.widget.TabView(label);
						
						$(this).find("tab").each(function(){
							
							if($(this).attr("src")){
								var url = $(this).attr("src");
								var label = $(this).attr("label");
								var classname = $(this).attr("classname");
								$.ajax({
									type: "GET",
									dataType: "html",
									async: false,
									url: url,
									success: function(data) {
										var tab = new YAHOO.widget.Tab({ 
										    label: label, 
										    content: data, 
										});
										tabview.addTab(tab);
										
										
									}
								});
							}
							
						});
	
						tabview.set('activeIndex', 0);
						//tabview.appendTo("preference_tabview");
					}
					else {
						
						var content="";
						if($(this).attr("src")){
							var label = $(this).attr("label");
							label = "property_"+label.replace(/[/#. ]/g,"");
							var url = $(this).attr("src");
							$.ajax({
								type: "GET",
								dataType: "html",
								url: url,
								success: function(data) {
									content=data;
									$("#property_tabview").append("<div class='yui-content' id='"+label+"' style='display:none'>"+content+"</div>");
								}
							});
						}
					}
				});
			}
			
			
			$(this).find("root").each(function(){
				
				if($(this).attr("src")){
						
					var url = $(this).attr("src");
					var label = $(this).attr("label");
					label = "property_"+label.replace(/[/#. ]/g,"");
					$.ajax({
						type: "GET",
						dataType: "html",
						url: url,
						success: function(data) {
							$("#property_tabview").append("<div class='yui-content' id='"+label+"' style='display:none'>"+data+"</div>");
						}
					});
				}
			});
		});
		
	},
	
	xml_parser: function (url) {
		var self=this;
		$.ajax({
			type: "GET",
			dataType: "xml",
			async :false,
			url: url,
			success: function(xml) {
				self.xml = xml;
				return this;
			}
			, error: function(xhr, status, error) {alert.show(core.module.localization.msg["alertError"] + error); }
		});
	},
	
	unserialize : function(data){
	    // Takes a string representation of variable and recreates it  
	    // 
	    // version: 810.114
	    // discuss at: http://phpjs.org/functions/unserialize
	    // +     original by: Arpad Ray (mailto:arpad@php.net)
	    // +     improved by: Pedro Tainha (http://www.pedrotainha.com)
	    // +     bugfixed by: dptr1988
	    // +      revised by: d3x
	    // +     improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	    // %            note: We feel the main purpose of this function should be to ease the transport of data between php & js
	    // %            note: Aiming for PHP-compatibility, we have to translate objects to arrays 
	    // *       example 1: unserialize('a:3:{i:0;s:5:"Kevin";i:1;s:3:"van";i:2;s:9:"Zonneveld";}');
	    // *       returns 1: ['Kevin', 'van', 'Zonneveld']
	    // *       example 2: unserialize('a:3:{s:9:"first_name";s:5:"Kevin";s:7:"midName";s:3:"van";s:7:"surName";s:9:"Zonneveld";}');
	    // *       returns 2: {first_name: 'Kevin', midName: 'van', surName: 'Zonneveld'}
	    
	    var error = function (type, msg, filename, line){throw new window[type](msg, filename, line);};
	    var read_until = function (data, offset, stopchr){
	        var buf = [];
	        var chr = data.slice(offset, offset + 1);
	        var i = 2;
	        while(chr != stopchr){
	            if((i+offset) > data.length){
	                error('Error', 'Invalid');
	            }
	            buf.push(chr);
	            chr = data.slice(offset + (i - 1),offset + i);
	            i += 1;
	        }
	        return [buf.length, buf.join('')];
	    };
	    var read_chrs = function (data, offset, length){
	        buf = [];
	        for(var i = 0;i < length;i++){
	            var chr = data.slice(offset + (i - 1),offset + i);
	            buf.push(chr);
	        }
	        return [buf.length, buf.join('')];
	    };
	    var _unserialize = function (data, offset){
	        if(!offset) offset = 0;
	        var buf = [];
	        var dtype = (data.slice(offset, offset + 1)).toLowerCase();
	        
	        var dataoffset = offset + 2;
	        var typeconvert = new Function('x', 'return x');
	        var chrs = 0;
	        var datalength = 0;
	        
	        switch(dtype){
	            case "i":
	                typeconvert = new Function('x', 'return parseInt(x)');
	                var readData = read_until(data, dataoffset, ';');
	                var chrs = readData[0];
	                var readdata = readData[1];
	                dataoffset += chrs + 1;
	            break;
	            case "b":
	                typeconvert = new Function('x', 'return (parseInt(x) == 1)');
	                var readData = read_until(data, dataoffset, ';');
	                var chrs = readData[0];
	                var readdata = readData[1];
	                dataoffset += chrs + 1;
	            break;
	            case "d":
	                typeconvert = new Function('x', 'return parseFloat(x)');
	                var readData = read_until(data, dataoffset, ';');
	                var chrs = readData[0];
	                var readdata = readData[1];
	                dataoffset += chrs + 1;
	            break;
	            case "n":
	                readdata = null;
	            break;
	            case "s":
	                var ccount = read_until(data, dataoffset, ':');
	                var chrs = ccount[0];
	                var stringlength = ccount[1];
	                dataoffset += chrs + 2;
	                
	                var readData = read_chrs(data, dataoffset+1, parseInt(stringlength));
	                var chrs = readData[0];
	                var readdata = readData[1];
	                dataoffset += chrs + 2;
	                if(chrs != parseInt(stringlength) && chrs != readdata.length){
	                    error('SyntaxError', 'String length mismatch');
	                }
	            break;
	            case "a":
	                var readdata = {};
	                
	                var keyandchrs = read_until(data, dataoffset, ':');
	                var chrs = keyandchrs[0];
	                var keys = keyandchrs[1];
	                dataoffset += chrs + 2;
	                
	                for(var i = 0;i < parseInt(keys);i++){
	                    var kprops = _unserialize(data, dataoffset);
	                    var kchrs = kprops[1];
	                    var key = kprops[2];
	                    dataoffset += kchrs;
	                    
	                    var vprops = _unserialize(data, dataoffset);
	                    var vchrs = vprops[1];
	                    var value = vprops[2];
	                    dataoffset += vchrs;
	                    
	                    readdata[key] = value;
	                }
	                
	                dataoffset += 1;
	            break;
	            default:
	                error('SyntaxError', 'Unknown / Unhandled data type(s): ' + dtype);
	            break;
	        }
	        return [dtype, dataoffset - offset, typeconvert(readdata)];
	    };
	    return _unserialize(data, 0)[2];
	},
	
	plugin: function (plugin_name) {
		this.plugin_name = null;
		this.xml = null;
		this.property = {};
	},
	
	validate: function(input,option){
		var valid=1;
		switch (option){
			case "required" : {
				if(!$(input).val().match(/[^.*]/)) {
					alert.show($(input).attr("name")+core.module.localization.msg["alertValidateRequired"]);
					valid=0;
				}
				break;
			}
			case "alpha" : {
				if(!$(input).val().match(/^[a-z ._-]+$/i)) {
					alert.show($(input).attr("name")+core.module.localization.msg["alertValidateAlpha"]);
				     valid=0;
				}
				break;
			}
			case "alphanum" : {
				if(!$(input).val().match(/^[a-z0-9 ._-]+$/i)) {
					alert.show($(input).attr("name")+core.module.localization.msg["alertValidateAlphaNum"]);
				     valid=0;
				}
				break;
			}
			case "digit" : {
				if(!$(input).val().match(/^[-+]?[0-9]+$/)) {
					alert.show($(input).attr("name")+core.module.localization.msg["alertValidateDigit"]);
				     valid=0;
				}
				break;
			}
			case "nodigit" : {
				if(!$(input).val().match( /^[^0-9]+$/)) {
					alert.show($(input).attr("name")+core.module.localization.msg["alertValidateNoDigit"]);
				     valid=0;
				}
				break;
			}
			case "number" : {
				if(!$(input).val().match(/^[-+]?\d*\.?\d+$/)) {
					alert.show($(input).attr("name")+core.module.localization.msg["alertValidateNum"]);
				     valid=0;
				}
				break;
			}
			case "email" : {
				if(!$(input).val().match(/^([a-zA-Z0-9_\.\-\+%])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/)) {
					alert.show($(input).attr("name")+core.module.localization.msg["alertValidateEmail"]);
				     valid=0;
				}
				break;
			}
			case "url" : {
				if(!$(input).val().match(/^(http|https|ftp)\:\/\/[a-z0-9\-\.]+\.[a-z]{2,3}(:[a-z0-9]*)?\/?([a-z0-9\-\._\?\,\'\/\\\+&amp;%\$#\=~])*$/i)) {
					alert.show($(input).attr("name")+core.module.localization.msg["alertValidateUrl"]);
				     valid=0;
				}
				break;
			}
		}
		return valid;
	}

};


