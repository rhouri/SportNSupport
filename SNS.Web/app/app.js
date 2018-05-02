
(function ($) {
    $.isBlank = function (obj) {
        return (!obj || $.trim(obj) === "");
    };
})(jQuery);



var app = angular.module('SNSApp', [
    'ngRoute',
    'ngResource',
    'ngMaterial',
    'LocalStorageModule',
    //'angular-loading-bar',
    'ngDropdowns',
    'multipleSelect',
    'validation',
    'validation.rule'


]);


app.config(['$validationProvider', function ($validationProvider) {
    // Setup `ip` validation
    var expression = {
        ip: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    };

    var validMsg = {
        ip: {
            error: 'This isn\'t an ip address',
            success: ''
        }
    };

    $validationProvider.setExpression(expression) // set expression
                      .setDefaultMsg(validMsg); // set valid message

    $validationProvider.setValidMethod('blur');
}]);





app.config(function ($routeProvider) {

    $routeProvider.when("/home", {
        controller: "homeController",
        templateUrl: "/app/views/home.html",
        css: 'content/css/LandingPage.css'

    });

    $routeProvider.when("/login", {
        controller: "loginController",
        templateUrl: "/app/views/login.html"
    });

    $routeProvider.when("/signup", {
        controller: "signupController",
        templateUrl: "/app/views/signup.html"
    });

    $routeProvider.when("/dashboard", {
        controller: "dashboardController",
        templateUrl: "/app/views/dashboard.html"
    });


    $routeProvider.when("/selSchool", {
        controller: "selSchoolController",
        templateUrl: "/app/views/selSchool.html"
    });


    $routeProvider.when("/selTeams", {
        controller: "selTeamsController",
        templateUrl: "/app/views/selTeams.html"
    });


    $routeProvider.when("/addOffer", {
        controller: "addOfferController",
        templateUrl: "/app/views/addOffer.html"
    });


    $routeProvider.when("/addRequest", {
        controller: "addOfferController",
        templateUrl: "/app/views/addRequest.html"
    });


    $routeProvider.when("/settings", {
        controller: "settingsController",
        templateUrl: "/app/views/settings.html"
    });



    $routeProvider.otherwise({ redirectTo: "/home" });
});

//var serviceBase = 'http://localhost:26264/';
var serviceBase = 'http://snswebapi.azurewebsites.net/';

app.constant('ngAuthSettings', {
    apiServiceBaseUri: serviceBase,
    clientId: 'ngAuthApp'
});

app.config(function ($httpProvider) {
    $httpProvider.interceptors.push('httpInterceptorService');
    $httpProvider.interceptors.push('authInterceptorService');
});

app.run(['authService', function (authService) {
    authService.logOut();
    //authService.fillAuthData();
}]);


app.filter('getById', function () {
    return function (input, id) {
        var i = 0, len = input.length;
        for (; i < len; i++) {
            if (input[i].ID == id) {
                return input[i];
            }
        }
        return null;
    }
});

app.config(function ($mdThemingProvider) {

 

    $mdThemingProvider.theme('default')
         .primaryPalette('blue'

           , {
                'default': '900', 
                'hue-1': '300', 
                'hue-2': '500', 
                'hue-3': '700'  
            })


         .accentPalette('teal', {
             'default': '800',  
             'hue-1': '300',
             'hue-2': '500', 
             'hue-3': '700' 
         })



         .warnPalette('deep-orange');

    $mdThemingProvider.theme('Green')
      .primaryPalette('green')
      .accentPalette('orange')
      .warnPalette('red');


    $mdThemingProvider.theme('Teal')
  .primaryPalette('teal')
  .accentPalette('orange')
    .warnPalette('red');
});