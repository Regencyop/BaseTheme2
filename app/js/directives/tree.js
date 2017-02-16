four51.app.directive('categorytree', function() {
	var obj = {
		restrict: 'E',
		replace: true,
		scope: {
			tree: '=',
            current: '='
		},
		templateUrl: 'partials/categoryTree.html'
	};
	return obj;
});

four51.app.directive('node', ['$compile', function($compile) {
	var obj = {
		restrict: 'E',
		replace: true,
		scope: {
			node: '=',
            current: '='
		},
		template: '<li class="451_cat_item dropdownColor" ng-class="{\'active\':  current.InteropID == node.InteropID}"><a ng-href="catalog/{{node.InteropID}}" ng-bind-html="node.Name"class="dropdownColor"></a></li>',
		link: function(scope, element) {
			if (angular.isArray(scope.node.SubCategories)) {
			    //replace SubCategories with Categories for truncated list
				element.append("<categorytree class='colorControl' tree='node.SubCategories' current='current'/>");
				$compile(element.contents())(scope);
			}
		}
	};
	return obj;
}]);
