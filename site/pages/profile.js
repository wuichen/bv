import React, { Component, useState, useCallback } from 'react';
import gql from 'graphql-tag';
import { useFormState } from 'react-use-form-state';
import { useToasts } from 'react-toast-notifications';
import { useMutation } from 'react-apollo';
import Navbar from '../components/Navbar';
import { Query } from 'react-apollo';
// import { useRouter, withRouter } from 'next/router';
import { AvatarUpload } from '../components/AvatarUpload';
import Meta from '../components/Meta';
import { Button, Field, Group, Label, Link, Input } from '../primitives/forms';
const onChange = handler => e => handler(e.target.value);
// export default withRouter(({ router }) => {
// 	return (
// 		<Query query={USER}>
// 			{({ data, loading, error }) => {
// 				if (loading) {
// 					return <div>loading</div>;
// 				}
// 				if (error) {
// 					return <div>somethings wrong</div>;
// 				}
// 				if (data && data.authenticatedUser) {
// 					return (
// 						<>
// 							<Navbar background="black" />
// 							<NewProfile user={data.authenticatedUser} />
// 						</>
// 					);
// 				} else {
// 					router.push('/');
// 					return null;
// 				}
// 			}}
// 		</Query>
// 	);
// });

export default class ProfilePage extends Component {
	static async getInitialProps(ctx) {
		try {
			const { data, error } = await ctx.apolloClient.query({
				query: USER
			});
			// Redirect to the Signin page when the user is not logged in or if there is an error.
			if (!data.authenticatedUser || error) {
				ctx.res.redirect('/signin');
			}

			return {
				user: data.authenticatedUser,
				error: error
			};
		} catch (error) {
			// If there was an error, we need to pass it down so the page can handle it.
			return { error };
		}
	}

	render() {
		if (this.props.error) return <h1>Error loading User Profile.</h1>;
		return (
			<>
				<Meta title={this.props.user.name} />
				<Navbar background="black" />
				{/*<Profile {...this.props} />*/}
				<NewProfile {...this.props} />
			</>
		);
	}
}

const NewProfile = ({ user }) => {
	const [email, setEmail] = useState(user.email);
	const [name, setName] = useState(user.name);

	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const { addToast } = useToasts();

	const [isLoading, setIsLoading] = useState(false);
	const [errorState, setErrorState] = useState(false);
	const [validationErrors, setValidationErrors] = useState({});
	const [updateUser] = useMutation(UPDATE_USER);
	const [tab, setTab] = useState('info');

	const handleSubmit = useCallback(
		async event => {
			event.preventDefault();
			if (password !== confirmPassword) {
				console.log(password, confirmPassword);
				setValidationErrors({ password: 'Your password should match.' });
				return null;
			}
			setIsLoading(true);

			try {
				await updateUser({
					variables: {
						userId: user.id,
						email,
						name,
						password
					}
				});
				addToast('Changes saved successfully.', {
					appearance: 'success',
					autoDismiss: true
				});
			} catch (error) {
				const errorMessage = error.message.replace(
					'GraphQL error: [password:minLength:User:password] ',
					''
				);
				setValidationErrors({ password: `${errorMessage}` });

				addToast('Please try again.', {
					appearance: 'error',
					autoDismiss: true
				});
			}

			setIsLoading(false);
		},
		[name, email, password, confirmPassword]
	);

	const unSelectedStyle = { backgroundColor: 'white', color: 'black' };
	const selectedStyle = { backgroundColor: 'black', color: 'white' };

	return (
		<div
			style={{
				padding: '30px',
				width: '400px',
				marginLeft: 'auto',
				marginRight: 'auto'
			}}
		>
			<div style={{ marginBottom: '40px' }}>
				<Button
					style={tab === 'info' ? selectedStyle : unSelectedStyle}
					onClick={() => setTab('info')}
				>
					Info
				</Button>{' '}
				&nbsp;
				<Button
					style={tab === 'booking' ? selectedStyle : unSelectedStyle}
					onClick={() => setTab('booking')}
				>
					Booking
				</Button>
			</div>
			{tab === 'booking' && (
				<>
					{user.rsvps.length === 0 && 'No bookings'}
					{user.rsvps.map(rsvp => {
						return (
							<div
								style={{
									padding: '20px',
									boxShadow: '0px 4px 10px rgba(0,0,0,0.1)',
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center'
								}}
							>
								<div>
									<h4>
										{new Date(rsvp.startTime).getFullYear()}/
										{new Date(rsvp.startTime).getMonth()}/
										{new Date(rsvp.startTime).getDate()}
									</h4>
									<div>{rsvp.event.name}</div>
								</div>
								<div>
									<h4>Paid: {rsvp.paid ? 'Paid' : 'Not Yet'}</h4>
									<div>Amount: {rsvp.amount}</div>
								</div>
							</div>
						);
					})}
				</>
			)}
			{tab === 'info' && (
				<>
					{errorState && (
						<p css={{ color: colors.red }}>
							Please check your email and password then try again.
						</p>
					)}
					<AvatarUpload userId={user.id} size="xlarge" />
					<h3>Wallet: {user.wallet}</h3>

					<form noValidate onSubmit={handleSubmit}>
						<Field>
							<Label htmlFor="name">Name</Label>
							<Input
								autoComplete="name"
								autoFocus
								disabled={isLoading}
								onChange={onChange(setName)}
								placeholder="your name"
								required
								type="text"
								value={name}
								id="name"
							/>
						</Field>
						<Field>
							<Label htmlFor="email">Email</Label>
							<Input
								autoComplete="email"
								autoFocus
								disabled={isLoading}
								onChange={onChange(setEmail)}
								placeholder="you@awesome.com"
								required
								type="text"
								value={email}
								id="email"
							/>
						</Field>
						{/*<Field>
					<Label htmlFor="password">Password</Label>
					<Input
						autoComplete="password"
						disabled={isLoading}
						id="password"
						minLength="8"
						onChange={onChange(setPassword)}
						placeholder="supersecret"
						required
						type="password"
						value={password}
					/>
				</Field>
				<Field>
					<Label htmlFor="confirmPassword">Confirm Password</Label>
					<Input
						autoComplete="confirmPassword"
						disabled={isLoading}
						id="confirmPassword"
						minLength="8"
						onChange={onChange(setConfirmPassword)}
						placeholder="supersecret"
						required
						type="password"
						value={confirmPassword}
					/>
        </Field>*/}
						<Button disabled={isLoading} type="submit">
							{isLoading ? 'Saving...' : 'Save Changes'}
						</Button>
					</form>
				</>
			)}
		</div>
	);
};

const Profile = ({ user }) => {
	const [formState, { text, email, password }] = useFormState({
		name: user.name,
		email: user.email,
		twitterHandle: user.twitterHandle || '',
		image: user.image
	});
	const { addToast } = useToasts();
	const [validationErrors, setValidationErrors] = useState({});
	const [updatingUser, setUpdatingUser] = useState(false);

	const [updateUser] = useMutation(UPDATE_USER);

	const submitDisabled =
		updatingUser ||
		(formState.touched.email && !formState.validity.email) ||
		(formState.touched.password && !formState.validity.password) ||
		!formState.values.password ||
		!formState.values.confirmPassword;

	const handleSubmit = useCallback(
		async event => {
			event.preventDefault();
			if (formState.values.password !== formState.values.confirmPassword) {
				setValidationErrors({ password: 'Your password should match.' });
				return null;
			}
			setUpdatingUser(true);

			try {
				await updateUser({
					variables: {
						...formState
					}
				});
				addToast('Changes saved successfully.', {
					appearance: 'success',
					autoDismiss: true
				});
			} catch (error) {
				const errorMessage = error.message.replace(
					'GraphQL error: [password:minLength:User:password] ',
					''
				);
				setValidationErrors({ password: `${errorMessage}` });

				addToast('Please try again.', {
					appearance: 'error',
					autoDismiss: true
				});
			}

			setUpdatingUser(false);
		},
		[formState]
	);

	return (
		<div>
			<AvatarUpload userId={user.id} size="xlarge" />
			<form onSubmit={handleSubmit} noValidate>
				<label htmlFor="name">
					Name
					<input
						{...text('name')}
						autoComplete="name"
						disabled={updatingUser}
					/>
				</label>
				<br />
				<label htmlFor="email">
					Email
					<input
						required
						{...email('email')}
						autoComplete="email"
						disabled={updatingUser}
					/>
					{!formState.validity.email && (
						<span>Please enter a valid email address.</span>
					)}
				</label>
				<br />
				<label htmlFor="twitterHandle">
					Twitter
					<input {...text('twitterHandle')} disabled={updatingUser} />
				</label>
				<br />
				<label htmlFor="password">
					New Password
					<input
						required
						minLength="8"
						autoComplete="new-password"
						disabled={updatingUser}
						{...password('password')}
						onFocus={() => setValidationErrors({ password: '' })}
					/>
					<br />
					{formState.touched.password && !formState.validity.password && (
						<span>Your password must be at least 8 characters long.</span>
					)}
					{validationErrors && validationErrors.password && (
						<span>{validationErrors.password}</span>
					)}
				</label>
				<br />
				<label htmlFor="confirmPassword">
					Confirm Password
					<input
						autoComplete="new-password"
						disabled={updatingUser}
						{...password('confirmPassword')}
						onFocus={() => setValidationErrors({ password: '' })}
					/>
				</label>
				<br />
				<button disabled={submitDisabled} type="submit">
					{updatingUser ? 'Saving...' : 'Save Changes'}
				</button>
			</form>
		</div>
	);
};

const USER = gql`
	query user {
		authenticatedUser {
			id
			name
			email
			twitterHandle
			wallet
			rsvps {
				id
				paid
				startTime
				endTime
				amount
				event {
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

const UPDATE_USER = gql`
	mutation UpdateUser(
		$userId: ID!
		$name: String
		$email: String
		$twitterHandle: String
		$password: String
	) {
		updateUser(
			id: $userId
			data: {
				name: $name
				email: $email
				twitterHandle: $twitterHandle
				password: $password
			}
		) {
			id
			wallet
			name
			email
			twitterHandle
		}
	}
`;
