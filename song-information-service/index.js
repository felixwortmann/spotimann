const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const jwkToPem = require('jwk-to-pem');
const jsonwebtoken = require('jsonwebtoken');
const axios = require('axios');

// Server stuff
const app = express();
const port = 8080;
 
// Database stuff
const url = 'mongodb://database-song-information-service:27017';
const dbName = 'information';

// variable to store the pem (Privacy-Enhanced Mail)
let pem;

// Middleware auth
app.use(function (req, res, next) {
	// Check if token exists and remove 'Bearer'
	const token = (req.get('Authorization') && req.get('Authorization').slice(7)) || null;
	console.log(token);

	// Check if pem exists, if not call `getKeyCloakToken` to get the pem. Afterwards validate the token
	if (!pem) {
		getKeyCloakToken(res).then(_ => {
			try {
				const parsedToken = jsonwebtoken.verify(token, pem);
				next();
			} catch (err) {
				console.warn(err);
				res.status(403).send('Invalid credentials')
			}
		});
		// If pem already exists, validate the token
	} else {
		try {
			const parsedToken = jsonwebtoken.verify(token, pem);
			next();
		} catch (err) {
			console.warn(err);
			res.status(403).send('Invalid credentials');
		}
	}
});

// Function to request keycloak token
function getKeyCloakToken(res) {
	return axios.get('http://keycloak:8080/auth/realms/spotimann/protocol/openid-connect/certs').then(response => {
		pem = jwkToPem(response.data.keys[0]);
	})
	.catch(err => {
		console.error(err);
		res.status(500).send('Cannot connect to authentication service');
	});
}

// Get song list
app.get('/songs', (req, res) => {
	MongoClient.connect(url, function(err, client) {
		if (err) {
			res.status(500).send('Could not connect to server');
		 	return;
		}

		const db = client.db(dbName);
		const collection = db.collection('songs');

		collection.find()
			.sort({id: 1})
			.toArray()
			.then(songs => {
				res.json(songs);
			});

		client.close();
	});
})
 
// Get song with ID
app.get('/songs/:id', (req, res) => {
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