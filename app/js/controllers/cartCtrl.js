four51.app.controller('CartViewCtrl', ['$scope', '$routeParams', '$location', '$451', 'Order', 'OrderConfig', 'User', 'Punchout', '$sce', '$timeout', '$window',
function ($scope, $routeParams, $location, $451, Order, OrderConfig, User, Punchout, $sce, $timeout, $window) {

//update this for the items to achieve a minimum total order

    var itemProdIds = ['BEENV2C','BE_Spine/Cover'];
    $scope.setMinimum = 4;
    var minimumTotal = 0;    
    
	if($scope.PunchoutSession.PunchoutOperation != "Inspect")

//  **** Do not adjust the line below unless it is already a LIVE PUNCHOUT site, there is no other need to adjust it
//  This must absolutely be set to $scope.PunchoutSession = Punchout.punchoutSession; 
//  in order for the site to function correctly when live ****
//  If it is a 1.0 or new site, you can test the 2.0 site via the user/vibenet login without these overrides
		$scope.punchouturl = $sce.trustAsResourceUrl(Punchout.punchoutSession.PunchOutPostURL);
	$scope.submitPunchoutOrder = function(){
		$scope.saveChanges(function(data){
		Punchout.getForm(function(form){
			$scope.punchoutForm = form;
			$timeout(function(){
				$window.document.getElementById('punchoutForm').submit();
			}, 10);
		}, function(err){})
		}, true);
	}
	var isEditforApproval = $routeParams.id != null && $scope.user.Permissions.contains('EditApprovalOrder');
	if (isEditforApproval) {
		Order.get($routeParams.id, function(order) {
			$scope.currentOrder = order;
			// add cost center if it doesn't exists for the approving user
			var exists = false;
			angular.forEach(order.LineItems, function(li) {
				angular.forEach($scope.user.CostCenters, function(cc) {
					if (exists) return;
					exists = cc == li.CostCenter;
				});
				if (!exists) {
					$scope.user.CostCenters.push({
						'Name': li.CostCenter
					});
				}
			});
		});
	}

	$scope.currentDate = new Date();
	$scope.errorMessage = null;
	$scope.continueShopping = function() {
		if (!$scope.cart.$invalid) {
			if (confirm('Do you want to save changes to your order before continuing?') == true)
				$scope.saveChanges(function() { $location.path('catalog') });
		}
		else
			$location.path('catalog');
	};

	$scope.cancelOrder = function() {
		if (confirm('Are you sure you wish to cancel your order?') == true) {
			$scope.displayLoadingIndicator = true;
			$scope.actionMessage = null;
			Order.delete($scope.currentOrder,
				function(){
					$scope.currentOrder = null;
					$scope.user.CurrentOrderID = null;
					User.save($scope.user, function(){
						$location.path('catalog');
					});
					$scope.displayLoadingIndicator = false;
					$scope.actionMessage = 'Your order has been canceled';
				},
				function(ex) {
					$scope.actionMessage = 'An error occurred: ' + ex.Message;
					$scope.displayLoadingIndicator = false;
				}
			);
		}
	};

	$scope.saveChanges = function(callback, disableComplete) {
		$scope.actionMessage = null;
		$scope.errorMessage = null;
		if($scope.currentOrder.LineItems.length == $451.filter($scope.currentOrder.LineItems, {Property:'Selected', Value: true}).length) {
			$scope.cancelOrder();
		}
		else {
			$scope.displayLoadingIndicator = true;
			OrderConfig.address($scope.currentOrder, $scope.user);
			Order.save($scope.currentOrder,
				function(data) {
					$scope.currentOrder = data;
					if (callback) callback();
					if(disableComplete) return;
					$scope.displayLoadingIndicator = false;
					$scope.actionMessage = 'Your order is being submitted!';
				},
				function(ex) {
					$scope.errorMessage = ex.Message;
					$scope.displayLoadingIndicator = false;
				}
			);
		}
	};
	
	//Save Shopping and continue
	$scope.saveAndContinueShopping = function(callback, disableComplete) {
		$scope.actionMessage = null;
		$scope.errorMessage = null;
		Order.save($scope.currentOrder,
			function(ex) {
				$scope.displayLoadingIndicator = false;
				//Save cart and continue to catalog
				$location.path('catalog');
			}
		);
	};

	$scope.removeItem = function(item) {
		if (confirm('Are you sure you wish to remove this item from your cart?') == true) {
			Order.deletelineitem($scope.currentOrder.ID, item.ID,
				function(order) {
					$scope.currentOrder = order;
					minimumTotal = 0;
					Order.clearshipping($scope.currentOrder);
					if (!order) {
						$scope.user.CurrentOrderID = null;
						User.save($scope.user, function(){
							$location.path('catalog');
						});
					}
					$scope.displayLoadingIndicator = false;
					$scope.actionMessage = 'Your Changes Have Been Saved';
				},
				function (ex) {
					$scope.errorMessage = ex.Message.replace(/\<<Approval Page>>/g, 'Approval Page');
					$scope.displayLoadingIndicator = false;
				}
			);
		}
	}

	$scope.checkOut = function() {
		$scope.displayLoadingIndicator = true;
		if (!isEditforApproval)
			OrderConfig.address($scope.currentOrder, $scope.user);
		Order.save($scope.currentOrder,
			function(data) {
				$scope.currentOrder = data;
				$location.path(isEditforApproval ? 'checkout/' + $routeParams.id : 'checkout');
				$scope.displayLoadingIndicator = false;
			},
			function(ex) {
				$scope.errorMessage = ex.Message;
				$scope.displayLoadingIndicator = false;
			}
		);
	};

	$scope.$watch('currentOrder.LineItems', function(newval) {
		var newTotal = 0;
		$scope.itemOptions = '';
		if (!$scope.currentOrder) return newTotal;
		angular.forEach($scope.currentOrder.LineItems, function(item){
			newTotal += item.LineTotal;
		});
        var totalQuantity = 0;
        var itemCombo1 = {itemProdIds : {
                                currentQuantity:0,
                                itemName:''
        }};
        angular.forEach($scope.currentOrder.LineItems, function(item){
            itemCombo1.itemProdIds.currentQuantity = item.Quantity;
            	var checkItems;
            	for (i = 0; i < itemProdIds.length; i++) { 
                    checkItems = itemProdIds[i];
            	    console.log(checkItems);
    	            if (item.Product.ExternalID.indexOf(checkItems) !== -1) {
                		totalQuantity = totalQuantity + itemCombo1.itemProdIds.currentQuantity;
                		$scope.currentQuantityTotal=totalQuantity;
                		itemCombo1.itemProdIds.itemName = item.Product.Name;
                		$scope.itemOptions += itemCombo1.itemProdIds.itemName + ' | ';
                		minimumTotal = $scope.setMinimum;
                		$scope.additionalItems = minimumTotal - totalQuantity;
                	}
                	if(totalQuantity < minimumTotal) {
            			$scope.minimumMet = true;
                	}
                	if(totalQuantity >= minimumTotal) {
                	    $scope.minimumMet = false;
                	}
            	}
        });
		
		$scope.currentOrder.Subtotal = newTotal;
	}, true);

	$scope.copyAddressToAll = function() {
		angular.forEach($scope.currentOrder.LineItems, function(n) {
			n.DateNeeded = $scope.currentOrder.LineItems[0].DateNeeded;
		});
	};

	$scope.copyCostCenterToAll = function() {
		angular.forEach($scope.currentOrder.LineItems, function(n) {
			n.CostCenter = $scope.currentOrder.LineItems[0].CostCenter;
		});
	};

	$scope.onPrint = function()  {
		window.print();
	};

	$scope.cancelEdit = function() {
		$location.path('order');
	};
}]);
