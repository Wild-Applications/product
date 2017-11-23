
//imports
var jwt = require('jsonwebtoken'),
Product = require('../models/product.schema.js');



//var jwt = require('jsonwebtoken');
//var tokenService = require('bleuapp-token-service').createTokenHandler('service.token', '50051');

var helper = {};

helper.getAll = function(call, callback){
  //protected route so verify token;
  jwt.verify(call.metadata.get('authorization')[0], process.env.JWT_SECRET, function(err, token){
    if(err){
      return callback({message:err},null);
    }
    Product.find({ owner: token.sub}).exec(function(err, resultProducts){
      if(err){
        return callback({message:'err'}, null);
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
      console.log(err);
      return callback({message:'err'}, null);
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
      return callback({message:err},null);
    }
    Product.findOne({ _id: call.request._id }).exec(function(err, resultProduct){
      if(err){
        return callback({message:'err'}, null);
      }

      var formatted = {};
      formatted._id = resultProduct._id.toString();
      formatted.name = resultProduct.name;
      formatted.description = resultProduct.description;
      formatted.price = resultProduct.price;
      formatted.in_stock = resultProduct.in_stock;
      formatted.age_restricted = product.age_restricted;
      return callback(null, formatted);
    })
  });
}


helper.create = function(call, callback){
  //validation handled by database
  jwt.verify(call.metadata.get('authorization')[0], process.env.JWT_SECRET, function(err, token){
    if(err){
      return callback({message:err},null);
    }
    call.request.owner = token.sub;
    var newProduct = new Product(call.request);
    newProduct.save(function(err, result){
      if(err){
        return callback({message:'err'},null);
      }
      return callback(null, {_id: result._id.toString()});
    });
  });
}

helper.update = function(call, callback){
  jwt.verify(call.metadata.get('authorization')[0], process.env.JWT_SECRET, function(err, token){
    if(err){
      return callback({message:err},null);
    }
    Product.findOne({_id: call.request._id}, function(err, productReply){
      if(err){
      return callback({message:JSON.stringify({code:'', message:"Something went wrong when trying to update product"})}, null);
      }
      delete call.request._id;
      for(var key in call.request){
        productReply[key] = call.request[key];
      }
      productReply.save(function(err, saved){
        if(err){
          console.log(err);
          return callback({message:'err'}, null);
        }
        var productToReturn = {};
        productToReturn._id = productReply._id.toString();
        return callback(null, productToReturn);
      });
    });
  });
}

helper.delete = function(call, callback){
  jwt.verify(call.metadata.get('authorization')[0], process.env.JWT_SECRET, function(err, token){
    if(err){
      return callback({message:err},null);
    }

    Product.findByIdAndRemove(call.request._id, function(err, menuReply){
      if(err){
        console.log(err);

        return callback({message:'err'}, null);
      }

      return callback(null, {});
    })
  });
}


module.exports = helper;
