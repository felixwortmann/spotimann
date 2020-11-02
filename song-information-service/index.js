const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const app = express();
const port = 8080;
 
// Connection URL
const url = 'mongodb://localhost:27017';
 
// Database Name
const dbName = 'information';
 
app.get('/:id', (req, res) => {
	const id = req.params.id;
	MongoClient.connect(url, function(err, client) {
		if (err) {
			res.status(500).send('Could not connect to server');
		 	return;
		}
	 
		const db = client.db(dbName);
		const collection = db.collection('songs');

		collection.findOne({'id': id}, (err, song) => {
			if (err) {
				res.status(500).send('Failed to process query');
				return;
			}
			if (!song) {
				res.status(404).send('Could not find entity with given ID');
				return;
			}
			res.json(song);
		});
	 
		client.close();
	});
});

app.listen(port);