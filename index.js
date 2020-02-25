require('dotenv').config();

const { Keystone } = require('@keystonejs/keystone');
const { PasswordAuthStrategy } = require('@keystonejs/auth-password');
const { MongooseAdapter } = require('@keystonejs/adapter-mongoose');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');
const { NextApp } = require('@keystonejs/app-next');

const {
	Event,
	Talk,
	User,
	Rsvp,
	Organiser,
	Service,
	Sponsor,
	ForgottenPasswordToken
} = require('./schema');

const MEETUP = require('./meetupConfig');
const initialiseData = require('./initialData');

const keystone = new Keystone({
	name: MEETUP.name,
	adapter: new MongooseAdapter({
		mongoUri: process.env.MONGO_URI
	}),
	secureCookies: false,
	onConnect: initialiseData
});

const authStrategy = keystone.createAuthStrategy({
	type: PasswordAuthStrategy,
	list: 'User'
});

keystone.createList('Event', Event);
keystone.createList('Service', Service);
keystone.createList('Rsvp', Rsvp);
keystone.createList('Talk', Talk);
keystone.createList('User', User);
keystone.createList('Organiser', Organiser);
keystone.createList('Sponsor', Sponsor);
keystone.createList('ForgottenPasswordToken', ForgottenPasswordToken);

const adminApp = new AdminUIApp({
	adminPath: '/admin',
	authStrategy,
	pages: [
		{
			label: 'Meetup',
			children: ['Event', 'Talk', 'Organiser', 'Sponsor']
		},
		{
			label: 'People',
			children: ['User', 'Rsvp']
		}
	]
});

module.exports = {
	keystone,
	apps: [new GraphQLApp(), adminApp, new NextApp({ dir: 'site' })]
};
