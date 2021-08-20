const { MongoClient } = require("mongodb");

// Database Name
const dbName = "2021";
const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.skymo.mongodb.net/${dbName}?retryWrites=true&w=majority`;

/** @type {import('mongodb').MongoClient} */
let cachedClient = null;
/** @type {import('mongodb').Db} */
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = await client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

const DatabaseClient = {
  getAnswers: async () => {
    const { db } = await connectToDatabase();
    const collection = db.collection("answers");

    const answers = await collection.find().toArray();
    return answers;
  },
};

module.exports = {
  DatabaseClient,
};
