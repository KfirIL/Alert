const { MongoClient, ServerApiVersion } = require("mongodb");

const URI = `mongodb+srv://Voldemort:${process.env.PASS}@dcluster.69ofifx.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function main() {
  try {
    await client.connect();

    database = client.db(process.env.DB);
    collection = database.collection(process.env.COL);
    await client.db("alert_bot").command({ ping: 1 });
    console.log("Connected to DB");
  } catch (e) {
    console.log(e);
    await client.close();
  }
}

async function close() {
  await client.close();
}

module.exports = {
  main,
  close,
};
