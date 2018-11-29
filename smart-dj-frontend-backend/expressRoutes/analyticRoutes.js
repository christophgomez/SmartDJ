/*eslint-disable*/
const Request = require('../models/request');
const Session = require('../models/listeningSession');
const express = require('express');
var analyticsRoute = express.Router();

analyticsRoute.route('/requests').get((req, res) => {
	Request.find({}, (err, documents) => {
		if (err) {
			console.log(err);
			return res.send({
				success: false
			});
		}
		return res.send({
			success: true,
			data: documents
		});
	})
});

analyticsRoute.route('/requests/app').get((req, res) => {
	Request.find({ 'from' : 'App' }, (err, documents) => {
		if (err) {
			console.log(err);
			return res.send({
				success: false
			});
		}
		return res.send({
			success: true,
			data: documents
		});
	});
});

analyticsRoute.route('/requests/kinect').get((req, res) => {
	Request.find({ 'from': 'Kinect' }, (err, documents) => {
		if (err) {
			console.log(err);
			return res.send({
				success: false
			});
		}
		return res.send({
			success: true,
			data: documents
		});
	});
});

analyticsRoute.route('/requests/endpoint/:endpoint').get((req, res) => {
	Request.find({ 'endpoint' : req.params.endpoint }, (err, documents) => {
		if (err) {
			console.log(err);
			return res.send({
				success: false
			});
		}
		return res.send({
			success: true,
			data: documents
		});
	});
});

analyticsRoute.route('/requests/:year').get((req, res) => {
	Request.find({
	'time.created': {
		'$gte': new Date(req.params.year, 0, 1),
		'$lte': new Date(req.params.year, 11, 31)
	}
	}, (err, documents) => {
	if (err) {
		console.log(err);
		return res.send({
			success: false
		});
	}
	return res.send({
		success: true,
		data: documents
	});
	});
});

analyticsRoute.route('/requests/:year/:month').get((req, res) => {
	var days = new Date(req.params.year, req.params.month, 0).getDate();
	Request.find({
		'time.created': {
			'$gte': new Date(req.params.year, req.params.month, 1),
			'$lte': new Date(req.params.year, req.params.month, days)
		}
	}, (err, documents) => {
		if (err) {
			console.log(err);
			return res.send({
				success: false
			});
		}
		return res.send({
			success: true,
			data: documents
		});
	});
});

analyticsRoute.route('/requests/:year/:month/:day/week').get((req, res) => {
	console.log("received year: " + req.params.year);
	var g_then = new Date(req.params.year, req.params.month, req.params.day);
	var l_then = new Date(req.params.year, req.params.month, req.params.day + 7);
	console.log("\nFinding documents between " + g_then + " and " + l_then);
	Request.find({
		'time.created': {
			'$gte': g_then,
			'$lte': l_then
		}
	}, (err, documents) => {
		if (err) {
			console.log(err);
			return res.send({
				success: false
			});
		}
		console.log('found some analytics for the week: ' + documents + "\n");
		return res.send({
			success: true,
			data: documents
		});
	});
});

analyticsRoute.route('/requests/:year/:month/:day/day').get((req, res) => {
	Request.find({
		'time.created': {
			'$gte': new Date(req.params.year, req.params.month, req.params.day),
			'$lte': new Date(req.params.year, req.params.month, req.params.day + 1)
		}
	}, (err, documents) => {
		if (err) {
			console.log(err);
			return res.send({
				success: false
			});
		}
		return res.send({
			success: true,
			data: documents
		});
	});
});

analyticsRoute.route('/sessions').get((req, res) => {
	Session.find({}, (err, documents) => {
		if(err) {
			console.log(err);
			return res.send({
				success: false
			});
		}
		return res.send({
			success: true,
			data: documents
		});
	})
});

analyticsRoute.route('/count').get((req, res) => {
	Request.estimatedDocumentCount((err, count) => {
		if (err) {
			console.log(err);
			return res.send({
				success: false
			});
		}
		return res.send({
			success: true,
			count: count
		});
	});
});

module.exports = analyticsRoute;
