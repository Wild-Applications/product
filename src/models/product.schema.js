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
  owner: { type : Number, required : true }
}, {
  timestamps: true
});


schema.set('toJSON', {getters: true, setters:true});

module.exports = mongoose.model('Product', schema);
