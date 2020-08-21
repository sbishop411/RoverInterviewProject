angular.module("SitterService", []).factory("Sitter", ["$http", function($http)
{
    return {
        get : function()
        {
            return $http.get("/api/sitters",
            {
                params: {}
            });
        },

        search : function(query)
        {
            if(typeof query.RatingsScore === "undefined" || query.RatingsScore === null)
            {
                query.RatingsScore = 0;
            }

            return $http.get("/api/sitters",
            {
                
                params: {RatingsScore: query.RatingsScore}
            });
            
        }

        // TODO: Implement more methods to allow sitters to be created and deleted.
        /*
        ,create : function(sitterData)
        {
            return $http.post("/api/sitters", sitterData);
        },

        delete : function(id)
        {
            return $http.delete("/api/sitters/" + id);
        }
        */
    }   
}]);