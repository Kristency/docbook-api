const mongoose = require('mongoose')

const documentSchema = new mongoose.Schema(
	{
		title: String,
		description: String,
		userId: String,
		fileLink: String,
		s3_key: String
	},
	{
		// createdAt,updatedAt fields are automatically added into records
		timestamps: true
	}
)

module.exports = mongoose.model('Document', documentSchema)
