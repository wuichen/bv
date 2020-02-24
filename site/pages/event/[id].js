/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Component } from 'react';
import { Query } from 'react-apollo';

import Rsvp from '../../components/Rsvp';
import {
	Avatar,
	Container,
	Error,
	Hero,
	H1,
	H2,
	Html,
	Loading
} from '../../primitives';
import Talks from '../../components/Talks';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Meta, { makeMetaUrl } from '../../components/Meta';
import { fontSizes, gridSize } from '../../theme';
import { GET_EVENT_DETAILS } from '../../graphql/events';
import {
	isInFuture,
	formatFutureDate,
	isInToday,
	formatPastDate,
	stripTags
} from '../../helpers';
import { mq } from '../../helpers/media';

export default class Event extends Component {
	static async getInitialProps({ query }) {
		const { id, hex } = query;
		return { id, loadingColor: hex ? `#${hex}` : 'currentColor' };
	}

	render() {
		const { id, loadingColor } = this.props;

		return (
			<Query query={GET_EVENT_DETAILS} variables={{ event: id }}>
				{({ data, loading, error }) => {
					if (loading)
						return <Loading isCentered color={loadingColor} size="xlarge" />;

					if (error) {
						console.error('Failed to load event', id, error);
						return (
							<Error message="Something went wrong. Please try again later." />
						);
					}
					if (!data.Event) {
						return <p>Event not found</p>;
					}

					const {
						description,
						name,
						startTime,
						endTime,
						locationAddress,
						themeColor,
						talks
					} = data.Event;
					const { allRsvps } = data;
					const prettyDate = endTime
						? formatFutureDate(startTime)
						: formatPastDate(startTime);

					const metaDescription = `${prettyDate} -- ${stripTags(description)}`;

					return (
						<>
							<Meta title={name} description={stripTags(description)}>
								<meta property="og:description" content={metaDescription} />
								<meta property="og:url" content={makeMetaUrl(`/event/${id}`)} />
								<meta property="og:title" content={name} />
								<meta property="og:type" content="article" />
								<meta name="twitter:description" content={metaDescription} />
							</Meta>
							<Navbar background={themeColor} />
							<Hero
								align="left"
								backgroundColor={themeColor}
								superTitle={prettyDate}
								title={name}
							>
								<p css={{ fontWeight: 100 }}>{locationAddress}</p>
								<Html markup={description} />
							</Hero>

							<Container
								css={{ marginTop: gridSize * 3, marginBottom: '150px' }}
							>
								<div css={mq({ float: [null, 'right'] })}>
									<Rsvp event={data.Event} themeColor={themeColor}>
										{({ message, component }) => component || message}
									</Rsvp>
								</div>
								{/*<H2
									hasSeparator
									css={mq({ marginBottom: '2rem', marginTop: ['2rem', null] })}
								>
									Talks
								</H2>
								<Talks talks={talks} />*/}

								<div css={{ textAlign: 'center', marginTop: '3em' }}>
									<H1 as="h3">
										{allRsvps.reduce((total, rsvp) => {
											return (
												(rsvp.numberOfGuests ? rsvp.numberOfGuests : 1) + total
											);
										}, 0)}
									</H1>
									<div css={{ fontSize: fontSizes.md }}>
										{isInToday(startTime)
											? 'People are attending this event'
											: 'People attended this event'}
									</div>

									<div
										css={{
											display: 'flex',
											flexWrap: 'wrap',
											justifyContent: 'center',
											marginTop: '3em'
										}}
									>
										{allRsvps
											.filter(rsvp => rsvp.user)
											.map(rsvp => (
												<div
													key={rsvp.id}
													css={{ marginLeft: '20px', marginRight: '20px' }}
												>
													<Avatar
														alt={`${rsvp.user.name} Avatar`}
														name={rsvp.user.name}
														src={rsvp.user.image && rsvp.user.image.small}
													/>
													<div>{rsvp.user.name}</div>
												</div>
											))}
									</div>
								</div>
							</Container>
							{/*<Footer />*/}
						</>
					);
				}}
			</Query>
		);
	}
}
