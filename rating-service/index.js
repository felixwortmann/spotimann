const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser')

const app = express();
const port = 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

// Database information
const url = 'mongodb://localhost:27017';
const dbName = 'ratings';
const dbCollection = 'ratings';

// get ratings for song id
app.get('/:id', (req, res) => {

  // TODO: Add Key Cloak Auth

	const songID = req.params.id;
	MongoClient.connect(url, function(err, client) {
		if (err) {
			res.status(500).send('Could not connect to server');
		 	return;
		}
	 
		const db = client.db(dbName);
		const collection = db.collection(dbCollection);

    
		collection.findOne({'songID': songID}, (err, song) => {
			if (err) {
				res.status(500).send('Failed to process query');
				return;
			}
			if (!song) {
				res.status(404).send('Could not find entity with given ID');
				return;
			}
			res.json(song.ratings);
		});
	 
		client.close();
	});
});

// post rating for song id

app.post('/:id', (req, res) => {

  // TODO: Add Key Cloak Auth
  
	const songID = req.params.id;
	
	if (!req.body.rating || isNaN(req.body.rating) || req.body.rating < 1 || req.body.rating > 10) {
		res.status(404).send('Invalid rating');
		return;
	}

	const newRating = {
		rating: req.body.rating,
		comment: req.body.comment || null
	}

  MongoClient.connect(url, { poolSize: 15 }, function(err, client) {
		if (err) {
			res.status(500).send('Could not connect to server');
		 	return;
		}
	 
		const db = client.db(dbName);
		const collection = db.collection(dbCollection);

		collection.findOne({
			'songID': songID,
			'ratings.authorID': newRating.authorID
		}, (err, result) => {

			if (err) {
				console.log(err);
				res.status(500).send('Failed to process query');
				return;
			}

			if (result) {

				collection.updateOne(
					{
						'songID': songID,
						'ratings.authorID': newRating.authorID
					},
					{
						 $set: { "ratings.$": newRating }
					}, (err, result) => {
		
						if (err) {
							console.log(err);
							res.status(500).send('Failed to process query');
							return;
						}
		
						if (result.modifiedCount) {
							res.status(201).send('Rating was updated')
						} else {
							res.status(200).send('Rating was not updated')
						}
				});
			} else {

				collection.updateOne( {
					'songID': songID
				},
				{
					$push: { "ratings": newRating }
				}, (err, result) => {
					if (err) {
						console.log(err);
						res.status(500).send('Failed to process query');
						return;
					}
	
					if (result.modifiedCount) {
						res.status(201).send('Rating was created')
					} else {
						console.log(err);
						res.status(500).send('Failed to process query');
					}
				});
			}
			client.close();
		});
		
	});



});


app.listen(port);


/*

collection.updateOne( {
						'songID': songID
					},
					{
						$push: { "ratings": newRating }
					}, (err, result) => {
						if (err) {
							console.log(err);
							res.status(500).send('Failed to process query');
							return;
						}
		
						if (result.modifiedCount) {
							res.status(201).send('Rating was created')
						} else {
							console.log(err);
							res.status(500).send('Failed to process query');
						}
					});

*/