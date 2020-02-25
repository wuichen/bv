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
import { USER } from '../../graphql/users';
const onChange = handler => e => handler(e.target.value);

const CreateService = ({ user, setTab }) => {
	const [type, setType] = useState('bv_split');
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');

	const [rate, setRate] = useState(0);
	const [address, setAddress] = useState('');
	const { addToast } = useToasts();

	const [isLoading, setIsLoading] = useState(false);
	const [errorState, setErrorState] = useState(false);
	const [validationErrors, setValidationErrors] = useState({});
	const [addService] = useMutation(CREATE_SERVICE);

	const handleSubmit = useCallback(
		async event => {
			event.preventDefault();

			setIsLoading(true);
			const refetch = () => [
				{
					query: USER
				}
			];

			try {
				await addService({
					variables: {
						userId: user.id,
						rate: parseInt(rate),
						name,
						type,
						address
					},
					refetchQueries: refetch
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
			setTab('service');
		},
		[name, type, rate, address]
	);

	return (
		<>
			{errorState && (
				<p css={{ color: colors.red }}>
					Please check your email and password then try again.
				</p>
			)}
			<form noValidate onSubmit={handleSubmit}>
				<Field>
					<Label htmlFor="name">服務名稱</Label>
					<Input
						autoComplete="name"
						autoFocus
						disabled={isLoading}
						onChange={onChange(setName)}
						placeholder="service name"
						required
						type="text"
						value={name}
						id="name"
					/>
				</Field>
				<Field>
					<Label htmlFor="address">服務地址</Label>
					<Input
						autoComplete="address"
						autoFocus
						disabled={isLoading}
						onChange={onChange(setAddress)}
						placeholder="Taipei yong kang"
						required
						type="text"
						value={address}
						id="address"
					/>
				</Field>
				<Field>
					<Label htmlFor="rate">價格</Label>
					<Input
						autoComplete="rate"
						disabled={isLoading}
						id="rate"
						minLength="8"
						onChange={onChange(setRate)}
						placeholder="$8"
						required
						type="text"
						value={rate}
					/>
				</Field>
				<Field>
					<Label htmlFor="type">類型</Label>
					<select
						defaultValue={type}
						onChange={onChange(setType)}
						style={{
							border: 'none',
							marginRight: '40px',
							height: '40px',
							width: '150px'
						}}
					>
						<option value="bv_split">寶來分帳</option>
						<option value="product">一般商品</option>
						<option value="recurring">定時付款</option>
						<option value="hourly">計時付款</option>
					</select>
				</Field>
				<Field>
					<Label htmlFor="description">簡介</Label>
					<Input
						autoComplete="description"
						disabled={isLoading}
						id="description"
						minLength="8"
						onChange={onChange(setDescription)}
						placeholder="description"
						required
						type="text"
						value={description}
					/>
				</Field>
				<Button disabled={isLoading} type="submit">
					{isLoading ? 'Saving...' : 'Save Changes'}
				</Button>
			</form>
		</>
	);
};

const CREATE_SERVICE = gql`
	mutation CreateService(
		$userId: ID!
		$name: String
		$type: String
		$rate: Int
		$address: String
		$description: String
	) {
		createService(
			data: {
				name: $name
				type: $type
				rate: $rate
				description: $description
				address: $address
				user: { connect: { id: $userId } }
			}
		) {
			id
			description
			name
		}
	}
`;

export default CreateService;
