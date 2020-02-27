/** @jsx jsx */
import { Mutation, Query } from 'react-apollo';
import { jsx } from '@emotion/core';
import gql from 'graphql-tag';
import {
	Button as ButtonPrimitive,
	CheckmarkIcon,
	Loading
} from '../primitives';
import { useAuth } from '../lib/authentication';
import { GET_RSVPS, UPDATE_RSVP, ADD_RSVP } from '../graphql/rsvps';
import { isInToday } from '../helpers';
import AuthModal from './auth/modal';
import { Input } from '../primitives/forms';
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'react-apollo';
import { GET_EVENT_RSVPS } from '../graphql/rsvps';

function validateRsvp({ userRsvps, eventRsvps, event }) {
	if (!event || !event.isRsvpAvailable) {
		return {
			okay: false,
			message: null
		}; // RSVP is not available
	}

	// TODO: change this check to looking for event.endTime exists
	// if (new Date() > new Date(event.startTime)) {
	// 	return { okay: false, message: null }; // This event is in the past.
	// }

	if (
		event.maxRsvps !== null &&
		eventRsvps.length >= event.maxRsvps &&
		!userRsvps.length
	) {
		return {
			okay: false,
			message: 'Max attendees reached.'
		};
	}

	return { okay: true };
}

const Rsvp = ({ children, event, text, themeColor }) => {
	const { data, error, loading } = useQuery(GET_EVENT_RSVPS, {
		variables: {
			event: event.id
		}
	});

	const { isAuthenticated, isLoading, user } = useAuth();
	const eventId = event.id;
	// TODO: change this check to looking for event.endTime exists
	// const isPast = new Date() > new Date(event.startTime);
	const [numberOfGuests, setNumberOfGuests] = useState(1);
	if (isLoading) {
		return null;
	}

	if (!isAuthenticated) {
		return event.endTime
			? null
			: children({
					component: (
						<AuthModal mode="signin">
							{({ openModal }) => (
								<ButtonWrapper>
									<Button href="/signin" onClick={openModal}>
										登入簽到
									</Button>
								</ButtonWrapper>
							)}
						</AuthModal>
					)
			  });
	}

	return (
		<Query query={GET_RSVPS} variables={{ event: eventId, user: user.id }}>
			{({ data, loading: loadingData, error }) => {
				if (error) {
					console.error(error);
					return null;
				}

				if (loadingData) {
					return children({
						component: (
							<ButtonWrapper>
								<span css={{ marginRight: '0.5em', flex: 1 }}>{text}</span>
								<Loading size="xsmall" color={themeColor} />
							</ButtonWrapper>
						)
					});
				}

				const { userRsvps, eventRsvps, event } = data;
				const userResponse = userRsvps && userRsvps[0];
				const hasResponded = Boolean(userResponse);
				const { okay, message } = validateRsvp({
					userRsvps,
					eventRsvps,
					event
				});

				if (!okay) {
					return children({ message });
				}

				const refetch = () => [
					{
						query: GET_RSVPS,
						variables: { event: eventId, user: user.id }
					},
					{
						query: USER
					},
					{
						query: GET_EVENT_RSVPS,
						variables: { event: eventId }
					}
				];

				return (
					<Mutation
						mutation={hasResponded ? UPDATE_RSVP : ADD_RSVP}
						refetchQueries={refetch}
					>
						{(
							updateRsvp,
							{ error: mutationError, loading: mutationLoading }
						) => {
							if (mutationError) {
								return children({ message: mutationError.message });
							}

							const doRespond = status =>
								updateRsvp({
									variables: {
										rsvp: hasResponded ? userResponse.id : null,
										event: eventId,
										user: user.id,
										numberOfGuests,
										startTime:
											status === 'yes' ? new Date().toISOString() : null,
										status
									}
								});
							const respondYes = () => doRespond('yes');
							const respondNo = () => doRespond('no');

							const isGoing = hasResponded
								? userResponse.status === 'yes'
								: false;
							const thisMoment = new Date();
							return children({
								component: (
									<ButtonWrapper>
										{userResponse && userResponse.status === 'yes' ? (
											<Button
												disabled={mutationLoading || !!userResponse.endTime}
												isSelected={userResponse.endTime}
												background={themeColor}
												onClick={async () => {
													try {
														const timeDifference =
															thisMoment - new Date(userRsvps[0].startTime);
														const timeDifferenceInHour =
															timeDifference / 3600000;
														const timeDifferenceInHourWithTimesGuestNumber =
															timeDifferenceInHour *
															(userRsvps[0].numberOfGuests
																? userRsvps[0].numberOfGuests
																: 1);

														const roomRateDivideCurrentGuestsCount =
															event.rate /
															eventRsvps.reduce((total, rsvp) => {
																return (
																	(rsvp.numberOfGuests
																		? rsvp.numberOfGuests
																		: 1) + total
																);
															}, 0);

														const timeDifferenceInHourWithTimesGuestNumberTimesRate =
															timeDifferenceInHourWithTimesGuestNumber *
															roomRateDivideCurrentGuestsCount;

														const final = Math.floor(
															timeDifferenceInHourWithTimesGuestNumberTimesRate
														);

														console.log(
															thisMoment,
															new Date(userRsvps[0].startTime),
															timeDifference,
															timeDifferenceInHour,
															timeDifferenceInHourWithTimesGuestNumber,
															final
														);
														await updateRsvp({
															variables: {
																rsvp: userResponse.id,
																user: user.id,
																status: userResponse.status,
																amount: final,
																endTime: thisMoment.toISOString()
															}
														});
													} catch (err) {
														console.log(err);
													}
												}}
											>
												{userResponse.endTime ? '已簽退' : '簽退'}
											</Button>
										) : (
											<>
												<span css={{ marginRight: '0.5em', flex: 1 }}>
													{text}
												</span>

												<select
													defaultValue={numberOfGuests}
													onChange={e => {
														setNumberOfGuests(parseInt(e.target.value));
													}}
													style={{
														border: 'none',
														marginRight: '40px',
														height: '40px',
														width: '40px'
													}}
												>
													<option value={1}>1</option>
													<option value={2}>2</option>
													<option value={3}>3</option>
													<option value={4}>4</option>
												</select>
												<Button
													disabled={mutationLoading || isGoing}
													isSelected={hasResponded && isGoing}
													background={themeColor}
													onClick={respondYes}
												>
													簽到
												</Button>
												{/*<Button
													disabled={mutationLoading || !isGoing}
													isSelected={hasResponded && !isGoing}
													background={themeColor}
													onClick={respondNo}
												>
													No
                        </Button>*/}
											</>
										)}
									</ButtonWrapper>
								)
							});
						}}
					</Mutation>
				);
			}}
		</Query>
	);
};

Rsvp.defaultProps = {
	children: () => null,
	text: 'How many guests'
};

const ButtonWrapper = props => (
	<div
		css={{
			alignItems: 'center',
			display: 'flex',
			flex: 1,
			minHeight: 40 // NOTE: stop jumping around when no buttons
		}}
		{...props}
	/>
);

const Button = ({ background, children, isSelected, ...props }) => (
	<ButtonPrimitive
		css={{
			boxSizing: 'border-box',
			marginLeft: '0.25em',
			minWidth: 92
		}}
		background={isSelected ? background : null}
		outline={!isSelected}
		size="small"
		{...props}
	>
		{isSelected ? (
			<CheckmarkIcon size={16} stroke={3} css={{ marginRight: '0.25rem' }} />
		) : null}
		{children}
	</ButtonPrimitive>
);

const UPDATE_USER = gql`
	mutation UpdateUser($userId: ID!, $wallet: Int!) {
		updateUser(id: $userId, data: { wallet: $wallet }) {
			id
			name
			email
			wallet
		}
	}
`;

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

export default Rsvp;
