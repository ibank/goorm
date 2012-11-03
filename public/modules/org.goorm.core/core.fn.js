/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v3 License:
 * http://www.goorm.io/intro/License
 * project_name : goormIDE
 * version: 1.0.0
 **/

org.goorm.core.fn = function() {
	
};

org.goorm.core.fn.prototype = {
	init: function () {
		//////////////////////////////////////////////////////////////////////////////////////////////////////
		// Expand jquery function : reverse()
		//////////////////////////////////////////////////////////////////////////////////////////////////////
		
		$.fn.reverse = function() {
			return this.pushStack(this.get().reverse(), arguments);
		};
		
		//I forgot why I needed this function... fuck 
		$.fn.formatForDisplay = function() {
			if (this.size()==0) return "<em>wrapped set is empty</em>"
			var text = '';
			this.each(function(){
				text += '<div>' + this.tagName;
				if (this.id) text += '#' + this.id;
				text += '</div>';
			});
		  return text;
		}; 
		
		$.fn.move = function (old_index, new_index) {
		    while (old_index < 0) {
		        old_index += this.length;
		    }
		    while (new_index < 0) {
		        new_index += this.length;
		    }
		    if (new_index >= this.length) {
		        var k = new_index - this.length;
		        while ((k--) + 1) {
		            this.push(undefined);
		        }
		    }
		    this.splice(new_index, 0, this.splice(old_index, 1)[0]);
		    return this; // for testing purposes
		};
		
		Array.prototype.remove = function(from, to) {
			var rest = this.slice((to || from) + 1 || this.length);
			this.length = from < 0 ? this.length + from : from;
			return this.push.apply(this, rest);
		};
		
		Array.prototype.diff = function(a) {
			return this.filter(function(i) {
				return !(a.indexOf(i) > -1);
			});
		};
		
		Array.prototype.unique = function () {
			var r = new Array();
			o:for(var i = 0, n = this.length; i < n; i++) {
				for(var x = 0, y = r.length; x < y; x++)
				{
					if(r[x]==this[i])
					{
						continue o;
					}
				}
				r[r.length] = this[i];
			}
			return r;
		};
		
		Array.prototype.contains = function (element) {
			for (var i = 0; i < this.length; i++) {
				if (this[i] == element) {
					return true;
				}
			}
			return false;
		};
		
		Array.prototype.inArray = function (element) {
			for (var i = 0; i < this.length; i++) {
				if (this[i] == element) {
					return i;
				}
			}
			return -1;
		};
		
		Array.prototype.shuffle=function() {
			var i=this.length,j,t;
			while(i--) {
				j=Math.floor((i+1)*Math.random());
				t=arr[i];
				arr[i]=arr[j];
				arr[j]=t;
			}
		}
		
		Array.prototype.hasObject = (
			!Array.indexOf ? function (o) {
				var l = this.length + 1;
				while (l -= 1) {
					if (this[l - 1] === o) {
						return true;
					}
				}
				return false;
			}: function (o) {
				return (this.indexOf(o) !== -1);
			}
		);
	}
};