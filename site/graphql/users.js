import gql from 'graphql-tag';

export const CREATE_USER = gql`
	mutation CreateUser($name: String!, $email: String!, $password: String!) {
		createUser(
			data: { name: $name, email: $email, password: $password, wallet: 0 }
		) {
			id
		}
	}
`;

export const USER = gql`
	query user {
		authenticatedUser {
			id
			name
			email
			twitterHandle
			wallet
			services {
				id
				name
				description
				address
				type
				rate
			}
			rsvps {
				id
				paid
				startTime
				endTime
				amount
				event {
					id
					name
				}
			}
			image {
				publicUrlTransformed(
					transformation: {
						quality: "40"
						width: "90"
						height: "90"
						crop: "thumb"
						page: "1"
					}
				)
			}
		}
	}
`;
