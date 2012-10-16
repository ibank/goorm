/**
 * Copyright Sung-tae Ryu. All rights reserved.
 * Code licensed under the GPL v2 License:
 * http://www.goorm.org/License
 **/

org.goorm.core.utility.sorting = function () {

};

org.goorm.core.utility.sorting.prototype = {
	
	sorting_function: function (a, b) {
		if (a.sortkey < b.sortkey) return -1;
		if (a.sortkey > b.sortkey) return 1;
		return 0; 
	},
	
	quick_sort: function (array) {
		if (array.length != 0) {
			
			array.sort(this.sorting_function);


			return array;
		}
	}

};