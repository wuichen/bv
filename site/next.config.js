require('dotenv').config();
const withPWA = require('next-pwa');

const meetup = require('../meetupConfig');
const serverUrl = process.env.SERVER_URL || 'http://localhost:3000';

module.exports = withPWA({
	pwa: {
		dest: 'public'
	},
	publicRuntimeConfig: {
		// Will be available on both server and client
		meetup,
		serverUrl
	}
});
