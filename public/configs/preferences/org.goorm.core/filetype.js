var self = this;

var fileTypes = core.filetypes;

for (var i = 0; i<core.filetypes.length; i++) {
	
	var extName = fileTypes[i].file_extension;
	var editor = fileTypes[i].editor;
	var description = fileTypes[i].description;
	var type = fileTypes[i].type;
	
	$(".filetype_contents").find(".filetype_list").append("<div class="+extName+">"+extName+"</div>");
	$(".filetype_contents").find("."+extName).click(function () {
		
		$(".filetype_contents").find(".filetype_list").children().each(function () {
			$(this).css('background-color', '#fff');
		});
		$(this).css('background-color', '#eee');
		
		$(".filetype_contents").find(".filetype_detail").children().each(function() { 
			$(this).remove(); 
		});	
		$(".filetype_contents").find(".filetype_detail").append("<div style='width:100%;'>Extension Name</div>");
		$(".filetype_contents").find(".filetype_detail").append("<div style='width:100%;'><input class='file_extension' style='width:200px;' value='"+$(this).attr("id")+"'></input></div>");
		$(".filetype_contents").find(".filetype_detail").append("<div style='width:100%;'>Editor</div>");
		$(".filetype_contents").find(".filetype_detail").append("<div style='width:100%;'><input class='editor' style='width:200px;' value='"+self.get_filetype_info($(this).attr("id"), "editor")+"'></input></div>");
		$(".filetype_contents").find(".filetype_detail").append("<div style='width:100%;'>Type</div>");
		$(".filetype_contents").find(".filetype_detail").append("<div style='width:100%;'><input class='type' style='width:200px;' value='"+self.get_filetype_info($(this).attr("id"), "type")+"'></input></div>");
		$(".filetype_contents").find(".filetype_detail").append("<div style='width:100%;'>Description</div>");
		$(".filetype_contents").find(".filetype_detail").append("<div style='width:100%;'><textarea class='description' style='resize: none; width:200px; height:100px; overflow:hidden;'>"+self.get_filetype_info($(this).attr("id"), "description")+"</textarea></div>");
	});
}

$("#add").click(function () {
	$(".filetype_contents").find(".filetype_list").append("<div class='newExt'>New Extention</div>");
	$(".filetype_contents").find(".filetype_list").find(".newExt").click(function () {
		
		$(".filetype_contents").find(".filetype_list").children().each(function () {
			$(this).css('background-color', '#fff');
		});
		$(this).css('background-color', '#eee');
		
		$(".filetype_contents").find(".filetype_detail").children().each(function() { 
			$(this).remove(); 
		});
		
		if ($(this).hasClass("newExt")) {	
			$(".filetype_contents").find(".filetype_detail").append("<div style='width:100%;'>Extention Name</div>");
			$(".filetype_contents").find(".filetype_detail").append("<div style='width:100%;'><input class='file_extension' style='width:200px;' value=''></input></div>");
			$(".filetype_contents").find(".filetype_detail").append("<div style='width:100%;'>Editor</div>");
			$(".filetype_contents").find(".filetype_detail").append("<div style='width:100%;'><input class='editor' style='width:200px;' value=''></input></div>");
			$(".filetype_contents").find(".filetype_detail").append("<div style='width:100%;'>Type</div>");
			$(".filetype_contents").find(".filetype_detail").append("<div style='width:100%;'><input class='type' style='width:200px;' value=''></input></div>");
			$(".filetype_contents").find(".filetype_detail").append("<div style='width:100%;'>Description</div>");
			$(".filetype_contents").find(".filetype_detail").append("<div style='width:100%;'><textarea class='description' style='resize: none; width:200px; height:100px; overflow:hidden;'></textarea></div>");
		}
		else {
			$(".filetype_contents").find(".filetype_detail").append("<div style='width:100%;'>Extention Name</div>");
			$(".filetype_contents").find(".filetype_detail").append("<div style='width:100%;'><input class='file_extension' style='width:200px;' value='"+$(this).attr("id")+"'></input></div>");
			$(".filetype_contents").find(".filetype_detail").append("<div style='width:100%;'>Editor</div>");
			$(".filetype_contents").find(".filetype_detail").append("<div style='width:100%;'><input class='editor' style='width:200px;' value='"+self.get_filetype_info($(this).attr("id"), "editor")+"'></input></div>");
			$(".filetype_contents").find(".filetype_detail").append("<div style='width:100%;'>Type</div>");
			$(".filetype_contents").find(".filetype_detail").append("<div style='width:100%;'><input class='type' style='width:200px;' value='"+self.get_filetype_info($(this).attr("id"), "type")+"'></input></div>");
			$(".filetype_contents").find(".filetype_detail").append("<div style='width:100%;'>Description</div>");
			$(".filetype_contents").find(".filetype_detail").append("<div style='width:100%;'><textarea class='description' style='resize: none; width:200px; height:100px; overflow:hidden;'>"+self.get_filetype_info($(this).attr("id"), "description")+"</textarea></div>");
		}
	});
})

$("#del").click(function () {
	$(".filetype_contents").find(".filetype_list").children().each(function() {
		if ($(this).attr("id") == $(".filetype_contents").find(".file_extension").val()){
			var temp = [];
			for (var i = 0; i < core.filetypes.length; i++) {
				if (core.filetypes[i].file_extension != $(this).attr("id")) {
					temp.push(core.filetypes[i]);
				}
			}
			core.filetypes = temp;
			$(this).remove();
		}
	});
	$(".filetype_contents").find(".filetype_detail").children().each(function() {
		$(this).remove();
	});
})


$("#save").click(function () {
	
	var finded = false;
	
	if ($(".filetype_contents").find(".filetype_detail").find(".file_extension").length != 0){
		for (var i = 0; i < core.filetypes.length; i++) {
			if (core.filetypes[i].file_extension == $(".filetype_contents").find(".filetype_detail").find(".file_extension").val()) {
				finded = true;
				core.filetypes[i].editor = $(".filetype_contents").find(".filetype_detail").find(".editor").val();
				core.filetypes[i].type = $(".filetype_contents").find(".filetype_detail").find(".type").val();
				core.filetypes[i].description = $(".filetype_contents").find(".filetype_detail").find(".description").val();
			}
		}
		
		if (finded == false && $(".filetype_contents").find(".filetype_detail").find(".file_extension").val() != "") {
			var temp = {
				"file_extension":$(".filetype_contents").find(".filetype_detail").find(".file_extension").val(),
				"editor":$(".filetype_contents").find(".filetype_detail").find(".editor").val(),
				"description":$(".filetype_contents").find(".filetype_detail").find(".description").val(),
				"type":$(".filetype_contents").find(".filetype_detail").find(".type").val()
			}
			core.filetypes.push(temp);
			$(".filetype_contents").find(".filetype_list").find(".newExt").html($(".filetype_contents").find(".filetype_detail").find(".file_extension").val());
			var ext = $(".filetype_contents").find(".filetype_detail").find(".file_extension").val();
			$(".filetype_contents").find(".filetype_list").find(".newExt").attr("id", ext);
		}
	}
})

var get_filetype_info = function (ext, attr) {
	
	for (var i = 0; i < core.filetypes.length; i++) {
		if (core.filetypes[i].file_extension == ext) {
			if (attr == "editor")
				return core.filetypes[i].editor;
			else if (attr == "description")
				return core.filetypes[i].description;
			else if (attr == "type")
				return core.filetypes[i].type;
		}
	}
};
