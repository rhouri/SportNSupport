/// <reference path="../views/addOffer.html" />
/// <reference path="../views/addOffer.html" />
'use strict';

app.controller('homeController', ['$scope', '$location', function ($scope, $location) {
    $scope.home = true;
    $scope.login = function () {
        $location.path('/login');
    }

    $scope.register = function () {
        $location.path('/signup');
    }
}]);




app.controller('addOfferController', ['$scope', 'SNSGetData', 'appData', 'authService', '$timeout', '$location', '$filter',
    function ($scope, SNSGetData, appData, authService, $timeout, $location, $filter) {

        $scope.appData = appData;
        $scope.addingOffers = false;
        $scope.addingRequests = false;
        $scope.SNSForms = {};
        $scope.appData = appData;

        $scope.notOffered = function (input) {
            return !input.Offered;
        };

        $scope.offered = function (input) {
            return input.Offered;
        };

        $scope.notRequested = function (input) {
            return !input.Requested;
        };

        $scope.Requested = function (input) {
            return input.Requested;
        };


        $scope.exit = function () {
            appData.Student.StudentOffers = [];
            appData.Subjects.forEach(function (s) {
                if (s.Offered)
                    appData.Student.StudentOffers.push({ StudentID: appData.Student.ID, SubjectID: s.ID });
            });

            appData.Student.StudentRequests = [];
            appData.Subjects.forEach(function (s) {
                if (s.Requested)
                    appData.Student.StudentRequests.push({ StudentID: appData.Student.ID, SubjectID: s.ID });
            });


            SNSGetData.save({ Model: 'Model', Action: 'SaveStudent', Param: '1' }, appData.Student,
                              function (bundle) {
                                  $location.path('/dashboard');
                              },
                              function (reason) {
                                  alert('Error :<br/>' + reason);
                              });


        }

    }]);


app.controller('dashboardController', ['$scope', 'SNSGetData', 'appData', 'authService', '$timeout', '$location', '$filter', '$mdDialog',
    function ($scope, SNSGetData, appData, authService, $timeout, $location, $filter, $mdDialog) {
        $scope.addingOffers = false;
        $scope.addingRequests = false;
        $scope.SNSForms = {};
        $scope.appData = appData;

        $scope.offered = function (input) {
            if (input.Offered)
                return true;
            else
                return false;
        };

        $scope.requested = function (input) {
            if (input.Requested)
                return true;
            else
                return false;
        };


        $scope.addOffer = function () {
            $location.path('/addOffer');
        }

        $scope.addRequest = function () {
            $location.path('/addRequest');
        }

        $scope.fixSubjects = function () {
            appData.Student.StudentOffers.forEach(function (s) {
                var s1 = $filter('getById')(appData.Subjects, s.SubjectID);
                s1.Offered = true;
            });
            appData.Student.StudentRequests.forEach(function (s) {
                var s1 = $filter('getById')(appData.Subjects, s.SubjectID);
                s1.Requested = true;
            });
        }

        $scope.fixSubjects();

        $scope.refreshMatches = function () {

            SNSGetData.query({ Model: 'Model', Action: 'GetMatches', Param: '1' },
                       function (bundle) {
                           appData.Subjects = bundle;
                           $scope.fixSubjects();
                       },
                      function (reason) {
                          alert('Error :<br/>' + reason);
                      });
        }

        $scope.saveChanges = function () {
            appData.Student.StudentOffers = [];
            appData.Subjects.forEach(function (s) {
                if (s.Offered)
                    appData.Student.StudentOffers.push({ StudentID: appData.Student.ID, SubjectID: s.ID });
            });

            appData.Student.StudentRequests = [];
            appData.Subjects.forEach(function (s) {
                if (s.Requested)
                    appData.Student.StudentRequests.push({ StudentID: appData.Student.ID, SubjectID: s.ID });
            });

            SNSGetData.save({ Model: 'Model', Action: 'SaveStudent', Param: '1' }, appData.Student,
                          function (bundle) {

                              $scope.SNSForms.frmOffers.$setPristine();

                          },
                          function (reason) {
                              alert('Error saving Data');
                          });


        }



        $scope.showMatch = function (sub, p) {

            SNSGetData.save({ Model: 'Model', Action: 'GetMatchData', Param: p }, sub,
                             function (bundle) {
                                 $scope.matchStudents = bundle.List;
                                 $scope.title = ((p == 2) ? 'Available Tutors for ' : 'Students requesting help with ') + sub.SubjectName;
                                 $mdDialog.show({
                                     controller: DialogController,
                                     templateUrl: 'app/views/showMatch.html',
                                     parent: angular.element(document.body),
                                     scope: $scope.$new(),
                                     //targetEvent: ev,
                                     clickOutsideToClose: true,
                                     fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                                 }).then(
                                    function (answer) {
                                        $scope.status = 'You said the information was "' + answer + '".';
                                    }
                                  , function () {
                                      $scope.status = 'You cancelled the dialog.';
                                  });
                             },
                             function (reason) {
                                 alert('Error saving Data');
                             });






        };

        function DialogController($scope, $mdDialog) {
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
            $scope.answer = function (answer) {
                $mdDialog.hide(answer);
            };
        }


    }]);

app.controller('indexController', ['$scope', '$location', 'authService', 'appData', function ($scope, $location, authService, appData) {

    $scope.appData = appData;
    appData.showSpinner = false;
    $scope.logOut = function () {
        authService.logOut();
        $location.path('/home');
    }
    $scope.login = function () {
        $location.path('/login');
    }

    $scope.register = function () {
        $location.path('/signup');
    }



    $scope.settings = function () {
        $location.path('/settings');
    }

    $scope.authentication = authService.authentication;
    $scope.spinnerVisible = function () {
        return appData.triggerSpinner && appData.showSpinner;
    }

    $scope.$on('$routeChangeSuccess', function () {

        $scope.home = $location.path() == '/home';
    }
    );


}]);





app.controller('loginController', ['$scope', '$location', 'authService', 'ngAuthSettings', 'SNSGetData', 'appData', '$injector',
function ($scope, $location, authService, ngAuthSettings, SNSGetData, appData, $injector
    ) {

    $scope.SNSForms = {};

    var $validationProvider = $injector.get('$validation');

    $scope.checkFormValid = function () {
        var result = true;
        var form = $scope.SNSForms.Form; // find current form
        if (form)
            result = $validationProvider.checkValid(form);
        return result
    }





    $scope.loginData = {
        UserName: "",
        Password: "",
        useRefreshTokens: false
    };

    $scope.message = "";
    $scope.login = function () {
        authService.login($scope.loginData).then(
            function (response) {
                SNSGetData.get({ Model: 'Model', Action: 'GetData', Param: '1' },
                    function (bundle) {
                        appData.user = bundle.user;
                        appData.Student = bundle.student;
                        appData.SubjectCategories = bundle.categories;
                        appData.Subjects = bundle.subjects;
                        appData.School = bundle.school;
                        appData.Teams = bundle.teams;
                        $scope.dataLoaded = true;
                        $location.path('/dashboard');
                    },
                    function (reason) {
                        alert('Error :<br/>' + reason);
                    });
            },
         function (err) {
             $scope.message = 'Error Logging You In.Try Again.';
         });
    };
}]);








app.controller('signupController', [
    '$q',
    '$http',
    '$scope',
    '$location',
    '$timeout',
    'SNSGetData',
    'appData',
    '$injector',
function (
    $q,
    $http,
    $scope,
    $location,
    $timeout,
    SNSGetData,
    appData,
    $injector


    ) {

    $scope.SNSForms = {};

    var $validationProvider = $injector.get('$validation');

    $scope.userModel = appData.userModel;

    $scope.savedSuccessfully = false;
    $scope.message = "";
    $scope.dataLoaded = true;

    $scope.checkFormValid = function () {
        var result = true;
        var form = $scope.SNSForms.Form; // find current form
        if (form)
            result = $validationProvider.checkValid(form);
        return result
    }



    // validation of user id fro user userModel. 
    // will fail id user already exists
    $scope.checkUserID = function (strValue, pp) {
        var deferred = $q.defer();
        var req = {
            url: serviceBase + 'api/Model/' + pp[1],
            method: "GET",
            params: {
                Param: strValue
            }
        }

        var responsePromise =
        $http(req).success(function (data, status, headers, config) {
            deferred.resolve({
                isValid: !data, message: pp[2]
            });
        })
        .error(function (data, status, headers, config) {
            alert('Error Checking User');
        });

        return deferred.promise;
    };







    $scope.signUp = function () {
        $location.path('/selSchool');
    };



}]);

app.controller('selSchoolController',
    ['$scope', 'SNSGetData', 'appData', '$location',
    function ($scope, SNSGetData, appData, $location) {

        $scope.schoolList = []
        $scope.dataLoaded = false;
        $scope.userModel = appData.userModel;

        SNSGetData.query({ Model: 'Model', Action: 'SchoolList', Param: '' },
                    function (bundle) {
                        appData.SchoolList = bundle;
                        appData.SchoolList.forEach(function (s) {
                            $scope.schoolList.push({ text: s.SchoolName, value: s.ID });
                        });
                        $scope.dataLoaded = true;

                    },
                    function (reason) {
                        alert('Error :<br/>' + reason);
                    }
               );
        $scope.go = function (item) {
            appData.SchoolList.forEach(function (s) {
                if (s.ID == item.value)
                    appData.userModel.SchoolID = s.ID;
            });

            $location.path('/selTeams');
        }
    }
    ]);


app.controller('settingsController',

    ['$scope', 'SNSGetData', 'appData', 'authService', '$timeout', '$location',
    function ($scope, SNSGetData, appData, authService, $timeout, $location) {


        appData.Teams.forEach(function (t) {
            t.Requested = false;
            appData.Student.StudentTeams.forEach(function (st) {
                if (st.TeamID == t.ID)
                    t.Requested = true;
            });
        });

        $scope.Teams = appData.Teams;

        $scope.dataLoaded = false;

        $scope.notRequested = function (input) {
            return !input.Requested;
        };

        $scope.Requested = function (input) {
            return input.Requested;
        };

        $scope.go = function () {
            appData.Student.StudentTeams = [];
            appData.Teams.forEach(function (t) {
                if (t.Requested)
                    appData.Student.StudentTeams.push({ StudentID: appData.Student.ID, TeamID: t.ID });
            });

            SNSGetData.save({ Model: 'Model', Action: 'SaveStudent', Param: '1' }, appData.Student,
                                  function (bundle) {
                                         $location.path('/dashboard');
                                  },
                                  function (reason) {
                                      alert('Error :<br/>' + reason);
                                  });
        };

        var startTimer = function () {
            var timer = $timeout(function () {
                $timeout.cancel(timer);
                $location.path('/login');
            }, 2000);
        }
    }
    ]);


app.controller('selTeamsController',

    ['$scope', 'SNSGetData', 'appData', 'authService', '$timeout', '$location',
    function ($scope, SNSGetData, appData, authService, $timeout, $location) {

        $scope.teamList = [];
        $scope.dataLoaded = false;
        $scope.userModel = appData.userModel;


        $scope.notRequested = function (input) {
            return !input.Requested;
        };

        $scope.Requested = function (input) {
            return input.Requested;
        };

        SNSGetData.query({ Model: 'Model', Action: 'SchoolTeamsList', Param: appData.userModel.SchoolID },
                    function (bundle) {
                        appData.Teams = bundle;
                        $scope.teamList = bundle;
                        $scope.dataLoaded = true;
                    },
                    function (reason) {
                        alert('Error :<br/>' + reason);
                    }
               );

        $scope.go = function () {

            appData.Teams.forEach(function (t) {
                if (t.Requested)
                    appData.userModel.Teams.push(t);

            });

            authService.saveRegistration(appData.userModel).then(function (response) {
                $scope.savedSuccessfully = true;
                $scope.message = "Success, you will be redicted to login page in 2 seconds.";
                startTimer();

            },
             function (response) {
                 $scope.message = "An error occured:" + response.statusText;
             });
        };

        var startTimer = function () {
            var timer = $timeout(function () {
                $timeout.cancel(timer);
                $location.path('/login');
            }, 2000);
        }
    }
    ]);





