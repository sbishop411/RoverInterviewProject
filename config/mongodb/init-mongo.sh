# Yup, that's a shell script wrapper around JavaScript, because MongoDB is stupid and it's JavaSscript interpreter can't read environment variables.
# See https://jira.mongodb.org/browse/SERVER-4895 for more information. Since that ticket is 8 years old, this is unlikely to ever change.
# Note: In addition to creating our initial collections, users, and roles, this would also be a good place to load static data that we ALWAYS need to have in the DB.
mongo <<EOF
conn = new Mongo();
db = conn.getDB("$MONGO_INITDB_DATABASE");
db.createCollection("Sitters");
db.createCollection("Owners");
db.createCollection("Stays");
db.createRole({ role: "readWrite", privileges: [ { resource: { db: "$MONGO_INITDB_DATABASE", collection: "" }, actions: [ "find", "insert", "remove", "update" ] } ], roles: [] });
db.createUser({ user: "$MONGO_SERVER_USERNAME", pwd: "$MONGO_SERVER_PASSWORD", roles: [ "readWrite" ] });
EOF
