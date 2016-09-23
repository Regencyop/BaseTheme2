four51.app.config(['$locationProvider', function($locationProvider) {
    $locationProvider.html5Mode(false);
}]);

four51.app.config(['$provide', function($provide) {
    $provide.decorator('$exceptionHandler', ['$delegate', '$injector', function($delegate, $injector) {
        return function $broadcastingExceptionHandler(ex, cause) {
            ex.status != 500 ?
	            $delegate(ex, cause) :
	            (function() {
			        try {
				        trackJs.error("API: " + JSON.stringify(ex));
			        }
			        catch (x) {
				        if ((JSON.stringify(ex).indexOf("Inactive Product")) && (document.getElementsByClassName("errorLogContainterEmpty").length !== 0)) {
//				            $( "<p>Test</p>" ).insertAfter( ".inner" );

				            document.getElementsByClassName("errorLogContainterEmpty")[0].className = "errorLogContainterError";
				            var newErrorMessage = document.createElement('p');
                            newErrorMessage.appendChild(document.createTextNode('This size currently out of stock.'));
                            document.getElementsByClassName("errorLogContainterError")[0].appendChild(newErrorMessage);
                            //update here
				        }
                        if (document.getElementsByClassName("errorLogContainterEmpty").length === 0) {
			                console.log("does not exist");
			                $( "<div class='errorLogContainterError'><p>This size currently out of stock.</p></div>" ).insertAfter( "#451_btn_orderadd" );
			                
			                function deleteContainer(){
                              $( ".errorLogContainterError" ).remove();
                            }
                            setTimeout(deleteContainer, 3000);
			                
			            }
			        }
	            })();
	        $injector.get('$rootScope').$broadcast('exception', ex, cause);
        }
    }]);
}]);

four51.app.config(['datepickerConfig', 'datepickerPopupConfig', function(datepickerConfig, datepickerPopupConfig){
    datepickerConfig.showWeeks = false;
    datepickerPopupConfig.showButtonBar = false;
    datepickerPopupConfig.appendToBody = true;
}]);
