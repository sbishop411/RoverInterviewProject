conn = new Mongo();
db = conn.getDB("admin");

db.createUser({
	user: _getEnv("MONGO_SERVER_USERNAME"),
	pwd: _getEnv("MONGO_SERVER_PASSWORD"),
	roles: [
		{
			role: "readWrite",
			db: "RoverInterviewProject"
		}
	]
});

db = conn.getDB(_getEnv("MONGO_INITDB_DATABASE"));

db.createCollection("sitters");
db.createCollection("owners");
db.createCollection("stays");
