/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.object.properties = function () {
	this.target = null;
	this.manager = null;
	this.table = null;
	this.object = null;
};

org.goorm.core.object.properties.prototype = {
	init: function (target) {
		var self = this;
		
		this.target = target;
		

		var textbox_cell_editor = new YAHOO.widget.TextboxCellEditor({disableBtns:true});
				
		var table_column_definition = [
			{key:"attribute", label:"Attribute", sortable:false },
			{key:"value", label:"Value", sortable:false, editor: textbox_cell_editor}
		];
		
		var data_properties = new YAHOO.util.DataSource();
		data_properties.responseSchema = { 
			resultNode: "property", 
			fields: ["id","value"] 
		};
		
		var highlight_editable_cell = function(object) { 
			var cell = object.target; 
			if(YAHOO.util.Dom.hasClass(cell, "yui-dt-editable")) { 
				this.highlightCell(cell); 
			} 
		};
		
		var edit_complete = function (object) {
			var attribute = $(object.editor.getTdEl()).parent().find(".yui-dt-col-attribute").find(".yui-dt-liner").html();
			var value = object.newData;

			if (eval("self.object.properties." + attribute)) {
				eval("self.object.properties." + attribute + "='" + value + "';");
			}
			
			if (self.object.shape != null) {
				//if (eval("typeof(self.object.shape.properties." + attribute + ")!=undefined")) {
					eval("self.object.shape.properties." + attribute + "='" + value + "';");
				//}	
				self.object.properties.status = "modified";
			}
			self.refresh();
		};
	

		this.table = new YAHOO.widget.DataTable(target, table_column_definition, data_properties);
		
		this.table.set("MSG_EMPTY", "No object selected.");
		
		this.table.render();
		
		this.table.subscribe("cellClickEvent", this.table.onEventShowCellEditor);
		this.table.subscribe("cellMouseoutEvent", this.table.onEventUnhighlightCell);
		this.table.subscribe("cellMouseoverEvent", highlight_editable_cell);
		this.table.subscribe("editorSaveEvent", edit_complete);
		
		return this;
	},

	connect_manager: function (manager) {
		this.manager = manager;
	},

	set: function (object) {
		this.object = object;
		
		this.refresh();
	},
	
	unset: function () {
		this.object = null;
		
		this.refresh();
	},
	
	refresh: function () {
		var self = this;
		var index = 0;
		
		this.table.deleteRows(0, $("#"+this.target).find("table").find("tbody").find("tr").size());
		
		if (this.object) {
			$(this.object.properties.attribute_list).each(function (i) {
				var value = eval("self.object.properties." + this);
				self.table.addRow({attribute: this, value: value}, i);
				index = i;
			});
			
			if (this.object.shape != null && this.object.shape.properties != null) {
				
				$.each(this.object.shape.properties, function (key, state) {
					index++;
					//var value = eval("self.object.properties."+this);
					
					self.table.addRow({attribute: key, value: state}, index);
				});
			}
		}
		
		this.redraw();
	},

	redraw: function () {
		this.manager.canvas.draw();

		if (this.object) {
			if (this.object.shape != null) {
				this.object.shape.set_shape();
			}
			
			if (this.object.type == "square") {
				//this.object.properties.apply();
			}
		}
	},

	apply: function () {
	}
};