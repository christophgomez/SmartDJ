/*eslint-disable*/
const express = require('express');
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
	User.find({username: req.params.username}, (error, user) => {
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
		refresh_token: req.body.refresh_token
	});
	new_user.save((error) => {
		if (error) {
			console.log(error);
			return res.status(500).send({
				error: error
			});
		}
		return res.status(200).send();
	});
});

// update a user
userRoute.route('/update/:id').put((req, res) => {
	User.findById(req.params.id, (error, user) => {
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
});

// delete user
userRoute.route('/delete/:id').delete((req, res) => {
	User.remove({
		_id: req.params.id,
	}, (error) => {
		if (error) {
			console.log(error);
			return res.status(500).send({
				error: error
			});
		}
		return res.status(200).send();
	});
});

module.exports = userRoute;