import React, { Component, useState, useCallback } from 'react';
import gql from 'graphql-tag';
import { useFormState } from 'react-use-form-state';
import { useToasts } from 'react-toast-notifications';
import { useMutation } from 'react-apollo';
import Navbar from '../components/Navbar';
import { Query } from 'react-apollo';
// import { useRouter, withRouter } from 'next/router';
import Meta from '../components/Meta';
import Bookings from '../components/Bookings';
import CreateService from '../components/CreateService';
import Services from '../components/Services';
import ProfileInfo from '../components/ProfileInfo';
import { USER } from '../graphql/users';
import { Button, Field, Group, Label, Link, Input } from '../primitives/forms';
export default () => {
	return (
		<>
			<Navbar background="black" />
			<Query query={USER}>
				{({ data, loading, error }) => {
					if (loading) {
						return <div>loading</div>;
					}
					if (error) {
						console.log(error);
						return <div>somethings wrong</div>;
					}
					if (data) {
						console.log(data);
						if (data.authenticatedUser) {
							return <NewProfile user={data.authenticatedUser} />;
						} else {
							return <div>contact steven</div>;
						}
					}
				}}
			</Query>
		</>
	);
};

// export default class ProfilePage extends Component {
// 	static async getInitialProps(ctx) {
// 		try {
// 			const { data, error } = await ctx.apolloClient.query({
// 				query: USER
// 			});
// 			// Redirect to the Signin page when the user is not logged in or if there is an error.
// 			if (!data.authenticatedUser || error) {
// 				ctx.res.redirect('/signin');
// 			}

// 			return {
// 				user: data.authenticatedUser,
// 				error: error
// 			};
// 		} catch (error) {
// 			// If there was an error, we need to pass it down so the page can handle it.
// 			return { error };
// 		}
// 	}

// 	render() {
// 		if (this.props.error) return <h1>Error loading User Profile.</h1>;
// 		return (
// 			<>
// 				<Meta title={this.props.user.name} />
// 				<Navbar background="black" />
// 				{/*<Profile {...this.props} />*/}
// 				<NewProfile {...this.props} />
// 			</>
// 		);
// 	}
// }

const NewProfile = ({ user }) => {
	const [tab, setTab] = useState('info');

	const unSelectedStyle = { backgroundColor: 'white', color: 'black' };
	const selectedStyle = { backgroundColor: 'black', color: 'white' };

	return (
		<div
			style={{
				padding: '30px'
			}}
		>
			<div style={{ marginBottom: '40px' }}>
				<Button
					style={tab === 'info' ? selectedStyle : unSelectedStyle}
					onClick={() => setTab('info')}
				>
					基本資料
				</Button>
				&nbsp;
				<Button
					style={tab === 'booking' ? selectedStyle : unSelectedStyle}
					onClick={() => setTab('booking')}
				>
					使用紀錄
				</Button>
				<Button
					style={
						tab === 'service' || tab === 'createService'
							? selectedStyle
							: unSelectedStyle
					}
					onClick={() => setTab('service')}
				>
					我的服務
				</Button>
			</div>
			{tab === 'booking' && <Bookings user={user} />}
			{tab === 'createService' && <CreateService user={user} setTab={setTab} />}
			{tab === 'service' && <Services setTab={setTab} user={user} />}
			{tab === 'info' && <ProfileInfo user={user} />}
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
