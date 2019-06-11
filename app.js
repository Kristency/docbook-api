const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

//app config
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect(process.env.DATABASEURL || 'mongodb://localhost:27017/streamy-api', { useNewUrlParser: true });

//requiring models
const Stream = require('./models/stream');

//setting up routes
app.get('/streams', (req, res) => {
	res.send('All streams');
});

app.post('/streams/new', (req, res) => {
	let { title, description } = req.body;
	Stream.create({ title, description }, (err, createdStream) => {
		if (err) {
			console.log(err);
		} else {
			res.send(createdStream);
		}
	});
});

app.listen(process.env.PORT || 8080, process.env.IP, () => {
	console.log('Server is running on port 8080');
});
