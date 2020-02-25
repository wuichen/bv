import React from 'react';
import App from 'next/app';
import Head from 'next/head';
import gql from 'graphql-tag';
import { ApolloProvider } from 'react-apollo';
import { ToastProvider } from 'react-toast-notifications';

import withApollo from '../lib/withApollo';
import { AuthProvider } from '../lib/authentication';
import StylesBase from '../primitives/StylesBase';
import GoogleAnalytics from '../components/GoogleAnalytics';

class MyApp extends App {
	static async getInitialProps({ Component, ctx }) {
		let pageProps = {};

		const data = await ctx.apolloClient.query({
			query: gql`
				query {
					authenticatedUser {
						id
						name
						isAdmin
					}
				}
			`,
			fetchPolicy: 'network-only'
		});

		if (Component.getInitialProps) {
			pageProps = await Component.getInitialProps(ctx);
		}

		return {
			pageProps,
			user: data.data ? data.data.authenticatedUser : undefined
		};
	}

	render() {
		const { Component, pageProps, apolloClient, user } = this.props;
		return (
			<ToastProvider>
				<ApolloProvider client={apolloClient}>
					<AuthProvider initialUserValue={user}>
						<Head>
							<meta charset="utf-8" />
							<meta http-equiv="X-UA-Compatible" content="IE=edge" />
							<meta
								name="viewport"
								content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no"
							/>
							<meta name="description" content="Description" />
							<meta name="keywords" content="Keywords" />
							<title>Next.js PWA Example</title>

							<link rel="manifest" href="/manifest.json" />
							<link
								href="/favicon-16x16.png"
								rel="icon"
								type="image/png"
								sizes="16x16"
							/>
							<link
								href="/favicon-32x32.png"
								rel="icon"
								type="image/png"
								sizes="32x32"
							/>
							<link rel="apple-touch-icon" href="/apple-icon.png"></link>
							<meta name="theme-color" content="#317EFB" />
							<link
								rel="shortcut icon"
								href="/favicon.ico"
								type="image/x-icon"
							/>
							<meta
								name="viewport"
								content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
							/>
						</Head>
						<StylesBase />
						<Component {...pageProps} />
					</AuthProvider>
				</ApolloProvider>
				<GoogleAnalytics />
			</ToastProvider>
		);
	}
}

export default withApollo(MyApp);
