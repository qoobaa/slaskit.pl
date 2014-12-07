var slaskIT = angular.module("slaskIT", []);

slaskIT.constant("PIPE_URL", "https://pipes.yahoo.com/pipes/pipe.run?_id=328d9ea8b0d9dba60535103a6c3a532d&_render=json&days=365");

slaskIT.controller("EventsController", function ($scope, $http, PIPE_URL) {
    $scope.fetch = function () {
        $http.get(PIPE_URL).then(function (response) {
            $scope.loaded = true;
            $scope.events = response.data.value.items;
        });
    };

    $scope.fetch();
});
