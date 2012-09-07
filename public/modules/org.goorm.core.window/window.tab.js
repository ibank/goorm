/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/

org.goorm.core.window.tab = function () {
	this.tabview = null;
	this.list_menu = null;
	this.tab = null;
	this.menuitem = null;
	this.window = null;
	this.context_menu = null;
	this.title = null;
	this.is_saved = null;
};

org.goorm.core.window.tab.prototype = {
	
	init: function(container, title, tabview, list_menu) {
		
		
		var self = this;
		
		this.is_saved = true;
		
		this.tabview = tabview;
		this.list_menu = list_menu;
		
		this.title = title;
		
		this.tab = new YAHOO.widget.Tab({ label: "<span class='tabtitle' style='float:left'>" + this.title + "</span> <div class='window_buttons'><div class='close tab_close_button window_button'></div></div>", content: "" });

		
		this.tabview.addTab(this.tab);
		this.tabview.selectTab(this.tabview.getTabIndex(this.tab));
		
		this.menuitem = new YAHOO.widget.MenuItem("window_list_menu", {
			text: this.title, 
			onclick: {
				fn: function () {
					self.activate();
				}
			}
		});
		
		this.list_menu.addItem(this.menuitem);
		this.list_menu.render();
		
		this.context_menu = new org.goorm.core.menu.context();
		this.context_menu.init("configs/menu/org.goorm.core.window/window.tab.html", "window.tab", this.tab.get("labelEl"), this.title, null, function () { self.set_event(); });
	},

	set_event: function(){
		var self = this;
		//////////////////////////////////////////////////////////////////////////////////////////
		// window tab events
		//////////////////////////////////////////////////////////////////////////////////////////
		var str = self.context_menu.name.replace(/[/.]/g,"\\.");
		
		//tab right click event assign
		$(this.tab.get("labelEl")).mousedown(function(e) {
		    if (e.which === 3) {
		    	if($("#"+self.window.container+"_c").css("display") == "none"){
		    		$("#"+str).find(".unminimize").removeClass('yuimenuitemlabel-disabled');
		    		$("#"+str).find(".unminimize").parent().removeClass('yuimenuitem-disabled');
		    		$("#"+str).find(".minimize").addClass('yuimenuitemlabel-disabled');
		    		$("#"+str).find(".minimize").parent().addClass('yuimenuitem-disabled');
		    	}
		    	else {
		    		$("#"+str).find(".unminimize").addClass('yuimenuitemlabel-disabled');
		    		$("#"+str).find(".unminimize").parent().addClass('yuimenuitem-disabled');
		    		$("#"+str).find(".minimize").removeClass('yuimenuitemlabel-disabled');
		    		$("#"+str).find(".minimize").parent().removeClass('yuimenuitem-disabled');
		    	}

				return false;
		    }
		});

		//tab click event assign
		$(this.tab.get("labelEl")).click(function(e) {
			if (e.which == 1) {
				self.activate();
				
				e.stopPropagation();
				e.preventDefault();
				return false;
			}
		});	
		
		//close button click event assign
		$(this.tab.get("labelEl")).find(".close").click(function(e) {
			if (e.which == 1) {
				self.close();
				return false;
			}
		});
		
		$("#"+str).find(".close").click(function(e){
			if (e.which == 1) {
				self.context_menu.hide();
				self.close();
				return false;
			}
		});
		
		$("#"+str).find(".minimize").click(function(e){
			if (e.which == 1) {
				self.context_menu.hide();
				self.window.minimize();
				return false;
			}
		});
		
		$("#"+str).find(".unminimize").click(function(e){
			if (e.which == 1) {
				if(!$(this).hasClass('yuimenuitemlabel-disabled')){
					self.context_menu.hide();
					self.activate();
				}
				return false;
			}
		});
	},
	
	set_modified: function() {
	 	var tabtitle = $(this.tab.get("labelEl")).find(".tabtitle").text();
	  	tabtitle = tabtitle.replace(" *", "");
		$(this.tab.get("labelEl")).find(".tabtitle").html(tabtitle + " *");
		
		this.is_saved = false;
	},
	
	set_saved: function() {
	  	var tabtitle = $(this.tab.get("labelEl")).find(".tabtitle").text();
		$(this.tab.get("labelEl")).find(".tabtitle").html(tabtitle.replace(" *", ""));
		
		this.is_saved = true;
	},
  
	connect: function(window) {
		this.window = window;
	},
	
	close: function () {
		var self = this;

		if(this.is_saved) {		
			
			this.tabview.removeTab(this.tab);
			
			//core.module.layout.workspace.window_manager.window.splice(core.module.layout.workspace.window_manager.window.indexOf(this.tabview.getTabIndex(this.tab)), 1);
					
			this.list_menu.removeItem(this.menuitem);
			
			this.context_menu.remove();
			
			if(this.window) {
				this.window.tab = null;
				this.window.close();
			}
			
			delete this;
		}
		else {
			confirmation_save.init({
				title: core.module.localization.msg["confirmation_save_title"], 
				message: "\""+this.window.filename+"\" "+core.module.localization.msg["confirmation_save_message"],
				yes_text: core.module.localization.msg["confirmation_yes"],
				cancel_text: core.module.localization.msg["confirmation_cancel"],
				no_text: core.module.localization.msg["confirmation_no"],
				yes: function () {
					self.window.editor.save("close");
				}, cancel: function () {
				}, no: function () {
					self.is_saved = true;
					self.window.is_saved = true;
					self.close();
				}
			});
			
			confirmation_save.panel.show();
		}
	},
	
	activate: function() {
		this.tabview.selectTab(this.tabview.getTabIndex(this.tab));
		
		$("#window_list_menu").find(".yuimenuitem-checked").each(function(i) {
			$(this).removeClass("yuimenuitem-checked");
		});
		
		$(this.menuitem.element).addClass("yuimenuitem-checked");
		if (this.window) {
			core.module.toolbar.switch_state(this.window.type);
			this.window.show();
			
			
			if (!$("#" + this.window.container).find(".hd").hasClass("activated")) {
				for (var i = 0; i < core.module.layout.workspace.window_manager.index; i++) {
					if (core.module.layout.workspace.window_manager.window[i].alive && core.module.layout.workspace.window_manager.window[i] == this.window) {
						core.module.layout.workspace.window_manager.active_window = i;
						break;
					}
				}
				
				this.window.activate();
			}
		}
	}
};