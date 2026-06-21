import mongoose from 'mongoose';

const uri = "mongodb://praveen:praveen123@ac-cuctnxk-shard-00-00.ocaraf7.mongodb.net:27017,ac-cuctnxk-shard-00-01.ocaraf7.mongodb.net:27017,ac-cuctnxk-shard-00-02.ocaraf7.mongodb.net:27017/?ssl=true&replicaSet=atlas-ln5kp8-shard-0&authSource=admin&appName=Cluster0";

async function run() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
    const db = mongoose.connection.db;
    
    // Check tasks collection
    const tasksCol = db.collection('tasks');
    const distinctPriorities = await tasksCol.distinct('priority');
    console.log("Distinct Priorities in DB:", distinctPriorities);
    
    const sampleTasks = await tasksCol.find({}).limit(10).toArray();
    console.log("Sample tasks:", JSON.stringify(sampleTasks, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}
run();
