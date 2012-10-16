/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/

org.goorm.core.theme.manager = function () {
	this.parent = null;
	this.treeview = null;
	this.treeview_json = null;
	this.table_variable_array = [];
	this.table_name_array = [];
};

org.goorm.core.theme.manager.prototype = {
	init: function (parent) {
		this.parent = parent;
	},
	
	// add treeview node revursively
	add_treeview: function (parent, json){
		var self = this;
		var label = json.label;
		var tmpnode = new YAHOO.widget.TextNode(label, parent, json.expanded);
		if ($.isArray(json.child)) {
			$.each(json.child, function(index, object){
				self.add_treeview(tmpnode, object);
			});
		}
	},

	// create treeview structure
	create_treeview: function (json) {
		var self = this;
		var treeview = new YAHOO.widget.TreeView("theme_details_treeview");
		var general = new YAHOO.widget.TextNode(json.general.label, treeview.getRoot(), json.general.expanded);

		self.treeview_json = json.general.child;

		$.each(json.general.child, function(index, object){
			self.add_treeview(general, object);
		});

		treeview.render();
		this.treeview = treeview;
	},
	
	// add tabview node reculsively
	add_tabview: function(json){
		var self = this;
		var label = json.label;
		label = label.replace(/[/#. ]/g,"");

		$("#theme_details_tabview").append("<div id='" + label + "' style='display:none'></div>");
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

		$.each(json.general.child, function(index, object) {
			self.add_tabview(object);
		});
	},
	
	create_datatable: function() {
		console.log("create datatable");
		var self = this;

		self.table_variable_array = [];
		self.table_name_array = [];

		var table_variable_column_definition = [
			{key:"selector", label:"Selector", hidden:true},
			{key:"position", label:"Position", hidden:true},
			{key:"description", label:"Description", width:170},
			{key:"property", label:"Property", width:100},
			{key:"value", label:"Value", width:360, editor: new YAHOO.widget.TextboxCellEditor({disableBtns:true})},
			{key:"isArray", label:"isArray", hidden:true}
		];
		var table_variable_data_properties = new YAHOO.util.DataSource();
		table_variable_data_properties.responseSchema = {
			fields: ["selector","position","description","property","value","isArray"]
		};
		
		$.each(self.treeview_json, function(index, object) {
			$.each(object.tab, function(index, object) {
				self.table_variable_array.push(new YAHOO.widget.ScrollingDataTable(object.element, table_variable_column_definition, table_variable_data_properties, {width:"694px", height:"310px"}));
				self.table_name_array.push(object.element);
			});
		});
		self.subscribe_datatable();
	},

	subscribe_datatable: function() {
		var self = this;

		var highlightEditableCell = function(oArgs) {
			var elCell = oArgs.target;
			if(YAHOO.util.Dom.hasClass(elCell, "yui-dt-editable")) {
				this.highlightCell(elCell);
			}
		};

		for(var i = 0; i < self.table_variable_array.length; i++){
			self.table_variable_array[i].subscribe("cellMouseoverEvent", highlightEditableCell);
			self.table_variable_array[i].subscribe("cellMouseoutEvent", self.table_variable_array[i].onEventUnhighlightCell);
			self.table_variable_array[i].subscribe("cellClickEvent", self.table_variable_array[i].onEventShowCellEditor);
		}
	},

	set_datatable: function() {
		console.log("set datatable");
		var self = this;
		self.clear_datatable();

		var element_array = [];
		var element_table_name_array = [];

		$.each(self.treeview_json, function(index, object) {
			$.each(object.tab, function(index, tab) {
				$.each(tab.style, function(index, style) {
					element_array.push(tab.element+"-"+style);
					element_table_name_array.push(tab.element);
				});
			});
		});

		for(var i=0; i<element_array.length; i++){
			var table_idx = self.table_name_array.indexOf(element_table_name_array[i]);

			var selector = self.parent.current_theme_data[element_array[i].split("_")[0]].selector;
			var position = element_array[i].split("_")[0];
			var description = self.parent.current_theme_data[element_array[i].split("_")[0]].description;
			var property = element_array[i].split("_")[1];
			var value = self.parent.current_theme_data[element_array[i].split("_")[0]].style[element_array[i].split("_")[1]];

			if($.isArray(value)){
				for(var style_cnt=0; style_cnt<value.length; style_cnt++){
					self.table_variable_array[table_idx].addRow({selector:selector, position:position, description:description, property:property, value:value[style_cnt], isArray:true}, 0);	
				}
			}
			else
				self.table_variable_array[table_idx].addRow({selector:selector, position:position, description:description, property:property, value:value, isArray:false}, 0);
		}
	},

	clear_datatable: function() {
		console.log("clear datatable");
		var self = this;

		for(var i=0; i<self.table_variable_array.length; i++){			
			self.table_variable_array[i].getRecordSet().reset();
			self.table_variable_array[i].render();

		}
	},

	update_json: function() {
		var self = this;
		
		for(var element in self.parent.current_theme_data){

			for(var property in self.parent.current_theme_data[element].style){
				if($.isArray(self.parent.current_theme_data[element].style[property])){
					self.parent.current_theme_data[element].style[property]=[];
				}
			}
		}

		for(var i=0; i<self.table_variable_array[0].getRecordSet()._records.length; i++){
			var position = self.table_variable_array[0].getRecordSet()._records[i]._oData.position;
			var property = self.table_variable_array[0].getRecordSet()._records[i]._oData.property;
			var value = self.table_variable_array[0].getRecordSet()._records[i]._oData.value; 
			var isArray = self.table_variable_array[0].getRecordSet()._records[i]._oData.isArray; 

			if(!isArray){
				self.parent.current_theme_data[position].style[property]=value;
			}
			else{
				self.parent.current_theme_data[position].style[property].push(value);
			}
		}
/* 		self.parent.apply_theme(); */
	}
};


