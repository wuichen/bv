import React, { Component, useState, useCallback } from 'react';

const Bookings = ({ user }) => {
	return (
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
							alignItems: 'center',
							marginBottom: '30px'
						}}
					>
						<div>
							<h4>{rsvp.event.name}</h4>
							<h4>
								{new Date(rsvp.startTime).getFullYear()}/
								{new Date(rsvp.startTime).getMonth()}/
								{new Date(rsvp.startTime).getDate()}
							</h4>
							<div>
								<h5>使用時間</h5>
								<span>
									{new Date(rsvp.startTime).getHours()}:
									{new Date(rsvp.startTime).getMinutes()}
								</span>
								{rsvp.endTime && (
									<span>
										- {new Date(rsvp.endTime).getHours()}:
										{new Date(rsvp.endTime).getMinutes()}
									</span>
								)}
							</div>
						</div>
						<div>
							<h4>付款: {rsvp.paid ? 'Paid' : 'Not Yet'}</h4>
							<div>金額: {rsvp.amount}</div>
						</div>
					</div>
				);
			})}
		</>
	);
};
export default Bookings;
