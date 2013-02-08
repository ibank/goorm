/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the AGPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.clipboard = function () {
	this.clip = null;
};

org.goorm.core.clipboard.prototype = {
	
	init: function (){
		this.clip = {};
		ZeroClipboard.setMoviePath( '/lib/com.zeroclipboard/ZeroClipboard.swf' );
		
		this._init_copy();
		this._init_cut();
	},
	
	_init_copy: function(){
		var self = this;
		this.clip.copy = {};
		/*
		 * Toolbar
		 */
		this.clip.copy.icon = new ZeroClipboard.Client('icon_copy');
		this.clip.copy.icon.setHandCursor(true);
		this.clip.copy.icon.setCSSEffects(false);
		
		this.clip.copy.icon.addEventListener('mouseOver', function (client) {
			$("#icon_copy .toolbar_button").addClass("hover");
		});
		this.clip.copy.icon.addEventListener('mouseDown', function (client) {
			$("a[action=do_copy]")[0].click();
			client.setText(localStorage["clipboard"]);
		});		
		this.clip.copy.icon.addEventListener('mouseOut', function (client) {
			$("#icon_copy .toolbar_button").removeClass("hover");
		});
		
		/*
		 * Mainmenu
		 */
		this.clip.copy.menu = new ZeroClipboard.Client('menu_copy');
		this.clip.copy.menu.setHandCursor(false);
		this.clip.copy.menu.setCSSEffects(false);
		this.clip.copy.menu.hide();
		
		var edit = core.module.layout.mainmenu.getItem(1)._oSubmenu;
		edit.subscribe("show", function(){
			self.clip.copy.menu.reposition();

			// 위치가 살짝 밑으로 밀림.
			$(self.clip.copy.menu.movie).css("margin-top","-8px");
		});
		edit.subscribe("hide", function(){
			// 그냥 호출하면 복사가 되기전에 닫혀서 동작안함.
			setTimeout(function(){
				self.clip.copy.menu.hide();
			}, 500);
		});
		
		this.clip.copy.menu.addEventListener('mouseOver', function (client) {
			$("#menu_copy").addClass("yuimenuitem-selected");
			edit._cancelHideDelay();
		});
		this.clip.copy.menu.addEventListener('mouseDown', function (client) {
			$("a[action=do_copy]")[0].click();
			client.setText(localStorage["clipboard"]);
		});		
		this.clip.copy.menu.addEventListener('mouseOut', function (client) {
			$("#menu_copy").removeClass("yuimenuitem-selected");
			if(test._useHideDelay == false) {
				edit._execHideDelay();
			}
		});
		
		/*
		 * Context menu
		 */
		this.clip.copy.context = {};
	},
	
	_init_cut: function(){
		var self = this;
		this.clip.cut = {};
		this.clip.cut.icon = new ZeroClipboard.Client('icon_cut');
		this.clip.cut.icon.setHandCursor(true);
		this.clip.cut.icon.setCSSEffects(false);
		
		this.clip.cut.icon.addEventListener('mouseOver', function (client) {
			$("#icon_cut .toolbar_button").addClass("hover");
		});
		this.clip.cut.icon.addEventListener('mouseDown', function (client) {
			$("a[action=do_cut]")[0].click();
			client.setText(localStorage["clipboard"]);
		});		
		this.clip.cut.icon.addEventListener('mouseOut', function (client) {
			$("#icon_cut .toolbar_button").removeClass("hover");
		});
		
		this.clip.cut.menu = new ZeroClipboard.Client('menu_cut');
		this.clip.cut.menu.setHandCursor(false);
		this.clip.cut.menu.setCSSEffects(false);
		this.clip.cut.menu.hide();
		
		var edit = core.module.layout.mainmenu.getItem(1)._oSubmenu;
		edit.subscribe("show", function(){
			self.clip.cut.menu.reposition();
			
			// 위치가 살짝 밑으로 밀림.
			$(self.clip.cut.menu.movie).css("margin-top","-8px");
		});
		edit.subscribe("hide", function(){
			// 그냥 호출하면 복사가 되기전에 닫혀서 동작안함.
			setTimeout(function(){
				self.clip.cut.menu.hide();
			}, 500);
		});
		
		this.clip.cut.menu.addEventListener('mouseOver', function (client) {
			$("#menu_cut").addClass("yuimenuitem-selected");
			edit._cancelHideDelay();
		});
		this.clip.cut.menu.addEventListener('mouseDown', function (client) {
			$("a[action=do_cut]")[0].click();
			client.setText(localStorage["clipboard"]);
		});		
		this.clip.cut.menu.addEventListener('mouseOut', function (client) {
			$("#menu_cut").removeClass("yuimenuitem-selected");
			if(test._useHideDelay == false) {
				edit._execHideDelay();
			}
		});
		
		/*
		 * Context menu
		 */
		this.clip.cut.context = {};
	},
	
	init_context: function(context){
		var self = this;
		var context_id = context.menu.element.id.split("_").pop();
		$(context.menu.element).find("#context_copy").attr("id","context_copy_"+context_id);
		$(context.menu.element).find("#context_cut").attr("id","context_cut_"+context_id);
		
		/*
		 * Copy
		 */
		this.clip.copy.context[context_id] = new ZeroClipboard.Client('context_copy_'+context_id);
		this.clip.copy.context[context_id].setHandCursor(false);
		this.clip.copy.context[context_id].setCSSEffects(false);
		this.clip.copy.context[context_id].hide();
		
		var context_menu = context.menu;
		context_menu.subscribe("show", function(){
			var context_id = this.id.split("_").pop();
			// 위치가 살짝 밑으로 밀림.
			$(self.clip.copy.context[context_id].movie).css("margin-top","-12px");
			
			self.clip.copy.context[context_id].reposition();
		});
		context_menu.subscribe("hide", function(){
			var context_id = this.id.split("_").pop();
			// 그냥 호출하면 복사가 되기전에 닫혀서 동작안함.
			setTimeout(function(){
				self.clip.copy.context[context_id].hide();
			}, 500);
		});
		
		this.clip.copy.context[context_id].addEventListener('mouseOver', function (client) {
			$("#context_copy_"+context_id).addClass("yuimenuitem-selected");
		});
		this.clip.copy.context[context_id].addEventListener('mouseDown', function (client) {
			$("a[action=do_copy]")[0].click();
			client.setText(localStorage["clipboard"]);
		});		
		this.clip.copy.context[context_id].addEventListener('mouseOut', function (client) {
			$("#context_copy_"+context_id).removeClass("yuimenuitem-selected");
			if(test._useHideDelay == false) {
			}
		});
		
		
		/*
		 * Cut
		 */
		this.clip.cut.context[context_id] = new ZeroClipboard.Client('context_cut_'+context_id);
		this.clip.cut.context[context_id].setHandCursor(false);
		this.clip.cut.context[context_id].setCSSEffects(false);
		this.clip.cut.context[context_id].hide();
		
		var context_menu = context.menu;
		context_menu.subscribe("show", function(){
			var context_id = this.id.split("_").pop();
			// 위치가 살짝 밑으로 밀림.
			$(self.clip.cut.context[context_id].movie).css("margin-top","-12px");
			
			self.clip.cut.context[context_id].reposition();
		});
		context_menu.subscribe("hide", function(){
			var context_id = this.id.split("_").pop();
			// 그냥 호출하면 복사가 되기전에 닫혀서 동작안함.
			setTimeout(function(){
				self.clip.cut.context[context_id].hide();
			}, 500);
		});
		
		this.clip.cut.context[context_id].addEventListener('mouseOver', function (client) {
			$("#context_cut_"+context_id).addClass("yuimenuitem-selected");
		});
		this.clip.cut.context[context_id].addEventListener('mouseDown', function (client) {
			$("a[action=do_cut]")[0].click();
			client.setText(localStorage["clipboard"]);
		});		
		this.clip.cut.context[context_id].addEventListener('mouseOut', function (client) {
			$("#context_cut_"+context_id).removeClass("yuimenuitem-selected");
			if(test._useHideDelay == false) {
			}
		});
	},
	

};