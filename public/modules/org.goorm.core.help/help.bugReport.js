/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 * version: 3.0.0
 * This is the module example for YUI_DOCS
 * @module help
 **/

/**
 * This is an goorm code generator.  
 * goorm starts with this code generator.
 * @class about
 * @extends help
 **/
org.goorm.core.help.bugReport = function () {
	/**
	 * This presents the current browser version
	 * @property dialog
	 **/
	this.dialog = null;
	
	/**
	 * The array object that contains the information about buttons on the bottom of a dialog 
	 * @property buttons
	 * @type Object
	 * @default null
	 **/
	this.buttons = null;
	
	/**
	 * This presents the current browser version
	 * @property tabView
	 **/
	this.tabView = null;
	
	/**
	 * This presents the current browser version
	 * @property treeView
	 **/
	this.treeView = null;
};

org.goorm.core.help.bugReport.prototype = {
	/**
	 * This function is an goorm core initializating function.  
	 * @method init 
	 **/
	
	init: function () {
		var self = this;
		
		var handleOk = function() {
			var pan = this;
			
			if($("#bugReportsTitle").val()=="") {
				alert.show(core.localization.msg["alertTitleEmpty"]);
				return false;
			}
			else if($("#bugReportsAuthor").val()=="") {
				alert.show(core.localization.msg["alertAuthorEmpty"]);
				return false;
			}
			else if($("#bugReportsEmail").val()=="") {
				alert.show(core.localization.msg["alertEmailEmpty"]);
				return false;
			}
			else if($("#bugReportsVersion").val()=="") {
				alert.show(core.localization.msg["alertVersionEmpty"]);
				return false;
			}
			else if($("#bugReportsModule").val()=="") {
				alert.show(core.localization.msg["alertModuleEmpty"]);
				return false;
			}
			else if($("#bugReportsContent").val()=="") {
				alert.show(core.localization.msg["alertContentsEmpty"]);
				return false;
			}
			
			var d = new Date();
			
			var postdata = {
				mid: "bugReport",
				document_srl: "",
				title: $("#bugReportsTitle").val(),
				allow_comment: "Y",
				allow_trackback: "N",
				nick_name: $("#bugReportsAuthor").val(),
				password: (d.getMinutes()+d.getSeconds()),
				act: "procBoardInsertDocument",
				module: "board",
				email_address: $("#bugReportsEmail").val(),
				extra_vars1: $("#bugReportsVersion").val(),
				extra_vars2: $("#bugReportsModule").val(),
				content: $("#bugReportsContent").val()
			};
			
			$.post("", postdata, function (data) {
				if($(data).find("h1").text()=="success") {
					notice.show(core.localization.msg["noticeWriteDone"]);
					pan.hide(); 
				}
				else {
					alert.show(core.localization.msg["alertCannotWrite"]);
					pan.hide(); 
				}
			});		
		};
		
		this.buttons = [ {text:"Send", handler:handleOk, isDefault:true}]; 
						 
		this.dialog = new org.goorm.core.help.about.dialog();
		this.dialog.init({
			title:"Send Bug Report", 
			path:"configs/dialogs/org.goorm.core.help/help.bugReport.html",
			width:620,
			height:550,
			modal:true,
			buttons:this.buttons,
			success: function () {
				
			}			
		});
		this.dialog = this.dialog.dialog;
	}, 
	
	/**
	 * This function is an goorm core initializating function.  
	 * @method show
	 **/
	show: function () {
		$("#bugReportsAuthor").val(core.firstName+"_"+core.lastName);
		$("#bugReportsTitle").val("");
		$("#bugReportsEmail").val("");
		$("#bugReportsVersion").val(core.version);
		$("#bugReportsModule").val("");
		$("#bugReportsContent").val("");
		this.dialog.panel.show();
	}
};
