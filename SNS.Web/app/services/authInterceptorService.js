'use strict';
app.factory('authInterceptorService', ['$q', '$injector','$location', 'localStorageService','appData', function ($q, $injector,$location, localStorageService,appData) {

    var authInterceptorServiceFactory = {};

    var _request = function (config) {

        config.headers = config.headers || {};
       
        var authData = localStorageService.get('authorizationData');
        if (authData) {
            config.headers.Authorization = 'Bearer ' + authData.token;
       
        }

        return config;
    }

    var _responseError = function (rejection) {

        if (rejection.status === 401) {
            var authService = $injector.get('authService');
            var authData = localStorageService.get('authorizationData');

            if (authData) {
                if (authData.useRefreshTokens) {
                    $location.path('/refresh');
                    return $q.reject(rejection);
                }
            }
            authService.logOut();
            $location.path('/login');
        }
        return $q.reject(rejection);
    }





    authInterceptorServiceFactory.requestError = _responseError;
    authInterceptorServiceFactory.request = _request;

    return authInterceptorServiceFactory;
}]);








app.factory('httpInterceptorService', ['$q',   'appData', function ($q,  appData) {

    var httpInterceptorServiceFactory = {};

    var _request = function (config) {
            appData.triggerSpinner = true;
            setTimeout(function () {
                if(appData.triggerSpinner)
                    appData.showSpinner = true;
            }, 400);
        return config;
    }

    var _responseError = function (rejection) {
        appData.triggerSpinner = false;
        return $q.reject(rejection);
    }

    var _requestError = function (rejection) {
        appData.triggerSpinner = false;
        return $q.reject(rejection);
    };

    // optional method
    var _response = function (response) {
        appData.triggerSpinner = false;
        return response;
    };




   httpInterceptorServiceFactory.response = _response;
   httpInterceptorServiceFactory.requestError = _requestError;
   httpInterceptorServiceFactory.request = _request;
   httpInterceptorServiceFactory.responseError = _responseError;

    return httpInterceptorServiceFactory;
}]);

