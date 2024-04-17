const mongoose = require('mongoose');

const protocolSchema = new mongoose.Schema({
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    supplierName:{type:String , required: true },
    status:{type:String , required: true },
    protocolTitle:{type:String , required: true },
    ProtocolFile:{type:String  }
})

const Protocol = mongoose.model('Protocol', protocolSchema);

module.exports = Protocol;