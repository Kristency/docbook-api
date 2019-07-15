const express = require('express')
const app = express()
require('dotenv').config()
const mongoose = require('mongoose')
const cors = require('cors')
const multer = require('multer')
// var AWS = require('aws-sdk')
const initialiseAWS = require('./config/aws-config')

//app config
app.use(cors())
app.use(express.json()) // because axios sends only json , not url-encoded
// use bodyParser or express.urlEncoded when sending a post request directly through a form.

// Multer ships with storage engines DiskStorage and MemoryStorage
// And Multer adds a body object and a file or files object to the request object. The body object contains the values of the text fields of the form, the file or files object contains the files uploaded via the form.
var storage = multer.memoryStorage()
var upload = multer({ storage: storage })

// Don't forget to whitelist your IP on Mongo Atlas for connecting to the database while deployed on Heroku
mongoose.connect(process.env.DATABASEURL || 'mongodb://localhost:27017/docbook-api', {
	useNewUrlParser: true
})

//requiring models
const Document = require('./models/document')

//setting up routes

/* Don't use promises on database querying methods as they result
	in unexpected behaviour (like console logging instead of sending response while calling res.send() ). 
	So don't use .then() after asynchronous database CRUD operations, instead use callback functions for now. */

app.get('/documents', (req, res) => {
	Document.find(
		{},
		null,
		{
			sort: { createdAt: 1 }
		},
		(err, foundDocuments) => {
			if (err) {
				console.log(err)
			} else {
				res.json(foundDocuments)
			}
		}
	)
})

app.get('/documents/:id', (req, res) => {
	Document.findById(req.params.id, (err, foundDocument) => {
		if (err) {
			console.log(err)
		} else {
			res.json(foundDocument)
		}
	})
})

app.post('/documents/new', upload.single('file'), (req, res) => {
	const file = req.file
	const s3FileURL = process.env.AWS_Uploaded_File_URL_LINK

	let s3bucket = initialiseAWS()

	//Where you want to store your file

	var params = {
		Bucket: process.env.AWS_BUCKET_NAME,
		Key: file.originalname,
		Body: file.buffer,
		ContentType: file.mimetype,
		ACL: 'public-read'
	}

	s3bucket.upload(params, function(err, data) {
		if (err) {
			res.status(500).json({ error: true, Message: err })
		} else {
			// res.send({ data })

			let { title, description, userId, username } = req.body

			var newFileUploaded = {
				title,
				description,
				userId,
				username,
				fileLink: s3FileURL + file.originalname,
				s3_key: params.Key
			}

			Document.create(newFileUploaded, (err, createdDocument) => {
				if (err) {
					console.log(err)
				} else {
					res.json(createdDocument)
				}
			})

			/* FOR GETTING THE LINK - I COULD USE getSignedUrl like below - with this in the Terminal, I was getting the link of the file, but have to refactor the code to make it fully work with the React frontend.
				The getSignedUrl method takes an operations, a params, and a callback function as arguments. The operation argument is a string that specifies the name of the operation to call, in this case 'getObject'. 
				The 'getObject' request from the AWS S3 SDK returns a 'data.Body'. The urlParams are parameters that take the Bucket name and the name of the key, in this case the file name. 
				The callback function takes two arguments, error and url. The url is the string we would want to place in our file linking tag to point to the file in the respective front-end code (In this case my FileUpload.js React Component).*/

			// var urlParams = {
			// 	Bucket: process.env.AWS_BUCKET_NAME,
			// 	Key: file.originalname
			// }

			// s3bucket.getSignedUrl('getObject', urlParams, function(err, url) {
			// 	console.log(url)
			// })
		}
	})
})

app.patch('/documents/:id', (req, res) => {
	let { title, description } = req.body
	Document.findByIdAndUpdate(req.params.id, { title, description }, (err, updatedDocument) => {
		if (err) {
			console.log(err)
		} else {
			res.json(updatedDocument)
		}
	})
})

app.delete('/documents/:id', (req, res) => {
	Document.findByIdAndDelete(req.params.id, (err, result) => {
		if (err) {
			console.log(err)
		} else {
			//Now Delete the file from AWS-S3
			// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#deleteObject-property
			let s3bucket = initialiseAWS()

			let params = {
				Bucket: process.env.AWS_BUCKET_NAME,
				Key: result.s3_key
			}

			s3bucket.deleteObject(params, (err, data) => {
				if (err) {
					console.log(err)
				} else {
					res.send({
						status: '200',
						responseType: 'string',
						response: 'success'
					})
				}
			})
		}
	})
})

app.listen(process.env.PORT || 8080, process.env.IP, () => {
	console.log('Server is running on port 8080')
})
