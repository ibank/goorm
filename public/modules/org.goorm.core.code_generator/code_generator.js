/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/
 
org.goorm.core.code_generator = function () {

};

org.goorm.core.code_generator.prototype = {

	init: function () { 
		var self = this;
	},
	
	generate: function() {
		var self = this;
		
		var filename = core.status.selected_file.replace("../../project/"+core.status.current_project_path+"/", "");
		var newFileName = filename.replace(".ui", ".xml");
				
		var postdata = {
			source: core.status.current_project_path + "/" + filename,
			target: core.status.current_project_path + "/res/layout/" + newFileName
		};
		
		$.post("module/org.goorm.core.code_generator/code_generator.ui2xml.php", postdata, function (data) {			

							
			//self.generateByRule();
			
			core.module.layout.project_explorer.refresh();
		});
	},
	
	generateByRule: function() {
		var postdata = {
				source: core.status.current_project_path,
				target: core.currentProjectFile
			};
										
		$.post("module/org.goorm.core.code_generator/codeZenerator.php", postdata, function (data) {
//			var received_data = eval("("+data+")");
//
//			if(received_data.errCode==0) {
//			}
//			else {
//			}
		});
	}
		
};