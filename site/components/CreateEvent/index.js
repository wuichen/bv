import React, { Component, useState, useCallback, useEffect } from 'react';
import {
	Button,
	Field,
	Group,
	Label,
	Link,
	Input
} from '../../primitives/forms';
import { useToasts } from 'react-toast-notifications';
import { useMutation, useQuery } from 'react-apollo';
import gql from 'graphql-tag';
import { AvatarUpload } from '../AvatarUpload';
import { USER } from '../../graphql/users';
import { GET_ALL_EVENTS } from '../../graphql/events';

const onChange = handler => e => handler(e.target.value);

const ServiceCard = ({ service, startEvent }) => {
	const onChange = e => {
		service.description = e.target.value;
	};
	return (
		<div
			style={{
				margin: '30px',
				padding: '30px',
				width: '200px',
				boxShadow: '0px 4px 10px rgba(0,0,0,0.1)',
				borderRadius: '8px'
			}}
		>
			<h3>{service.name}</h3>
			<h3>{service.description}</h3>
			<h3>${service.rate}</h3>
			<p>備註：</p>
			<Input type="text" onChange={onChange} />
			<Button onClick={() => startEvent(service)}>開始</Button>
		</div>
	);
};

const CreateEvent = ({ setTab }) => {
	const [user, setUser] = useState(null);
	const { addToast } = useToasts();

	const { data, error, loading } = useQuery(USER);

	useEffect(() => {
		if (data && data.authenticatedUser) {
			setUser(data.authenticatedUser);
		}
	}, [data]);

	const [isLoading, setIsLoading] = useState(false);
	const [errorState, setErrorState] = useState(false);
	const [validationErrors, setValidationErrors] = useState({});
	const [createEvent] = useMutation(CREATE_EVENT);

	const startEvent = async service => {
		setIsLoading(true);
		const refetch = () => [
			{
				query: USER
			},
			{
				query: GET_ALL_EVENTS
			}
		];

		try {
			await createEvent({
				variables: {
					userId: user.id,
					serviceId: service.id,
					description: service.description,
					rate: service.rate,
					name:
						service.name +
						' at ' +
						new Date().getFullYear() +
						'/' +
						new Date().getMonth() +
						'/' +
						new Date().getDate(),
					startTime: new Date().toISOString(),
					status: 'active'
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
		setTab('list');
	};

	return (
		<>
			{errorState && (
				<p css={{ color: colors.red }}>
					Please check your email and password then try again.
				</p>
			)}
			<div style={{ display: 'flex' }}>
				{user &&
					user.services &&
					user.services.map(service => {
						return <ServiceCard startEvent={startEvent} service={service} />;
					})}
			</div>
			{/*<form noValidate onSubmit={handleSubmit}>
				{user && user.services && (
					<Field>
						<Label htmlFor="type">選擇服務</Label>
						<select
							defaultValue=""
							onChange={() => {}}
							style={{
								border: 'none',
								marginRight: '40px',
								height: '40px',
								width: '150px'
							}}
						>
							{user.services.map(service => {
								return <option value={service.id}>{service.name}</option>;
							})}
						</select>
					</Field>
				)}
				<Field>
					<Label htmlFor="name">活動名稱</Label>
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
					<Label htmlFor="address">活動地址</Label>
					<Input
						autoComplete="address"
						autoFocus
						disabled={isLoading}
						onChange={onChange(setLocationAddress)}
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
					{isLoading ? 'Creating...' : 'Create'}
				</Button>
			</form>*/}
		</>
	);
};

const CREATE_EVENT = gql`
	mutation CreateEvent(
		$userId: ID!
		$name: String
		$serviceId: ID!
		$description: String
		$startTime: DateTime!
		$status: EventStatusType
		$rate: Int!
	) {
		createEvent(
			data: {
				name: $name
				description: $description
				startTime: $startTime
				service: { connect: { id: $serviceId } }
				user: { connect: { id: $userId } }
				status: $status
				themeColor: "#334455"
				rate: $rate
			}
		) {
			id
			description
			name
		}
	}
`;

export default CreateEvent;
