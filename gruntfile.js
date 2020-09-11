module.exports = function(grunt)
{
    grunt.initConfig(
    {
        // TODO: Look into implementing JsHint and uglify, they seem cool.
        
        // JsHint checks JavaScript files for errors and code smells. Might want to implement soon.
        //jshint: {
        //    all: ["public/client/**/*.js"]
        //},
    
        // Minifies all JavaScript files into app.min.js
        //uglify: {
        //    build: {
        //        files: {
        //            "public/dist/js/app.min.js": ["public/client/**/*.js", "public/client/*.js"]
        //        }
        //    }
        //},
        
        // Tell Grunt to watch our JS files and run JsHint and Uglify when they're altered.
        //watch: {
        //    js: {
        //        files: ["public/client/**/*.js"],
        //        tasks: ["jshint", "uglify"]
        //    }
        //},

        // Set up nodemon
        nodemon:
        {
            dev:
            {
                script: "./src/server.js"
            }
        },

        env:
        {
            development:
            {
                NODE_ENV: "development"
            },
            test:
            {
                NODE_ENV: "test"
            }
        },

        // Allows both nodemon and watch to run at the same time.
        /*
        concurrent:
        {
            options:
            {
                logConcurrentOutput: true
            },
            //tasks: ["nodemon", "watch"]
        },
        */

        mocha:
        {
            options:
            {
                run: true,
                log: true,
                logErrors: true,
                // Currently disabling this because there *may* be an issue in mocha that causes an error on startup.
                growlOnSuccess: false
            },
            //src: ["Tests/**/*.js"]
            src: ["Tests/**/*.html"]
        },

        run:
        {
            loadTestData:
            {
                cmd: "node",
                args: ["./Utilities/loadData", "-s", "-f", "./Utilities/reviews.csv"]
            }
        }

    });

    // Load the packages that Grunt will be using.
    //grunt.loadNpmTasks("grunt-contrib-jshint");
    //grunt.loadNpmTasks("grunt-contrib-uglify");
    //grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-nodemon");
    grunt.loadNpmTasks("grunt-env");
    grunt.loadNpmTasks("grunt-concurrent");
    grunt.loadNpmTasks("grunt-mocha");
    grunt.loadNpmTasks("grunt-contrib-connect");
    grunt.loadNpmTasks("grunt-run");

    // Register the various tasks that Grunt needs to be able to run.
    //grunt.registerTask("default", ["jshint", "uglify", "concurrent"]);
    grunt.registerTask("default", ["env:development", "nodemon"]);

    grunt.registerTask("loadData", ["env:test", "run:loadTestData"]);

    // TODO: Fix this. I should be running everything through Grunt, but tests go through NPM right now.
    //grunt.registerTask("test", ["env:test", "mocha"]);
};