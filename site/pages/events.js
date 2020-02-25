/** @jsx jsx */

import { jsx } from '@emotion/core';

import { Query } from 'react-apollo';

import { Container, Loading, H2 } from '../primitives';
import EventItems from '../components/EventItems';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Meta from '../components/Meta';
import { gridSize } from '../theme';
import { Button, Field, Group, Label, Link, Input } from '../primitives/forms';
import { useState } from 'react';
import { GET_ALL_EVENTS } from '../graphql/events';
import CreateEvent from '../components/CreateEvent';
export default function Events() {
	const [tab, setTab] = useState('list');

	return (
		<>
			<Meta title="Events" />
			<Navbar background="black" />
			<Container css={{ marginTop: gridSize * 3 }}>
				<div style={{ display: 'flex', marginBottom: '40px' }}>
					<H2>活動總攬</H2>
					{tab === 'list' && (
						<Button
							onClick={() => setTab('add')}
							style={{ marginLeft: '30px' }}
						>
							新增
						</Button>
					)}
					{tab === 'add' && (
						<Button
							onClick={() => setTab('list')}
							style={{ marginLeft: '30px' }}
						>
							回到列表
						</Button>
					)}
				</div>
				{tab === 'list' && (
					<Query query={GET_ALL_EVENTS}>
						{({ data, loading, error }) => {
							if (loading) {
								return <Loading isCentered size="xlarge" />;
							}

							if (error) {
								console.error('Failed to load events', error);
								return <p>Something went wrong. Please try again.</p>;
							}

							const { allEvents } = data;
							return <EventItems events={allEvents} />;
						}}
					</Query>
				)}
				{tab === 'add' && <CreateEvent setTab={setTab} />}
			</Container>
			{/*<Footer />*/}
		</>
	);
}
