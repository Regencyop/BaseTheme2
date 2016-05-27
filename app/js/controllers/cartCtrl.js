four51.app.controller('CartViewCtrl', ['$scope', '$routeParams', '$location', '$451', 'Order', 'OrderConfig', 'User', 'Punchout', '$sce', '$timeout', '$window',
function ($scope, $routeParams, $location, $451, Order, OrderConfig, User, Punchout, $sce, $timeout, $window) {
    //var declarations
    var Base64;
    var decodedString;
    var productImagePosition;
    var weightPosition;
    var newStrings;
    var updatedString;
    var encodedXMLString;
    var updatedXML;
    var itemProdIds;
    var minimumTotal;
    var string;
    var itemLines;
    var inc;
    var shippingWeight;
    var idOfProduct;
    var lineItemString;
    var finalizedString = '';
    var productInformation = {};
    //$scope.LineItem.Specs.Weight.Value = data.product.ShipWeight;

//update this for the items to achieve a minimum total order
//  var itemProdIds = {array1 : {'item1','item2'}, array2 : {'item1', 'item2'}, item3 : 'item'};    
    itemProdIds = ['item1', 'item2'];
    $scope.setMinimum = 24;
    minimumTotal = 0;
    itemLines = $scope.currentOrder.LineItems;
    
	if($scope.PunchoutSession.PunchoutOperation != "Inspect")
//  **** Do not adjust the line below unless it is already a LIVE PUNCHOUT site, there is no other need to adjust it
//  This must absolutely be set to $scope.PunchoutSession = Punchout.punchoutSession; 
//  in order for the site to function correctly when live ****
//  If it is a 1.0 or new site, you can test the 2.0 site via the user/vibenet login without these overrides
    $scope.punchouturl = $sce.trustAsResourceUrl(Punchout.punchoutSession.PunchOutPostURL);
	$scope.submitPunchoutOrder = function(){
		//begin XML manipulation
		$scope.saveChanges(function(data){
		Punchout.getForm(function(form){
			$scope.punchoutForm = form;
			$timeout(function(){
			    string = $window.document.getElementById('punchoutForm').getElementsByTagName('input')[0].getAttribute('value');
                //decode from scotch.io
                Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
                    encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},
                    decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}
                // decode and store as decodedString
                decodedString = Base64.decode(string);
                lineItemString = decodedString.split('</ItemDetail>');
                for (increment = 0; increment < lineItemString.length-1; increment++) {
                    idOfProduct = $scope.currentOrder.LineItems[increment].Product.ExternalID;
                    imageURL = $scope.currentOrder.LineItems[increment].Product.LargeImageUrl;
                    shippingWeight = $scope.currentOrder.LineItems[increment].Product.ShipWeight;
                    productInformation[idOfProduct] = { itemWeight : shippingWeight, thalerusURL : imageURL};
                    // update and-or add pieces
                            if (lineItemString[increment].indexOf("ProductImage") === -1) {
                                newStrings = lineItemString[increment].split('<Extrinsic name="ProductSpecs">');
                                console.log('before | ' + newStrings);
                                updatedString = newStrings[0] + '<Extrinsic name="ProductSpecs"><Extrinsic name="ProductImage">' + imageURL + '</Extrinsic>' + newStrings[1];
                                newStrings = lineItemString[increment] = updatedString;
                            }
                            else {
                                newStrings = lineItemString[increment].split('<Extrinsic name="ProductSpecs">');
                                newStrings[1] = newStrings[1].substring(newStrings[1].indexOf("</Extrinsic>") );
                                updatedString = newStrings[0] + '<Extrinsic name="ProductImage">' + imageURL + newStrings[1];
                            }
                            if (lineItemString[increment].indexOf("Weight") === -1) {
                                newStrings = lineItemString[increment].split('<Extrinsic name="ProductSpecs">');
                                updatedString = newStrings[0] + '<Extrinsic name="ProductSpecs"><Extrinsic name="Weight">' + shippingWeight + '</Extrinsic>' + newStrings[1];
                                newStrings = lineItemString[increment] = updatedString;
                            } 
                            else {
                                newStrings = lineItemString[increment].split('<Extrinsic name="Weight">');
                                newStrings[1] = newStrings[1].substring(newStrings[1].indexOf("</Extrinsic>") );
                                updatedString = newStrings[0] + '<Extrinsic name="Weight">' + shippingWeight + newStrings[1];
                            }
                        finalizedString += updatedString + '</ItemDetail>';
                }    
                //add final object to cXML String
                finalizedString += lineItemString[lineItemString.length-1];
                console.log(finalizedString);
                encodedcXMLString = Base64.encode(finalizedString);
                $window.document.getElementById('punchoutForm').getElementsByTagName('input')[0].setAttribute('value', encodedcXMLString);
                updatedXML = $window.document.getElementById('punchoutForm');
                updatedXML.submit();
                //endXMLManipulation
			}, 10);
		}, function(err){})
		}, true);
	}
	var isEditforApproval = $routeParams.id !== null && $scope.user.Permissions.contains('EditApprovalOrder');
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
			if (confirm('Do you want to save changes to your order before continuing?') === true)
				$scope.saveChanges(function() { $location.path('catalog') });
		}
		else
			$location.path('catalog');
	};

	$scope.cancelOrder = function() {
		if (confirm('Are you sure you wish to cancel your order?') === true) {
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
		if (confirm('Are you sure you wish to remove this item from your cart?') === true) {
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
