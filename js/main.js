var slaskIT = angular.module("slaskIT", []);

slaskIT.constant("PIPE_URL", "https://pipes.yahoo.com/pipes/pipe.run?_id=328d9ea8b0d9dba60535103a6c3a532d&_render=json");

slaskIT.controller("EventsController", function ($scope, $http, PIPE_URL) {
    $scope.fetch = function (days) {
        $http.get(PIPE_URL + "&days=" + days).then(function (response) {
            $scope.days = days;
            $scope.loaded = true;
            $scope.events = response.data.value.items;
        });
    };

    $scope.fetch(7);
});
