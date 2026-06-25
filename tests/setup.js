const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

module.exports = {
  setUp: async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  },
  dropDatabase: async () => {
    if (mongoose.connection.db) {
      const collections = await mongoose.connection.db.collections();
      for (let collection of collections) {
        await collection.drop();
      }
    }
  },
  dropCollections: async () => {
    if (mongoose.connection.db) {
      const collections = await mongoose.connection.db.collections();
      for (let collection of collections) {
        await collection.deleteMany();
      }
    }
  },
  tearDown: async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  }
};
