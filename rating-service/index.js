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
const url = 'mongodb://database-rating-service:27017';
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

	if (!token) {
		res.status(403).send('Invalid credentials')
		return;
	}

	getPemAsPromise().then(pem => {
		try {
			const parsedToken = jsonwebtoken.verify(token, pem);
			req.principal = parsedToken;
			next();
		} catch (err) {
			console.error(err);
			res.status(403).send('Invalid or missing credentials')
		}
	}).catch(err => {
		console.error(err);
		res.status(500).send('Can not connect to authentication service');
	});;
});

// Function to return the pem as promise
async function getPemAsPromise() {
	return new Promise((resolve, reject) => {
		// check if pem exists
		if (pem) {
			//return the pem as promise
			resolve(pem);
		}
		//get the jwt from the keycloak server and save it as a pem. Afterwards return the pem as promise
		return axios.get('http://keycloak:8080/auth/realms/spotimann/protocol/openid-connect/certs').then(response => {
			pem = jwkToPem(response.data.keys[0]);
			resolve(pem);
		}).catch(_ => {
			reject('ERROR: keycloak server could not be reached.');
		});
	});
}


// Function to get the average rating pipeline for a given song ID
function getAverageRatingPipeline(songID) {
	return [
		{
			'$match': {
				'songID': songID
			}
		}, {
			'$group': {
				'_id': '$songID', 
				'averageRating': {
					'$avg': '$rating'
				}
			}
		}, {
			'$project': {
				'_id': 0, 
				'songID': '$_id', 
				'averageRating': 1
			}
		}
	];
}

// Get average rating for song id
app.get('/songID/:id/ratings', (req, res) => {
	
	const songID = req.params.id;

	// Connect to database
	MongoClient.connect(url, (err, client) => {
		if (err) {
			res.status(500).send('Could not connect to server');
		 	return;
		}
	 
		const db = client.db(dbName);
		const collection = db.collection(dbCollection);

		collection.aggregate(getAverageRatingPipeline(songID)).toArray().then(result => {
				if (result.length) {
					res.status(200).json(result[0]);
				} else {
					res.status(404).send('Not found');
				}
			})
			.catch(err => {
				console.error(err);
				res.status(500).send('Failed to process query');
			})
			.finally(_ => {
				client.close();
			})
	});
});

// Post rating for song id

app.post('/songID/:id/ratings', (req, res) => {

	// Validate rating to be a number between 1 and 10
	if (!req.body.rating || isNaN(req.body.rating) || req.body.rating < 1 || req.body.rating > 10) {
		res.status(400).send('Invalid rating');
		return;
	}

	// Construct new rating object
	const newRating = {
		authorID:  req.principal.sub,
  	songID:  req.params.id,
		rating: req.body.rating
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
			'songID': newRating.songID,
			'authorID': newRating.authorID
		}, (err, result) => {

			if (err) {
				console.error(err);
				res.status(500).send('Failed to process query');
				return;
			}

			if (result) {

				// Update rating
				collection.updateOne(
					{
						'songID': newRating.songID,
						'authorID': newRating.authorID
					},
					{
						 $set: { "rating": newRating.rating }
					}, (err, result) => {
		
						if (err) {
							console.error(err);
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

				// Insert rating
				collection.insertOne(newRating, (err, result) => {
					if (err) {
						console.error(err);
						res.status(500).send('Failed to process query');
						return;
					}

					res.status(201).send('Rating was created')

					// Close database connection
					client.close();
				});
			}
		});
	});
});

// Start server
app.listen(port);
