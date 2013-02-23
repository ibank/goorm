

org.goorm.core.auth.manage.manager = function () {
	this.treeview = null;
};

org.goorm.core.auth.manage.manager.prototype = {
	init: function (option) {

	},
	
	// add treeview node revursively
	add_treeview: function (parent, json){
		var self = this;
		var label = json.label;
		var tmpnode = new YAHOO.widget.HTMLNode(label, parent, json.expanded);
		
		if ($.isArray(json.child)) {
			$.each(json.child, function(index, object){
				self.add_treeview(tmpnode, object);
			});
		}
	},

	// create treeview structure
	create_treeview: function (json) {
		var self = this;
		var treeview = new YAHOO.widget.TreeView("auth_manage_treeview");
		
		var core = new YAHOO.widget.HTMLNode(json.core.label, treeview.getRoot(), json.core.expanded);

		// self.localization_ids.push({
			// 'id' : core.labelElId,
			// 'localization_key' : json.core.localization_key
		// });
		
		// add subtrees
		$.each(json.core.child, function(index, object){
			self.add_treeview(core, object);
		});
		
		treeview.render();
		this.treeview = treeview;
	},
	
	// add tabview node reculsively
	add_tabview: function(json){
		var self = this;
		var label = json.id || json.label;
		label = label.replace(/[/#. ]/g,"");
		
		$("#auth_manage_tabview").append("<div id='" + label + "' style='display:none'></div>");
		var tabview = new YAHOO.widget.TabView(label);
		if ($.isArray(json.tab)) {
			// 각각의 탭을 추가한다.
			$.each(json.tab, function(index, object){
				if(!$.isEmptyObject(object.html)){
					var url = object.html;
					var label = object.label;
					$.ajax({
						type: "GET",
						dataType: "html",
						async: false,
						url: url,
						success: function(data) {
							var tab = new YAHOO.widget.Tab({ 
							    label: label, 
							    content: data 
							});

							tabview.addTab(tab);
						}
					});
				}
			});
			
			tabview.set('activeIndex', 0);
		}
	},
	
	// create treeview structure
	create_tabview: function (json) {
		var self = this;
		var tabview = null;
		$.each(json.core.child, function(index, object) {
			self.add_tabview(object);
		});
	}

};


