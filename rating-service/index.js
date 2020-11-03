const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser')
const jwkToPem = require('jwk-to-pem');
const jsonwebtoken = require('jsonwebtoken');
const request = require('request');

let pem;

// Request keycloak token
request('http://localhost:8180/auth/realms/spotimann/protocol/openid-connect/certs', { json: true }, (err, res, body) => {
  if (err) { return console.log(err); }
	pem = jwkToPem(body.keys[0]);
});

const app = express();
const port = 8080;

// Middleware auth
app.use(function (req, res, next) {
	const token = req.get('Authorization').slice(7);
	try {
		const parsedToken = jsonwebtoken.verify(token, pem);
		req.principal = parsedToken;
		next();
	} catch (err) {
		res.status(403).send('Invalid credentials')
	}
	
});

// Database information
const url = 'mongodb://localhost:2000';
const dbName = 'ratings';
const dbCollection = 'ratings';

// Express
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Get ratings for song id
app.get('/:id', (req, res) => {

	const songID = req.params.id;

	// Connect to database
	MongoClient.connect(url, (err, client) => {
		if (err) {
			res.status(500).send('Could not connect to server');
		 	return;
		}
	 
		const db = client.db(dbName);
		const collection = db.collection(dbCollection);

    // Query all ratings for given song id
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

// Post rating for song id

app.post('/:id', (req, res) => {

	const songID = req.params.id;
	
	// Validate rating to be a number between 1 and 10
	if (!req.body.rating || isNaN(req.body.rating) || req.body.rating < 1 || req.body.rating > 10) {
		res.status(400).send('Invalid rating');
		return;
	}

	// Construct new rating object
	const newRating = {
		rating: req.body.rating,
		comment: req.body.comment || null,
		authorID:  req.principal.sub,
  	authorName:  req.principal.name
	}

	// Connect to database
  MongoClient.connect(url, function(err, client) {
		if (err) {
			res.status(500).send('Could not connect to server');
		 	return;
		}
	 
		const db = client.db(dbName);
		const collection = db.collection(dbCollection);

		// Check if author has already a rating for given song id
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

				// Update rating
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

				// Create rating
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

			// Close database connection
			client.close();
		});
	});
});

// Start server
app.listen(port);
