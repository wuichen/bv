import React, { Component, useState, useCallback } from 'react';
import {
	Button,
	Field,
	Group,
	Label,
	Link,
	Input
} from '../../primitives/forms';
const Services = ({ user, setTab }) => {
	return (
		<>
			<div>
				<Button
					style={{ marginBottom: '30px' }}
					onClick={() => setTab('createService')}
				>
					新增服務
				</Button>
			</div>
			{user.services.length === 0 && 'No Services Available'}
			{user.services.map(service => {
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
							<h4>{service.name}</h4>
						</div>
					</div>
				);
			})}
		</>
	);
};
export default Services;
