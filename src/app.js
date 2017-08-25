//Account service

//Imports
const grpc = require('grpc');
const productHelper = require('./helpers/product.helper.js');
const proto = grpc.load(__dirname + '/proto/product.proto');
const server = new grpc.Server();
const mongoose = require('mongoose');
const dbUrl = "mongodb://wildappsadminmwproduct:7LCvxccG1jGXxF4o@productcluster-shard-00-00-8nqjy.mongodb.net:27017,productcluster-shard-00-01-8nqjy.mongodb.net:27017,productcluster-shard-00-02-8nqjy.mongodb.net:27017/PRODUCT?ssl=true&replicaSet=ProductCluster-shard-0&authSource=admin";

mongoose.connect(dbUrl);

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', function () {
  console.log('Mongoose default connection open');
});

// If the connection throws an error
mongoose.connection.on('error',function (err) {
  console.log('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
  console.log('Mongoose default connection disconnected');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function() {
  mongoose.connection.close(function () {
    console.log('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});


//define the callable methods that correspond to the methods defined in the protofile
server.addService(proto.product.ProductService.service, {
  getAll: function(call, callback){
    productHelper.getAll(call, callback);
  },
  get: function(call, callback){
    productHelper.get(call, callback);
  },
  getBatch: function(call, callback){
    productHelper.getBatch(call, callback);
  },
  create: function(call, callback){
    productHelper.create(call,callback);
  },
  update: function(call, callback){
    productHelper.update(call,callback);
  },
  delete: function(call, callback){
    productHelper.delete(call, callback);
  }

});

//Specify the IP and and port to start the grpc Server, no SSL in test environment
server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());

//Start the server
server.start();
console.log('gRPC server running on port: 50051');
