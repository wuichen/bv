import React, { Component, useState, useCallback } from 'react';
import {
	Button,
	Field,
	Group,
	Label,
	Link,
	Input
} from '../../primitives/forms';
import { useToasts } from 'react-toast-notifications';
import { useMutation } from 'react-apollo';
import gql from 'graphql-tag';
import { AvatarUpload } from '../AvatarUpload';
const onChange = handler => e => handler(e.target.value);

const ProfileInfo = ({ user }) => {
	const [email, setEmail] = useState(user.email);
	const [name, setName] = useState(user.name);

	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const { addToast } = useToasts();

	const [isLoading, setIsLoading] = useState(false);
	const [errorState, setErrorState] = useState(false);
	const [validationErrors, setValidationErrors] = useState({});
	const [updateUser] = useMutation(UPDATE_USER);

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
						name
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

	return (
		<>
			{errorState && (
				<p css={{ color: colors.red }}>
					Please check your email and password then try again.
				</p>
			)}
			<AvatarUpload userId={user.id} size="xlarge" />
			<h3>儲值: {user.wallet}</h3>

			<form noValidate onSubmit={handleSubmit}>
				<Field>
					<Label htmlFor="name">姓名</Label>
					<Input
						autoComplete="name"
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
	);
};

const UPDATE_USER = gql`
	mutation UpdateUser(
		$userId: ID!
		$name: String
		$email: String
		$twitterHandle: String
	) {
		updateUser(
			id: $userId
			data: { name: $name, email: $email, twitterHandle: $twitterHandle }
		) {
			id
			wallet
			name
			email
			twitterHandle
		}
	}
`;

export default ProfileInfo;
