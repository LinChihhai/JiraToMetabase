import {MongoClient} from "mongodb"

const client = await new MongoClient(process.env.MONGO_URL).connect();
export default async function mongo(handler, asArray = false) {
    let result = null;
    if (handler) {
        result = await handler(client.db());
        asArray && result.toArray && (result = await result.toArray())
    }

    return result
}