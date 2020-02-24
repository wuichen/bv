/** @jsx jsx */
import { Query } from 'react-apollo';
import getConfig from 'next/config';
import { jsx } from '@emotion/core';

import Link from 'next/link';
import EventItems from '../components/EventItems';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Meta from '../components/Meta';
import { GET_CURRENT_EVENTS, GET_HAPPENING_EVENTS } from '../graphql/events';
import { GET_EVENT_RSVPS } from '../graphql/rsvps';
import { GET_SPONSORS } from '../graphql/sponsors';

import Talks from '../components/Talks';
import Rsvp from '../components/Rsvp';
import {
	AvatarStack,
	Container,
	Error,
	Hero,
	Html,
	Loading,
	MicrophoneIcon,
	PinIcon,
	UserIcon
} from '../primitives';
import { H2, H3 } from '../primitives/Typography';
import { colors, gridSize, fontSizes } from '../theme';
import {
	isInFuture,
	formatFutureDate,
	formatPastDate,
	getForegroundColor,
	pluralLabel
} from '../helpers';
import { mq } from '../helpers/media';
import { Component } from 'react';

const { publicRuntimeConfig } = getConfig();

// Featured Event
const FeaturedEvent = ({ isLoading, error, event }) => {
	if (isLoading && !event) {
		return <Loading isCentered />;
	}
	if (error) {
		console.error('Failed to render the featured event', error);
		return null;
	}
	if (!isLoading && !event) {
		return null;
	}

	const {
		description,
		id,
		locationAddress,
		maxRsvps,
		name,
		startTime,
		talks,
		themeColor
	} = event;
	const prettyDate = isInFuture(startTime)
		? formatFutureDate(startTime)
		: formatPastDate(startTime);

	const hex = themeColor ? themeColor.slice(1) : null;

	return (
		<Container css={{ margin: '-7rem auto 0', position: 'relative' }}>
			<div css={{ boxShadow: '0px 4px 94px rgba(0, 0, 0, 0.15)' }}>
				<div
					css={{
						backgroundColor: themeColor,
						color: getForegroundColor(themeColor),
						display: 'block',
						padding: '2rem'
					}}
				>
					<div css={mq({ display: 'flex', flexDirection: ['column', 'row'] })}>
						<div
							css={{
								flex: 1,
								display: 'flex',
								flexDirection: 'column',
								justifyContent: 'space-between'
							}}
						>
							<div>
								<p
									css={{
										textTransform: 'uppercase',
										marginTop: 0,
										fontWeight: 500,
										marginBottom: gridSize
									}}
								>
									{prettyDate}
								</p>
								<Link
									href={`/event/[id]?hex=${hex}`}
									as={`/event/${id}?hex=${hex}`}
									passHref
								>
									<a
										css={{
											color: 'inherit',
											textDecoration: 'none',
											':hover': { textDecoration: 'underline' }
										}}
									>
										<H3>{name}</H3>
									</a>
								</Link>
							</div>
							<p
								css={{ alignItems: 'center', display: 'flex', fontWeight: 300 }}
							>
								<PinIcon css={{ marginRight: '0.5em' }} />
								{locationAddress}
							</p>
						</div>
						<Html
							markup={description}
							css={mq({
								flex: 1,
								padding: [0, '0 2rem'],

								p: {
									'&:first-of-type': { marginTop: 0 },
									'&:last-of-type': { marginBottom: 0 }
								}
							})}
						/>
					</div>
				</div>
				<div css={{ padding: '1.5rem', background: 'white' }}>
					<div
						css={mq({
							alignItems: 'center',
							display: 'flex',
							flexDirection: ['column', 'row'],
							justifyContent: 'space-between'
						})}
					>
						<Rsvp event={event} themeColor={themeColor}>
							{({ message, component }) => component || message}
						</Rsvp>
						<div
							css={{
								alignItems: 'center',
								display: 'flex',
								flex: 1,
								justifyContent: 'flex-end'
							}}
						>
							{/*<div
								css={{
									alignItems: 'center',
									display: 'flex',
									fontWeight: 300,
									padding: '0 1rem'
								}}
							>
								<MicrophoneIcon color="#ccc" css={{ marginRight: '0.5em' }} />
								{pluralLabel(talks.length, 'talk', 'talks')}
							</div>*/}
							<Query query={GET_EVENT_RSVPS} variables={{ event: id }}>
								{({ data, loading, error }) => {
									if (loading && !data) return <Loading />;
									if (error) return <Error error={error} />;

									const { allRsvps } = data;

									if (!allRsvps) return null;

									const attending = `${allRsvps.length}${
										maxRsvps ? `/${maxRsvps}` : ''
									}`;

									return (
										<>
											<div
												css={{
													alignItems: 'center',
													display: 'flex',
													fontWeight: 300,
													padding: '0 1rem'
												}}
											>
												<UserIcon color="#ccc" css={{ marginRight: '0.5em' }} />
												{attending}{' '}
												{isInFuture(startTime) ? 'attending' : 'attended'}
											</div>
											<AvatarStack
												users={allRsvps
													.filter(rsvp => rsvp.user)
													.map(rsvp => rsvp.user)}
												size="small"
											/>
										</>
									);
								}}
							</Query>
						</div>
					</div>
				</div>
			</div>
		</Container>
	);
};

const Sponsors = () => {
	return (
		<Container css={{ textAlign: 'center' }}>
			<H3>Our sponsors</H3>
			<Query query={GET_SPONSORS}>
				{({ data, loading, error }) => {
					if (loading) return <Loading />;
					if (error) return <Error error={error} />;

					const { allSponsors } = data;
					return (
						<ul
							css={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								listStyle: 'none',
								padding: 0
							}}
						>
							{allSponsors.map(sponsor => (
								<li key={sponsor.id} css={{ flex: 1, margin: 12 }}>
									<a href={sponsor.website} target="_blank">
										{sponsor.logo ? (
											<img
												alt={sponsor.name}
												css={{ maxWidth: '100%', maxHeight: 140 }}
												src={sponsor.logo.publicUrl}
											/>
										) : (
											sponsor.name
										)}
									</a>
								</li>
							))}
						</ul>
					);
				}}
			</Query>
		</Container>
	);
};

function processHappeningEvent(data) {
	if (data && data.allEvents && data.allEvents.length > 0) {
		return {
			featuredEvent: data.allEvents[0]
		};
	}
	return {
		featuredEvent: null
	};
}

function processEventsData(data) {
	if (!data || !data.upcomingEvents || !data.previousEvents) {
		return {
			featuredEvent: null,
			moreEvents: []
		};
	}

	const upcomingEvents = data.upcomingEvents.slice();
	const previousEvents = data.previousEvents.slice();

	const featuredEvent = upcomingEvents.length
		? upcomingEvents.pop()
		: previousEvents.pop() || null;
	const moreEvents = [];

	for (let i = 0; i < 3; i++) {
		if (upcomingEvents.length) {
			moreEvents.push(upcomingEvents.pop());
		} else if (previousEvents.length) {
			moreEvents.push(previousEvents.pop());
		}
	}

	return {
		featuredEvent,
		moreEvents
	};
}

export default class Home extends Component {
	static getInitialProps() {
		return {
			now: new Date().toISOString()
		};
	}

	render() {
		const now = this.props.now;
		const { meetup } = publicRuntimeConfig;

		return (
			<Query query={GET_HAPPENING_EVENTS}>
				{({ data: eventsData, loading: eventsLoading, error: eventsError }) => {
					const { featuredEvent } = processHappeningEvent(eventsData);
					return (
						<div>
							<Meta titleExclusive={meetup.name} description={meetup.intro} />
							<Navbar background={colors.greyDark} />
							<Hero title={meetup.name}>
								<Html markup={meetup.homeIntro} />
							</Hero>
							<FeaturedEvent
								isLoading={eventsLoading}
								error={eventsError}
								event={featuredEvent}
							/>
							<Container css={{ marginTop: '3rem' }}>
								{featuredEvent && featuredEvent.talks ? (
									<Talks talks={featuredEvent.talks} />
								) : null}
							</Container>
							{/*<Section css={{ padding: '3rem 0' }}>
								<Container>
									<Sponsors />
								</Container>
                </Section>*/}
							{/*moreEvents.length ? (
								<>
									<Section
										css={{
											backgroundColor: colors.greyLight,
											margin: '5rem 0',
											paddingTop: '5rem'
										}}
									>
										<Slant placement="top" fill={colors.greyLight} />
										<Container>
											<H2 hasSeparator>More Meetups</H2>
											<EventItems
												events={moreEvents}
												offsetTop
												css={{ marginTop: '3rem' }}
											/>
											<Link href="/events">
												<a
													css={{
														color: 'black',
														cursor: 'pointer',
														fontSize: fontSizes.md,
														marginTop: '1rem',

														':hover > span': {
															textDecoration: 'underline'
														}
													}}
												>
													<span>View all</span> &rarr;
												</a>
											</Link>
										</Container>
										<Slant placement="bottom" fill={colors.greyLight} />
									</Section>
								</>
							) : null}
							<Footer />*/}
						</div>
					);
				}}
			</Query>
		);
	}
}

// styled components

const Section = props => (
	<section
		css={{
			position: 'relative'
		}}
		{...props}
	/>
);
const Slant = ({ fill, height = 5, placement }) => {
	const points =
		placement === 'bottom' ? '0, 100 0, 0 100, 0' : '0 100, 100 0, 100, 100';

	return (
		<svg
			css={{
				height: `${height}vw`,
				width: '100vw',
				display: 'block',
				position: 'absolute',
				[placement]: `-${height}vw`
			}}
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 100 100"
			preserveAspectRatio="none"
		>
			<polygon fill={fill} points={points} />
		</svg>
	);
};
