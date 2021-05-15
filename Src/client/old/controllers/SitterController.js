angular.module("SitterController", ["SitterService"]).controller("SitterController", ["$scope", "$http", "Sitter", function($scope, $http, Sitter)
{
    // Select the correct item on the navbar.
    $scope.$parent.currentNavItem = "Sitter List";
    
    $scope.listAll = function()
    {
        Sitter.get().then(function(response)
        {
            $scope.sitters = response.data;
        });
    };

    $scope.search = function()
    {
        Sitter.search($scope.query).then(function(response)
        {
            $scope.sitters = response.data;
        });
    };
}]);