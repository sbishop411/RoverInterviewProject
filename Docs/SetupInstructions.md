# Setup Instructions
You can following the following process to get, install, configure, and run the application that I've developed for this interview. Most of these instructions are written with a Windows environment in mind, but should translate to other platforms fairly well. If you have any questions about how to properly set up the application, please feel free to contact me!

If you'd like any insight into some of my decision making processes, please feel free to check out the DecisionLog.md markdown file. It contains several decision logs that I kept on important decisions I made during the project, along with some retrospective insights on each decision.

## 1. Install git
First, you'll need to install git, if you don't already have it. You can download git <a href="https://git-scm.com/downloads">here</a>.

## 2. Clone the interview-sbishop411 Repository
Once git is installed, it can be used to obtain a local copy of this repository. You can either use your favorite branch manager application for this, or run the following command in the directory in which you'd like to clone the repository:
```
git clone https://github.com/roverjobs/interview-sbishop411
```

## 3. Install Node.js
Next, you'll need to install the Node.js runtime if you don't already have it. You must be using version 7.6 or later. Node.js can be downloaded <a href="https://nodejs.org/en/download/">here</a>. Once you've downloaded and installed Node.js, you can verify that it's working with the following command:
```
node -v
```

*Note:* You may need to add entries to your PATH system variable before you can run "node" commands.

## 4. Install npm (Node Package Manager)
Next, you'll need to get npm. Fortunately, it comes bundled with most versions of Node.js, so you should already have it! You can check by running the following command:
```
npm -v
```
 
You should be using version 3.X or later for this application. If you don't have npm, it can be downloaded <a href="https://www.npmjs.com/get-npm">here</a>.

*Note:* You may need to add entries to your PATH system variable before you can run "npm" commands.

## 5. Install MongoDB
Next you'll need to install MongoDb, a popular NoSQL database. MongoDB can be downloaded <a href="https://www.mongodb.com/download-center">here</a>. Click on the "Community Server" tab, select the appropriate environment, and follow the instructions to install MongoDB.

There are two important commands that you'll need to know for MongoDB. The first is:
```
mongod
```
This command starts up the MongoDB server. You'll use it to run MongoDB so it's ready to receive instruction and store data. It may be a good idea to create a system service to run this command on startup so MongoDB is always available. The second important command is:
```
mongo
```
This command runs the MongoDB client shell. You can use this shell to run various commands against MongoDB.

*Note:* In Windows environments, you may want to double-check that the path to MongoDB's executables was added to your system's PATH variable. The default installation path for MongoDB is "C:\ProgramFiles\MongoDB\Server\&lt;version number>\".

## 6. Configure MongoDB
Once MongoDB is installed, it requires a bit of additional setup before the application can use it.

First, MongoDB needs to a place to store all that data. The default path on Windows devices is "C:\db\data". You can change where MongoDB stores its data by passing the --dbpath parameter when running the "mongod" command. While the exact location of the data isn't important for the application, I use the following command to run MongoDB, which you'll need to do before the application can run:
```
mongod --dbpath C:\Development\Data\MongoDB
```

## 7. Set up MongoDB environment
Now that MongoDB is installed and running, we'll run a script with mongo to configure the database for use with the website. Run the following command from the root directory of the repository:
```
mongo ./Utilities/configureMongoDb.js
```

This script does thw following:
* Creates the primary database, "RoverInterviewProject"
* Creates the test database, "RoverInterviewProjectTest"
* Creates a "Sitters", "Owners", and "Stays" collection in both databases.

## 7. Install Node.js Packages
Next, we'll want to install the Node.js packages that the website depends on, which are defined in the package.json file. These can be installed by running the following command in the root directory of the repository:
```
npm install
```

## 8. Install Bower globally
Some of the packages that we're dependent on need to be publicly exposed, and are managed by a separate package manager - Bower. The previous step /does/ retrieve and install bower, but only for our repository. It's probably a good idea to download and install Bower globally. Fortunately, npm can help! Just run the following command to be able to run Bower from anywhere:
```
npm install bower -g
```

## 9. Install front-end packages
Some of the packages that we're dependent on need to be publicly exposed, and are managed by a separate package manager - Bower. Fortunately, npm has already downloaded and installed it for us. Just run the following command in the root directory of the repository:
```
bower install
```

## 10. (Optional) Run Automated Tests
A suite of automated tests has been included in this repository, which are built on the <a href="https://mochajs.org/">Mocha</a> testing framework and <a href="http://chaijs.com/">Chai</a> assertion library. This configuration and execution of this test suite is currently done using an npm script (this will likely move to Grunt in the future). You can run the automated test suite with the following command:
```
npm test
```

*Note:* If you attempt to run the test suite while the application server is running, it's likely that you'll encounter an error in Mocha due to Mocha attempting to listen no a port that's already bound to (8080).
*Note:* As is, the test suite will hang once it's done executing tests. Just press Ctrl+C to exit.

## 11. Install Grunt globally
It can be very beneficial to use a task runner for starting complex services such as this application. To help out with environment configuration and simplify the start-up process, the application uses a task runner called <a href="https://gruntjs.com/">Grunt</a>. Again, this package is installed locally, but it's probably a good idea to install it globally so Grunt tasks can be run from anywhere. You can do so with this command:
```
npm install grunt -g
```

## 12. Start the Application Server
It's finally time to run the application! The default Grunt task for this project will start up our server, so getting things running is as easy as running the following command at the root directory of the repository:
```
grunt
```

The server should now be running locally on port 8080. You can access the web interface via <a href="http://localhost:8080/">localhost:8080</a>.

The following API endpoints are also available at this address:

* Sitter Endpoints
    * /api/sitters
        * GET requests will return all sitters.
        * POST requests will create a new sitter.
    * /api/sitters/:sitterId
        * GET requests will return the document for the sitter represented by the provided ID.
        * POST requests will update the sitter represented by the provided ID.
        * DELETE requests will delete the sitter represented by the provided ID.
* Owner Endpoints
    * /api/owners
        * GET requests will return all owners.
        * POST requests will create a new owners.
    * /api/owners/:ownerId
        * GET requests will return the document for the owner represented by the provided ID.
        * POST requests will update the owner represented by the provided ID.
        * DELETE requests will delete the owner represented by the provided ID.
* Stay Endpoints
    * /api/stays
        * GET requests will return all owners.
        * POST requests will create a new owners.
    * /api/stays/:stayId
        * GET requests will return the document for the stay represented by the provided ID.
        * POST requests will update the stay represented by the provided ID.
        * DELETE requests will delete the stay represented by the provided ID.

## 13. Load Example Data
Finally, it's time load the example data into MongoDB so the application can serve it up to the web interface through the various APIs. To accomplish this, I've created the loadData.js command line utility in the Utilities directory. This script will read in the contents of the provided CSV, transform them into models that can be added to the appropriate document collections, and commit those models to MongoDB. The parameters and options available can be viewed by running the following command:
```
loadData -h
```

For now, there are just two that we need to focus on:
* -f, --filePath &lt;filePath> - This parameter defines the relative path and name of the .csv file that you'd like to load. It's required.
* -s, --skip-header - When this parameter is passed in, it tells the script that the first line of the file is a header row that should be skipped.

That's kind of a lot to remember for just running a script. Fortunately for us, Grunt is here to the rescue again! I've created a Grunt task that gets everything set up and runs the data load command. With Grunt, what used to be this...
```
node ./Utilities/loadData -s -f ./Utilities/reviews.csv
```
...is now this:
```
grunt loadData
```

## 14. All Done!
Once the data load is completed, the application is all set up and ready to go! You should see a web application being run at <a href="http://localhost:8080/">localhost:8080</a> that fulfills the requirements of the project. Click on the "Sitter List" tab to view the ordered list of sitters, along with some of their associated information.
