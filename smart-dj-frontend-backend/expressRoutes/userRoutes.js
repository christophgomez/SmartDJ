/*eslint-disable*/
const express = require('express');
var passport = require('passport');
var settings = require('../config/settings');
require('../config/passport')(passport);
var jwt = require('jsonwebtoken');
const userRoute = express.Router();
const User = require('../models/user');

// Get all Users
userRoute.route('/').get((req, res) => {
	User.find({}, (error, users) => {
		if (error) {
			console.log(error);
			return res.status(500).send({
				error: error
			});
		}
		return res.status(200).send({
			users: users
		});
	}).sort({ _id: -1 });
});

// Get a single user
userRoute.route('/:username').get((req, res) => {
	console.log('finding ' + req.params.username);
	User.findOne({username: req.params.username}, (error, user) => {
		if (error) {
			console.log(error);
			return res.status(500).send({
				error: error
			});
		}
		return res.status(200).send({
			user: user
		});
	});
});

// Add a user
userRoute.route('/add').post((req, res) => {
	var new_user = new User({
		username: req.body.username,
		password: req.body.password,
		access_token: req.body.access_token,
		refresh_token: req.body.refresh_token,
		email: req.body.email,
		spotify_type: req.body.spotify_type
	});
	new_user.save((error) => {
		if (error) {
			console.log(error);
			return res.send({
				success: false,
				msg: "User Already Exists!"
			});
		}
		var token = jwt.sign(new_user.toJSON(), settings.secret);
		return res.send({
			success: true,
			token: 'JWT '+token,
			msg: "User Created Successfully"
		});
	});
});

// login user
userRoute.route('/login').post((req, res) => {
	User.findOne({
		username: req.body.username
	}, function (err, user) {
		if (err) console.log(err);

		if (!user) {
			console.log('user not found');
			res.send({
				success: false,
				msg: 'Authentication failed. User not found.'
			});
		} else {
			console.log('found user');
			// check if password matches
			user.comparePassword(req.body.password, function (err, isMatch) {
				if (isMatch && !err) {
					console.log('passwords match');
					// if user is found and password is right create a token
					var token = jwt.sign(user.toJSON(), settings.secret);
					// return the information including token as JSON
					res.send({
						success: true,
						token: 'JWT ' + token
					});
				} else {
					res.send({
						success: false,
						msg: 'Authentication failed. Wrong password.'
					});
				}
			});
		}
	});
})

// update a user
userRoute.route('/update/:username').put((req, res) => {
	var username = req.params.username;
	var id;
	User.findOne({ username }, (err, user) => {
		if (err) console.log(err);
		if (!user) console.log('user not found');
		else {
			id = user._id;
			User.findById(id, (error, user) => {
				if (error) {
					console.log(error);
					return res.status(500).send({
						error: error
					});
				}
				user.username = req.body.username;
				user.password = req.body.password;
				user.save((error) => {
					if (error) {
						console.log(error);
						return res.status(500).send({
							error: error
						});
					}
					return res.status(200).send();
				});
			});
		}
	})
});

// update a user access token
userRoute.route('/updateToken/:username').put((req, res) => {
	var username = req.params.username;
	var id;
	console.log('updating token');
	User.findOne({
		username
	}, (err, user) => {
		if (err) console.log(err);
		if (!user) console.log('user not found');
		else {
			id = user._id;
			User.findById(id, (error, user) => {
				if (error) {
					console.log(error);
					return res.status(500).send({
						error: error
					});
				}
				user.access_token = req.body.access_token;
				user.refresh_token = req.body.refresh_token;
				user.save((error) => {
					if (error) {
						console.log(error);
						return res.status(500).send({
							error: error
						});
					}
					return res.status(200).send();
				});
			});
		}
	});
});

// delete user
userRoute.route('/delete/:id').delete((req, res) => {
	User.remove({
		_id: req.params.id,
	}, (error) => {
		if (error) {
			console.log('\n'+error+'\n');
			return res.status(500).send({
				error: error
			});
		}
		console.log('\nuser deleted\n');
		return res.status(200).send();
	});
});

module.exports = userRoute;