conn = new Mongo();

db = conn.getDB("RoverInterviewProject");
db.createCollection("Sitters", {});
db.createCollection("Owners", {});
db.createCollection("Stays", {});

dbTest = conn.getDB("RoverInterviewProjectTest");
dbTest.createCollection("Sitters", {});
dbTest.createCollection("Owners", {});
dbTest.createCollection("Stays", {});
