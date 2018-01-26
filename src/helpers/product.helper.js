
//imports
var jwt = require('jsonwebtoken'),
Product = require('../models/product.schema.js')
errors = require('../errors/errors.json');

var grpc = require("grpc");
var menuDescriptor = grpc.load(__dirname + '/../proto/menu.proto').menu;
var menuClient = new menuDescriptor.MenuService('service.menu:1295', grpc.credentials.createInsecure());


//var jwt = require('jsonwebtoken');
//var tokenService = require('bleuapp-token-service').createTokenHandler('service.token', '50051');

var helper = {};

helper.getAll = function(call, callback){
  //protected route so verify token;
  jwt.verify(call.metadata.get('authorization')[0], process.env.JWT_SECRET, function(err, token){
    if(err){
      return callback(errors['0001'],null);
    }
    Product.find({ owner: token.sub}).exec(function(err, resultProducts){
      if(err){
        return callback(errors['0003'], null);
      }

      var results = [];
      resultProducts.forEach(function(product){
        var formatted = {};
        formatted._id = product._id.toString();
        formatted.name = product.name;
        formatted.description = product.description;
        formatted.price = product.price;
        formatted.in_stock = product.in_stock;
        formatted.age_restricted = product.age_restricted;
        results[results.length] = formatted;
      });

      return callback(null, results);
    })
  });
}

helper.getBatch = function(call, callback){
  Product.find({_id: {$in: call.request.ids} }).exec(function(err, resultProducts){
    if(err){
      return callback(errors['0003'], null);
    }

    var results = [];
    resultProducts.forEach(function(product){
      var formatted = {};
      formatted._id = product._id.toString();
      formatted.name = product.name;
      formatted.description = product.description;
      formatted.price = product.price;
      formatted.in_stock = product.in_stock;
      formatted.age_restricted = product.age_restricted;
      results[results.length] = formatted;
    });

    return callback(null, results);
  });
}

helper.get = function(call, callback){
  jwt.verify(call.metadata.get('authorization')[0], process.env.JWT_SECRET, function(err, token){
    if(err){
      return callback(errors['0001'],null);
    }
    Product.findOne({ _id: call.request._id }).exec(function(err, resultProduct){
      if(err){
        return callback(errors['0003'], null);
      }

      var formatted = {};
      formatted._id = resultProduct._id.toString();
      formatted.name = resultProduct.name;
      formatted.description = resultProduct.description;
      formatted.price = resultProduct.price;
      formatted.in_stock = resultProduct.in_stock;
      formatted.age_restricted = resultProduct.age_restricted;
      return callback(null, formatted);
    })
  });
}


helper.create = function(call, callback){
  //validation handled by database
  jwt.verify(call.metadata.get('authorization')[0], process.env.JWT_SECRET, function(err, token){
    if(err){
      return callback(errors['0001'],null);
    }
    call.request.owner = token.sub;
    var newProduct = new Product(call.request);
    newProduct.save(function(err, result){
      if(err){
        return callback(errors['0004'],null);
      }
      return callback(null, {_id: result._id.toString()});
    });
  });
}

helper.update = function(call, callback){
  jwt.verify(call.metadata.get('authorization')[0], process.env.JWT_SECRET, function(err, token){
    if(err){
      return callback(errors['0001'],null);
    }

    var objToSave = {};

    if(call.metadata.get('present')){
      //we have been passed information about what should be updated
      var presentString = call.metadata.get('present').toString();
      var present = presentString.split(',');
      for(var item in present){
        objToSave[present[item]] = call.request[present[item]];
      }
    }else{
      objToSave = call.request;
    }

    Product.findOneAndUpdate({ _id: call.request._id}, objToSave, function(err, product){

      if(err){
        return callback(errors['0005'], null);
      }

      var stripProduct = {};
      stripProduct._id = product._id.toString();
      return callback(null, stripProduct);
    });
  });
}

helper.delete = function(call, callback){
  jwt.verify(call.metadata.get('authorization')[0], process.env.JWT_SECRET, function(err, token){
    if(err){
      return callback(errors['0001'],null);
    }
    Product.findByIdAndRemove(call.request._id, function(err, menuReply){
      if(err){
        return callback(errors['0006'], null);
      }

      menuClient.removeProduct({_id: call.request._id}, function(err, response){

      })
      return callback(null, {});
    })
  });
}


module.exports = helper;
