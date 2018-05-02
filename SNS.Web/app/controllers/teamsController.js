'use strict';
app.controller('teamsController', 
    ['$scope', 'SNSGetData','appData', 
    function ($scope, SNSGetData,appData) 
        {
        SNSGetData.query({ Model: 'Model', Action: 'TeamsList', Param: '' },
                    function (bundle) {
                        appData.Teams=bundle;
                        },
                    function (reason) {
                        alert('Error :<br/>'+reason);
                    }
               );

    }
]);