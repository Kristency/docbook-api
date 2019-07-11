const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cors = require('cors')

//app config
app.use(cors())
app.use(express.json()) // because axios sends only json , not url-encoded
// use bodyParser or express.urlEncoded when sending a post request directly through a form.

mongoose.connect(
	process.env.DATABASEURL || 'mongodb://localhost:27017/streamy-api',
	{ useNewUrlParser: true }
)

//requiring models
const Stream = require('./models/stream')

//setting up routes

/* Don't use promises on database querying methods as they result
	in unexpected behaviour (like console logging instead of sending response while calling res.send() ). 
	So don't use .then() after asynchronous database CRUD operations, instead use callback functions for now. */

app.get('/streams', (req, res) => {
	Stream.find({}, (err, foundStreams) => {
		if (err) {
			console.log(err)
		} else {
			res.json(foundStreams)
		}
	})
})

app.get('/streams/:id', (req, res) => {
	Stream.findById(req.params.id, (err, foundStream) => {
		if (err) {
			console.log(err)
		} else {
			res.json(foundStream)
		}
	})
})

app.post('/streams/new', (req, res) => {
	let { title, description } = req.body
	Stream.create({ title, description }, (err, createdStream) => {
		if (err) {
			console.log(err)
		} else {
			res.json(createdStream)
		}
	})
})

app.patch('/streams/:id', (req, res) => {
	let { title, description } = req.body
	Stream.findByIdAndUpdate(
		req.params.id,
		{ title, description },
		(err, updatedStream) => {
			if (err) {
				console.log(err)
			} else {
				res.json(updatedStream)
			}
		}
	)
})

app.delete('/streams/:id', (req, res) => {
	Stream.findByIdAndDelete(req.params.id, err => {
		if (err) {
			console.log(err)
		} else {
			res.json(true)
		}
	})
})

app.listen(process.env.PORT || 8080, process.env.IP, () => {
	console.log('Server is running on port 8080')
})
