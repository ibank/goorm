/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/

org.goorm.core.menu.context = function () {
	this.menu = null;
	this.target = null;
	this.name = null;
};

org.goorm.core.menu.context.prototype = {
	init: function (path, name, trigger, fingerprint, target, fn) {
		var self = this;
		
		this.target = target;
		
		if (name == "none") {
			$(trigger).bind("contextMenu", function(e) {
				return false;
			});
		}
		else {
			var url = "file/get_contents";
			
			if (trigger == "") {
				trigger = null;
			}
	
			$.ajax({
				url: url,			
				type: "GET",
				data: "path=public/" + path,
				success: function(data) {
					if(fingerprint != null && fingerprint != "") {
						while (data.indexOf("[{@FINGERPRINT}]") != -1) {
							data = data.replace("[{@FINGERPRINT}]", fingerprint);							
						}
	
						name = name + "_" + fingerprint;
					}
					self.name=name;
					$("#goorm_menu_container").find("div[id='" + name + "']").remove();
					$("#goorm_menu_container").append(data);
					
					$(trigger).bind("contextmenu", function(e) {
						e.preventDefault();
						return false;
					});
					
					self.menu = new YAHOO.widget.ContextMenu( 
						name,  
						{ 
							trigger: trigger, 
							lazyload: true,
							effect: {  
								effect: YAHOO.widget.ContainerEffect.FADE, 
								duration: 0.15 
							}                                     
						}
					);
					
					//m.s("asdf" + fn, "asdf");
					
					if(fn) {
						fn.call(self);
					}

					/*
					if(fingerprint == "treeview") { //Does fingerprint div have a treeview?
		
						$("#"+trigger).find(".ygtvcell").bind("context_menu", function (e) {

							var targetEl = e.target;
			 
							//m.s($(targetEl).html(), "menu.context");
							
							var currentNode = target.getNodeByElement(targetEl);
			 
			 				//m.s(currentNode.toSource(), "menu.context");
							
							if (currentNode) {
								m.s("show" + currentNode, "asdf");
								self.menu.show();
							}
							
							return false;
			 
						});
					}
					*/
				}
			});			
		}
	},
	
	show: function () {
		if (this.menu) {
			this.menu.show();
		}
	},

	cancel: function () {
		if (this.menu) {
			this.menu.cancel();
		}
	},
	
	blur: function () {
		if (this.menu) {
			this.menu.blur();
		}
	},	
	
	hide: function () {
		if (this.menu) {
			this.menu.hide();
		}
	},
	
	remove: function () {
		$("#" + this.target).remove();
		
		delete this;
	}
};
