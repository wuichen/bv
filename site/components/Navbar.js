/** @jsx jsx */

import { useContext, createContext } from 'react';
import getConfig from 'next/config';
import { jsx } from '@emotion/core';

import Link from 'next/link';
import { useAuth } from '../lib/authentication';
import { SignoutIcon } from '../primitives';
import { getForegroundColor, useLogoDimension } from '../helpers';
import { mq } from '../helpers/media';
import { fontSizes, gridSize, shadows } from '../theme';
import AuthModal from './auth/modal';

const ThemeContext = createContext();
const useTheme = () => useContext(ThemeContext);

const { publicRuntimeConfig } = getConfig();
const { meetup } = publicRuntimeConfig;

const NavAnchor = props => {
	const { foreground } = useTheme();
	const paddingHorizontal = [gridSize, gridSize, gridSize * 3];
	const paddingVertical = gridSize;

	return (
		<a
			css={mq({
				color: foreground,
				display: 'inline-block',
				fontSize: fontSizes.sm,
				paddingLeft: paddingHorizontal,
				paddingRight: paddingHorizontal,
				paddingBottom: paddingVertical,
				paddingTop: paddingVertical,
				textDecoration: 'none',

				':hover': {
					textDecoration: 'underline'
				}
			})}
			{...props}
		/>
	);
};
const NavLink = ({ href, as, ...props }) => (
	<Link href={href} as={as} passHref>
		<NavAnchor {...props} />
	</Link>
);
const NavButton = props => (
	<NavLink
		css={mq({
			backgroundColor: meetup.themeColor,
			border: 'none',
			borderRadius: 40,
			color: getForegroundColor(meetup.themeColor),
			fontWeight: 600,
			lineHeight: 1,
			marginRight: [0, 0],
			padding: '.9rem 2rem'
		})}
		{...props}
	/>
);

const NavText = props => {
	const { foreground } = useTheme();
	return (
		<span css={{ color: foreground, fontSize: fontSizes.sm }} {...props} />
	);
};

export const HEADER_GUTTER = [gridSize * 2, gridSize * 6];

const Header = props => {
	const { background } = useTheme();

	return (
		<header
			css={mq({
				alignItems: 'center',
				background: background,
				display: 'flex',
				paddingLeft: HEADER_GUTTER,
				paddingRight: HEADER_GUTTER
			})}
			{...props}
		/>
	);
};

const hideOnMobile = mq({
	display: ['none', 'none', 'initial']
});

// TODO: Implement log out
const UserActions = ({ user }) => {
	const { signout } = useAuth();
	const onSignout = event => {
		event.preventDefault();
		signout();
		window.location.replace('/');
	};

	return (
		<div>
			{user.isAdmin && (
				<NavAnchor css={hideOnMobile} href="/admin" target="_blank">
					Dashboard
				</NavAnchor>
			)}
			<span css={{ alignItems: 'center', display: 'inline-flex' }}>
				<NavText css={hideOnMobile}>
					<strong>{user.name}</strong>
				</NavText>
				<NavLink href="/signout" title="Sign Out" onClick={onSignout}>
					<SignoutIcon />
				</NavLink>
			</span>
		</div>
	);
};

const AnonActions = () => {
	return (
		<div>
			<AuthModal mode="signin">
				{({ openModal }) => (
					<NavLink href="/signin" onClick={openModal}>
						登入
					</NavLink>
				)}
			</AuthModal>
			<AuthModal mode="signup">
				{({ openModal }) => (
					<NavButton href="/signup" onClick={openModal}>
						加入
					</NavButton>
				)}
			</AuthModal>
		</div>
	);
};

const Navbar = ({ background = 'white', ...props }) => {
	const { isAuthenticated, user } = useAuth();
	const {
		logoWidth,
		logoHeight,
		logoWidthSm,
		logoHeightSm
	} = useLogoDimension();
	const foreground = getForegroundColor(background);

	return (
		<ThemeContext.Provider value={{ background, foreground }}>
			<Header {...props}>
				<Link href="/" passHref>
					<h1 style={{ color: 'white', marginRight: '10px' }}>BV</h1>
				</Link>
				<div css={{ flex: 1 }}>
					{/*<NavLink href="/">今日活動</NavLink>*/}
					<NavLink href="/events">活動總覽</NavLink>
					{user && <NavLink href="/profile">個人資料</NavLink>}
				</div>
				{isAuthenticated ? <UserActions user={user} /> : <AnonActions />}
			</Header>
		</ThemeContext.Provider>
	);
};

export default Navbar;
