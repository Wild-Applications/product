var mongoose = require('mongoose');


function setPrice(p){
    return p * 100;
}

function getPrice(p){
  return parseFloat((p/100).toFixed(2));
}

var schema = new mongoose.Schema({
  name : { type : String, required : true },
  description: { type: String, required: false },
  price: {type: Number, required: true, default: 0, get: getPrice, set: setPrice},
  owner: { type : Number, required : true },
  in_stock: { type: Boolean, required: true, default: true},
  age_restricted: { type: Boolean, required: true, default: false}
}, {
  timestamps: true
});

schema.path('price').set(function(p){
  return p * 100;
});

schema.path('price').get(function(p){
  return parseFloat((p/100).toFixed(2));
});

schema.set('toJSON', {getters: true, setters:true});
schema.set('toObject', {getters: true, setters:true});

module.exports = mongoose.model('Product', schema);
