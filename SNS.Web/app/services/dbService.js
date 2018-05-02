'use strict';

app.factory('SNSGetData', ['$resource', function ($resource) {
    return $resource(serviceBase+'api/'
        + ':Model/:Action/:Param', { Model: '@model', Action: '@action', Param: '@param' }

        );
}]);

app.factory('appData', function(){
    var appData = {
        userModel : {
            UserName: "",
            Password: "",
            ConfirmPassword: "",
            LastName: "",
            FirstName: '',
            Grade:9,
            SchoolID: 2,
            Teams: []
            },





        SchoolList:[],
        TeamList: [],
        Subjects: [],
        Student: {},
        School: {}
    }



    return appData;
});