var AWS = require('aws-sdk')

module.exports = {
	initialiseAWS: function() {
		return new AWS.S3({
			accessKeyId: ***REMOVED***,
			secretAccessKey: ***REMOVED***,
			region: ***REMOVED***
		})
	},
	bucketName: ***REMOVED***
}
