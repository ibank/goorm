/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 * version: 3.0.0
 * This is the module example for YUI_DOCS
 * @module file
 **/

/**
 * This is an goorm code generator.  
 * goorm starts with this code generator.
 * @class saveAs
 * @extends file
 **/
org.goorm.core.file.saveAs = function () {
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
		
	/**
	 * This presents the current browser version
	 * @property filepath
	 **/
	this.currentPath = null;
	
	this.isSaveAnyway = null;
};

org.goorm.core.file.saveAs.prototype = {
	
	/**
	 * This function is an goorm core initializating function.  
	 * @constructor 
	 **/
	init: function () { 
		var self = this;
		
		var handleSave = function() {
		
			if($("#fileSaveAsInputFileName").attr("value") == "") {
				alert.show(core.localization.msg["alertFileNameEmpty"]);
				return false;
			}
			
			var path = "../../project/" + $("#fileSaveAsinputLocationPath").attr("value") + "/" + $("#fileSaveAsInputFileName").attr("value");
	
			$.ajax({
				url: "file/get_contents",			
				type: "GET",
				data: { path: path },
				success: function(data) {
					if (data!=0 && !self.isSaveAnyway) {
						confirmation.init({
							title: core.localization.msg["confirmationSaveAsTitle"], 
							message: core.localization.msg["confirmationSaveAsMessage"],
							yesText: core.localization.msg["confirmationYes"],
							noText: core.localization.msg["confirmationNo"],
							yes: function () {
								self.isSaveAnyway = true;
								handleSave();
							}, no: function () {
							}
						});
						
						confirmation.panel.show();
						return false;
					}

					var targetWindow = core.mainLayout.workSpace.windowManager.window[core.mainLayout.workSpace.windowManager.activeWindow];
		
					var tempType = $("#fileSaveAsInputFileName").attr("value");
					tempType = tempType.split(".");
					tempType = tempType[1];
					
					if (targetWindow.type == "Designer") {
					
						var url = "put_file_contents";
		
						var data = targetWindow.designer.getSource(targetWindow.designer.canvas.objects);
		
						$.ajax({
							url: url,			
							type: "GET",
							data: { path: path, data: data },
							success: function(data) {
								m.s("save as complete!", "designer");
								core.mainLayout.workSpace.windowManager.window[core.mainLayout.workSpace.windowManager.activeWindow].close();
								core.mainLayout.workSpace.windowManager.open("../../project/" + $("#fileSaveAsinputLocationPath").attr("value") + "/", $("#fileSaveAsInputFileName").attr("value"), tempType);
								core.mainLayout.projectExplorer.refresh();
							}
						});
					}
					else if (targetWindow.type == "Editor") {
						var url = "put_file_contents";
						
						var data = targetWindow.editor.editor.getValue();
						
						$.ajax({
							url: url,			
							type: "GET",
							data: { path: path, data: data },
							success: function(data) {
								m.s("save as complete!", "editor");
								core.mainLayout.workSpace.windowManager.window[core.mainLayout.workSpace.windowManager.activeWindow].close();
								core.mainLayout.workSpace.windowManager.open("../../project/" + $("#fileSaveAsinputLocationPath").attr("value") + "/", $("#fileSaveAsInputFileName").attr("value"), tempType);
								core.mainLayout.projectExplorer.refresh();
							}
						});
					}
					self.dialog.panel.hide(); 

				}
			});
		};

		var handleCancel = function() { 
			
			this.hide(); 
		};
		
		this.buttons = [ {text:"Save", handler:handleSave, isDefault:true},
						 {text:"Cancel",  handler:handleCancel}];
						 
		this.dialog = new org.goorm.core.file.saveAs.dialog();
		this.dialog.init({
			title:"Save as", 
			path:"configs/dialogs/org.goorm.core.file/file.saveAs.html",
			width:800,
			height:500,
			modal:true,
			buttons:this.buttons,
			success: function () {
				var resize = new YAHOO.util.Resize("saveAsDialogLeft", {
		            handles: ['r'],
		            minWidth: 200,
		            maxWidth: 400
		        });
				
		        resize.on('resize', function(ev) {
					var width = $("#saveAsDialogMiddle").width();
		            var w = ev.width;
		            $("#saveAsDialogCenter").css('width', (width - w - 9) + 'px');
		        });
		        
			}
		});
		this.dialog = this.dialog.dialog;
		
		//this.dialog.panel.setBody("AA");
	},
	
	/**
	 * This function is an goorm core initializating function.  
	 * @method show 
	 **/
	show: function () {
	
		this.isSaveAnyway = false;
	
		if (core.mainLayout.workSpace.windowManager.activeWindow < 0) {
			alert.show(core.localization.msg["alertFileNotOpened"]);
			return false;
		}
	
		this.refreshAll();
		this.dialog.panel.show();
	},
	
	/**
	 * This function is an goorm core initializating function.  
	 * @method addDirectories 
	 **/	
	addDirectories: function(postdata) {		
		var self = this;

		$.post("file/get_nodes", postdata, function (data) {

			var sortProjectTreeview = function (sortingData) { 				
				s.quickSort(sortingData);
				
				for(i=0; i<sortingData.length; i++) {
					if(sortingData[i].children) {
						s.quickSort(sortingData[i].children);
					}
				}
			};

			var sortingData = eval(data);
			
			sortProjectTreeview(sortingData);
			
			var newData = new Array();

			for(var name in sortingData) {
				if(sortingData[name].cls=="folder") {
					newData.push(sortingData[name]);
				}
			}

			self.treeView = new YAHOO.widget.TreeView("fileSaveAsTreeview", newData);
		    
			self.treeView.subscribe("clickEvent", function(nodedata) {	
				if(nodedata.node.data.cls == "folder") {
					var filename = nodedata.node.data.filename;
					var filetype = nodedata.node.data.filetype;
					var filepath = nodedata.node.data.parentLabel;

					var dir = filepath + "/" + filename;
					dir = dir.replace(/\.\.\/\.\.\/project\/\//, "");
					dir = dir.replace(/\.\.\/\.\.\/project\//, "");
					dir = "/" + dir;
					dir = dir.replace(/\/\/\//, "/");
					dir = dir.replace(/\/\//, "/");
						
					self.currentPath = dir;

					$("#fileSaveAsinputLocationPath").attr("value", dir);

					var postdata = {
						kind: "project",
						projectName: self.currentPath,
						folderOnly: "false"
					};
					self.addFileItems(postdata);
				}
				
				return false;		
			});

			self.treeView.subscribe("dblClickEvent", function(nodedata) {	
				if(nodedata.node.data.cls == "folder") {
					if (nodedata.node.expanded) {
						nodedata.node.collapse();
					}
					else { 
						nodedata.node.expand();
					}
				}
			});
						
			self.treeView.render();
			
			self.treeExpandComplete();
			
			self.treeView.subscribe("expandComplete", function () {
				self.treeExpandComplete();	
			});
			
			if (self.currentPath == "") {
				$("#fileSaveAsTreeview").find(".ygtvdepth0").find(".ygtvcell").prev().addClass("ygtvfocus");
				$("#fileSaveAsTreeview").find(".ygtvdepth0").find(".ygtvcell").addClass("ygtvfocus");
			}

		});
	},

	/**
	 * This function is an goorm core initializating function.  
	 * @method expandDirectory
	 **/	
	expandDirectory: function (directory) {
				
		$("#fileSaveAsTreeview").find(".ygtvfocus").parent().parent().parent().parent().find(".ygtvcell").each(function () {
			if ($(this).find(".fullpath").text().split("/").pop() == directory) {
				$("#fileSaveAsTreeview").find(".ygtvfocus").removeClass("ygtvfocus");
				
				$(this).prev().addClass("ygtvfocus");
				$(this).addClass("ygtvfocus");
			}
		});

		this.treeView.getNodeByElement($("#fileSaveAsTreeview").find(".ygtvfocus")[0]).expand();
	},
	
	/**
	 * This function is an goorm core initializating function.  
	 * @method treeExpandComplete
	 **/	
	treeExpandComplete: function () {
		$("#fileSaveAsTreeview").find(".ygtvcell").unbind("mousedown");		
		$("#fileSaveAsTreeview").find(".ygtvcell").mousedown(function (e) {
			if ($(this).hasClass("ygtvfocus") == false) {
				$("#fileSaveAsTreeview").find(".ygtvfocus").removeClass("ygtvfocus");
				
				if ($(this).hasClass("ygtvcontent")) {
					$(this).prev().addClass("ygtvfocus");
					$(this).addClass("ygtvfocus");		
				}
			}
		});	
	},
	
	/**
	 * This function is an goorm core initializating function.  
	 * @method addFileItems
	 **/	
	addFileItems: function (postdata) {
	
		$("#saveAsDialogCenter").empty();
	
		var self = this;
		
		$.post("file/get_nodes", postdata, function (data) {
			
			var sortProjectTreeview = function (sortingData) { 				
				s.quickSort(sortingData);
			};

			var sortingData = eval(data);
			
			sortProjectTreeview(sortingData);
			
			for(var name in sortingData) {
				var iconStr = "";
				if(sortingData[name].cls=="folder") {
					iconStr += "<div class='folderitem'";
				}
				else {
					iconStr += "<div class='fileitem'";
				}
				
				iconStr +=" filename='"+sortingData[name].filename+"' filetype='"+sortingData[name].filetype+"' filepath='"+sortingData[name].parentLabel+"'>";
				if(sortingData[name].cls=="folder") {
					iconStr += "<img src='images/org.goorm.core.file/folder.png'>";
				}
				else {
					iconStr += "<img src='images/org.goorm.core.file/file.png'>";
				}
				iconStr += "<div style='word-break:break-all; width:60px; line-height:12px; margin-left:5px; margin-right:5px; margin-bottom:5px;'>";
				iconStr += sortingData[name].filename;
				iconStr += "</div>";
				iconStr += "</div>";
				
				$("#saveAsDialogCenter").append(iconStr);
			}
			
			$("#saveAsDialogMiddle").find(".folderitem").dblclick(function() {

				if (self.currentPath == "/")	self.currentPath = "";
				self.currentPath = self.currentPath+"/"+$(this).attr("filename");
				$("#fileSaveAsinputLocationPath").val(self.currentPath);

				var postdata = {
					kind: "project",
					projectName: self.currentPath,
					folderOnly: "false"
				};
									
				self.addFileItems(postdata);
				self.expandDirectory($(this).attr("filename"));
			});
			
			$("#saveAsDialogMiddle").find(".fileitem").click(function() {
				$("#saveAsDialogMiddle").find(".fileitem").removeClass("selectedItem");
				$("#saveAsDialogMiddle").find(".folderitem").removeClass("selectedItem");
				$(this).addClass("selectedItem");
			});
			
			$("#saveAsDialogMiddle").find(".folderitem").click(function() {
				$("#saveAsDialogMiddle").find(".fileitem").removeClass("selectedItem");
				$("#saveAsDialogMiddle").find(".folderitem").removeClass("selectedItem");
				$(this).addClass("selectedItem");
			});	
			
			$("#saveAsDialogMiddle").find(".fileitem").click(function() {			
				$("#fileSaveAsInputFileName").attr("value", $(this).attr("filename"));
			});

		});
	},
	
	refreshAll: function() {
	
		this.currentPath = "/"+core.currentProjectPath;

		$("#fileSaveAsinputLocationPath").val(this.currentPath);		
			
		var postdata = {
			kind: "project",
			projectName: this.currentPath,
			folderOnly: "true"
		};
		
		this.addDirectories(postdata);
		
		postdata = {
			kind: "project",
			projectName: this.currentPath,
			folderOnly: "false"
		};
		
		this.addFileItems(postdata);
	}
};