const mongoose = require('mongoose');

const streamSchema = new mongoose.Schema({
	title: String,
	description: String,
	userId: Number
});

module.exports = mongoose.model('Stream', streamSchema);
