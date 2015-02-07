var slaskIT = angular.module("slaskIT", []);

slaskIT.constant("PIPE_URL", "https://pipes.yahoo.com/pipes/pipe.run?_id=328d9ea8b0d9dba60535103a6c3a532d&_render=json&days=365");

slaskIT.controller("EventsController", function ($scope, $http, PIPE_URL) {
    $scope.dayMatcher = function (day) {
        return function (event) {
            var date = event["y:published"];

            return date.year === day.year
                && date.month === day.month
                && date.day === day.day;
        };
    };

    $scope.mapUrl = function (event) {
        var place = [event.Adres, event.Miasto].join(", ");

        return "https://www.google.pl/maps/place/" + encodeURIComponent(place);
    };

    $scope.fetch = function () {
        $http.get(PIPE_URL).then(function (response) {
            $scope.loaded = true;
            $scope.days = [];
            $scope.events = response.data.value.items;

            $scope.events.forEach(function (event) {
                var lastDay = $scope.days[$scope.days.length - 1],
                    date = event["y:published"];

                if (!lastDay
                    || lastDay.year  !== date.year
                    || lastDay.month !== date.month
                    || lastDay.day   !== date.day) {

                    $scope.days.push({
                        year: date.year,
                        month: date.month,
                        day: date.day,
                        event: event
                    });
                }
            });
        });
    };

    $scope.fetch();
});
