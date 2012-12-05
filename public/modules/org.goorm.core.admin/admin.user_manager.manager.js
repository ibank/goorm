

org.goorm.core.admin.user_manager.manager = function () {
	this.treeview_source = "user_manager_treeview"
	this.tabview_source = "user_manager_tabview"
	
	this.treeview = null;
	this.tabview = {};
	this.tabview_list = {};
	this.localization_ids = [];
};

org.goorm.core.admin.user_manager.manager.prototype = {
	init: function () {
	
	},
	
	// create treeview structure
	create_treeview: function (json) {
		var self = this;
		var treeview = new YAHOO.widget.TreeView(self.treeview_source);
		
		var core = new YAHOO.widget.TextNode(json.core.label, treeview.getRoot(), json.core.expanded);

		var tmpid = core.labelElId;
		self.localization_ids.push({
			'id' : tmpid,
			'localization_key' : json.core.localization_key
		});
		
		// add subtrees
		$.each(json.core.child, function(index, object){
			self.add_treeview(core, object);
		});
		
		treeview.render();
		this.treeview = treeview;
	},
	
	// add treeview node revursively
	add_treeview: function (parent, json){
		var self = this;
		var label = json.label;
		var tmpnode = new YAHOO.widget.TextNode(label, parent, json.expanded);

		var tmpid = tmpnode.labelElId;
		self.localization_ids.push({
			'id' : tmpid,
			'localization_key' : json.localization_key
		});
		
		if ($.isArray(json.child)) {
			$.each(json.child, function(index, object){
				self.add_treeview(tmpnode, object);
			});
		}
	},
	
	create_tabview: function (json) {
		var self = this;
		var tabview = null;
		$.each(json.core.child, function(index, object) {
			self.add_tabview(object);
		});
	},
	
	// add tabview node reculsively
	add_tabview: function(json, plugin_name){
		var self = this;
		var label = json.label;
		
		plugin_name || (plugin_name = "null");
		
		$("#"+self.tabview_source).append("<div id='" + label + "' plugin="+plugin_name+" style='display:none'></div>");
		if(!self.tabview_list[label]) self.tabview_list[label] = {};

		var tabview = new YAHOO.widget.TabView(label);
		if ($.isArray(json.tab)) {
			// 각각의 탭을 추가한다.
			$.each(json.tab, function(index, object){
				if(!$.isEmptyObject(object.html)){
					var url = object.html;
					var tablabel = object.label;
					var classname = object.classname;
					$.ajax({
						type: "GET",
						dataType: "html",
						async: false,
						url: url,
						success: function(data) {
							var tab = new YAHOO.widget.Tab({ 
							    label: tablabel, 
							    content: data 
							});
							
							self.tabview_list[label][classname] = eval('new org.goorm.core.admin.user_manager.'+classname+'()');
							tabview.addTab(tab);
						}
					});
				}
			});
			
			tabview.set('activeIndex', 0);
			self.tabview[label] = tabview;
		}
	}
}