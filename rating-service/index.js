const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser')
const jwkToPem = require('jwk-to-pem');
const jsonwebtoken = require('jsonwebtoken');
const axios = require('axios');

// variable to store the pem (Privacy-Enhanced Mail)
let pem;

// constant to store the port
const port = 8080;

// Database information
const url = 'mongodb://localhost:27018';
const dbName = 'ratings';
const dbCollection = 'ratings';

// Express initial
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware auth
app.use(function (req, res, next) {
	// check if token exists and remove 'Bearer '
	const token = (req.get('Authorization') && req.get('Authorization').slice(7)) || null;

	// check if pem exists, if not, call `getKeyCloakToken` to get the pem. Afterwards validate the token
	if (!pem) {
		getKeyCloakToken(res).then(_ => {
			try {
				const parsedToken = jsonwebtoken.verify(token, pem);
				req.principal = parsedToken;
				next();
			} catch (err) {
				console.warn(err);
				res.status(403).send('Invalid credentials')
			}
		});
		// if pem already exists, validate the token
	} else {
		try {
			const parsedToken = jsonwebtoken.verify(token, pem);
			req.principal = parsedToken;
			next();
		} catch (err) {
			console.warn(err);
			res.status(403).send('Invalid credentials');
		}
	}
});

// Function to request keycloak token
function getKeyCloakToken(res) {
	return axios.get('http://localhost:8180/auth/realms/spotimann/protocol/openid-connect/certs').then(response => {
		pem = jwkToPem(response.data.keys[0]);
	})
	.catch(err => {
		console.error(err);
		res.status(500).send('Can not connect to authentication service');
	});
}

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
						// Insert new song entity with rating
						collection.insertOne({
							'songID': songID,
							'ratings': [
								newRating
							]
						}, (err, _) => {
							if (err) {
								console.log(err);
								res.status(500).send('Failed to process query');
								return;
							}
							res.status(201).send('Rating was created')
						});
					}

					// Close database connection
					client.close();
				});
			}
		});
	});
});

// Start server
app.listen(port);
