import gql from 'graphql-tag';
import { USER_IMAGE } from './fragments';

export const ADD_RSVP = gql`
	mutation AddRsvp(
		$event: ID!
		$user: ID!
		$status: RsvpStatusType!
		$startTime: DateTime!
		$numberOfGuests: Int!
	) {
		createRsvp(
			data: {
				event: { connect: { id: $event } }
				user: { connect: { id: $user } }
				status: $status
				startTime: $startTime
				numberOfGuests: $numberOfGuests
			}
		) {
			id
			event {
				id
			}
			status
		}
	}
`;

export const UPDATE_RSVP = gql`
	mutation UpdateRSVP(
		$rsvp: ID!
		$status: RsvpStatusType!
		$endTime: DateTime!
		$amount: Int
	) {
		updateRsvp(
			id: $rsvp
			data: { amount: $amount, status: $status, endTime: $endTime }
		) {
			id
			event {
				id
			}
			startTime
			endTime
			status
		}
	}
`;

export const GET_EVENT_RSVPS = gql`
	query GetEventRsvps($event: ID!) {
		allRsvps(
			where: { event: { id: $event }, status: yes, user_is_null: false }
		) {
			id
			status
			startTime
			endTime
			user {
				id
				name
				...UserImage
			}
		}
	}
	${USER_IMAGE}
`;

export const GET_RSVPS = gql`
	query GetRsvps($event: ID!, $user: ID!) {
		eventRsvps: allRsvps(where: { event: { id: $event }, status: yes }) {
			id
			status
			startTime
			endTime
			numberOfGuests
		}
		userRsvps: allRsvps(where: { event: { id: $event }, user: { id: $user } }) {
			id
			status
			startTime
			endTime
			numberOfGuests
		}
		event: Event(where: { id: $event }) {
			id
			startTime
			maxRsvps
			isRsvpAvailable
			rate
			service {
				id
				rate
				name
			}
		}
	}
`;
