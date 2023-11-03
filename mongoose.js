require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

console.log(process.env.PASS);
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

    database = client.db("alert_bot");
    collection = database.collection("servers");
    await client.db("alert_bot").command({ ping: 1 });
    console.log("Connected to DB");
  } catch (e) {
    console.log(e);
    await client.close();
  }
}

module.exports = main;
