angular.module("MainController", []).controller("MainController", function($scope)
{
    // Set the title
    $scope.title = "Rover Interview Project - Home";
    
    // Select the correct item on the navbar.
    $scope.currentNavItem = "Home";
});