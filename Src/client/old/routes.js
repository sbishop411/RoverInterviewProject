angular.module("routes", []).config(["$routeProvider", "$locationProvider", function($routeProvider, $locationProvider)
{
    $locationProvider.html5Mode(true);

    $routeProvider
        .when("/", {
            templateUrl: "/client/views/home.html",
            controller: "MainController"
        }).when("/sitters", {
            templateUrl: "/client/views/sitters.html",
            controller: "SitterController"
        }).otherwise({
            redirectTo: "/"
        });
}]);