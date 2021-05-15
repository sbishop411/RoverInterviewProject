# Setup Instructions
Setting up and running a local instance of this project is easy, thanks to Docker and Docker Compose! This document should contain everything you need to know in order to get the project up and running.

## Prerequisites
You'll need both [Git](https://git-scm.com/) and [Docker](https://www.docker.com/) installed and set up on your local machine.

## Getting the Repository
To get started, you'll need the repository cloned locally. Navigate to the parent directory where you'd like the app to run from, then open a command line and execute the following:
```bash
# Clone the repository down
$ git clone https://github.com/scottbishopdev/RoverInterviewProject

# Navigate into the repository directory
$ cd RoverInterviewProject
```

## Configuring the .env File
For purposes of security and easy customization, several critical values are defined in a `.env` file in the root of the repository. You'll need to review and potentially configure each of these environment variables to your liking before running the project. Here's what each of them do:
* MongoDB Variables
    * **`MONGO_INITDB_DATABASE` -** The name of the database that will be created and used to house the project's data. The default value is "RoverInterviewProject".
    * **`MONGO_INITDB_ROOT_USERNAME` -** The username that will be used for the root user of MongoDB. No default value is provided for security purposes.
    * **`MONGO_INITDB_ROOT_PASSWORD` -** The password that will be used for the root user of MongoDB. Please use a strong password. No default value is provided for security purposes.
    * **`MONGO_INITDB_PORT` -** The port that MongoDB will be listening for connections on. The default value is the same as the default for MongoDB: 27017.
    * **`MONGO_SERVER_USERNAME` -** The username that will be used for the user record that the server will use to communicate with MongoDB. No default value is provided for security purposes.
    * **`MONGO_SERVER_PASSWORD` -** The password that will be used for the user record that the server will use to communicate with MongoDB. Please use a strong password. No default value is provided for security purposes.
* mongo-express Variables
    * **`ME_CONFIG_BASICAUTH_USERNAME` -** The username that will be used for the default user of mongo-express. No default value is provided for security purposes.
    * **`ME_CONFIG_BASICAUTH_PASSWORD` -** The password that will be used for the default user of mongo-express. No default value is provided for security purposes.
    * **`VCAP_APP_PORT` -** The port that mongo-express will run on. The default value is the same as the default for mongo-express: 8081.
* Server Variables
    * **`SERVER_PORT` -** The port that the server will run on. The default value is 56432.

The repository comes with a scaffolded `.env` file, but please note that default values for many critical environment variables will not be provided in order to ensure a proper (and safe) configuration of this system.

## Starting Things Up
After configuring the .env file, you should be good to go! Go back to your command line (in the root of the repository) and run the following commands:
``` bash
# Build the Docker images locally
$ docker-compose build

# Start the Docker services
$ docker-compose up -d
```

That's it! You should now be able to access the website by opening a browser and navigating to `localhost:<SERVER_PORT>`, and mongo-express by navigating to `localhost:<VCAP_APP_PORT>`. The following API endpoints are also available for use at `localhost:<SERVER_PORT>`:

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

---

**Note:** Currently, the project does not automatically load the supplied data defined in the .csv file into MongoDB. A [project](https://github.com/scottbishopdev/RoverInterviewProject/projects/4) currently exists to accomplish this.
