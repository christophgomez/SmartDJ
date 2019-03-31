/*eslint-disable*/
const express = require('express');
const userRoute = express.Router();
const User = require('../models/user');

// Get all Users
userRoute.route('/').get((req, res) => {
	User.find({}, (error, users) => {
		if (error) {
			console.log(error);
			return res.send({
				success: false
			});
		}
		return res.status(200).send({
			success: true,
			users: users
		});
	}).sort({
		_id: -1
	});
});

// Get a single user
userRoute.route('/:email').get((req, res) => {
	console.log('finding ' + req.params.email);
	User.findOne({
		email: req.params.email
	}, (error, user) => {
		if (error) {
			console.log(error);
			return res.send({
				success: false
			});
		}
		if (user === null)
			return res.status(200).send({
				success: false,
			});
		else
			return res.send({
				success: true,
				user: user
			});
	});
});

// Add a user
userRoute.route('/add').post((req, res) => {
	var new_user = new User({
		access_token: req.body.access_token,
		refresh_token: req.body.refresh_token,
		email: req.body.email,
	});
	new_user.save((error) => {
		if (error) {
			console.log(error);
			return res.send({
				success: false,
				msg: "User Already Exists!"
			});
		}
		return res.send({
			success: true,
			msg: "User Created Successfully"
		});
	});
});

// login user
userRoute.route('/login').post((req, res) => {
	User.findOne({
		email: req.body.email
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

			res.send({
				success: true,
				token: 'JWT ' + token
			});
		}
	});
})

// update a user
userRoute.route('/update/:email').put((req, res) => {
	var email = req.params.email;
	var id;
	User.findOne({
		email
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
				user.email = req.body.email;
				user.save((error) => {
					if (error) {
						console.log(error);
						return res.send({
							success: false
						});
					}
					return res.status(200).send({
						success: true
					});
				});
			});
		}
	})
});

// update a user access token
userRoute.route('/updateToken/:email').put((req, res) => {
	var email = req.params.email;
	var id;
	console.log('updating token');
	User.findOne({
		email
	}, (err, user) => {
		if (err) console.log(err);
		if (!user) console.log('user not found');
		else {
			id = user._id;
			User.findById(id, (error, user) => {
				if (error) {
					console.log(error);
					return res.send({
						success: false
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
					return res.status(200).send({
						success: true
					});
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
			console.log(error);
			return res.send({
				success: false
			});
		}
		console.log('user deleted');
		return res.status(200).send({
			success: true
		});
	});
});

module.exports = userRoute;