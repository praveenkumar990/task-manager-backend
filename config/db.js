import { connect } from 'mongoose';

const connectDB = async () => {
  try {
    const uri = "mongodb://praveen:praveen123@ac-cuctnxk-shard-00-00.ocaraf7.mongodb.net:27017,ac-cuctnxk-shard-00-01.ocaraf7.mongodb.net:27017,ac-cuctnxk-shard-00-02.ocaraf7.mongodb.net:27017/?ssl=true&replicaSet=atlas-ln5kp8-shard-0&authSource=admin&appName=Cluster0";
    const conn = await connect(uri);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;