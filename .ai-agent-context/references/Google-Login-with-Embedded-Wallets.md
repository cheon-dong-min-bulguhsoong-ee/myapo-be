# Google Login with Embedded Wallets

[Google Sign-In](https://developers.google.com/identity/sign-in/web/sign-in) is a widely adopted authentication method that allows users to log in using their existing Google accounts. Embedded Wallets supports Google as a social login provider, enabling seamless onboarding and authentication experiences for users with Google credentials.

To integrate Google Sign-In with Embedded Wallets, developers must first configure a Google OAuth 2.0 Client ID in the Google Cloud Console.


## Step 1: Create a Google app​

1. Follow Google's instructions to [set up an OAuth 2.0 app.](https://support.google.com/cloud/answer/6158849?hl=en)
2. Paste the following URI as a redirect URI into the "Authorized redirect URIs" field.

`https://auth.web3auth.io/auth`
3. Obtain the OAuth Client ID from the [App on the Google Developer dashboard](https://console.developers.google.com/)

- `https://auth.web3auth.io/auth`


## Step 2: Create a Google connection​

To use this feature, enable **Google** from the Social Connections section in the [dashboard](https://dashboard.web3auth.io/).

By default, Web3Auth uses its own pre-configured credentials for Google login.

Follow these steps to create a Google connection:

1. Visit the [Embedded Wallets dashboard](https://dashboard.web3auth.io/).
2. Go to the **Social Connections** section.
3. Click the **Settings** icon near the Google connection.
4. Enter the **Auth Connection ID**.
5. Enter the **Google Client ID**.
6. Click the **Add Connection** button to save the settings.


## Usage​

Since the Google connection details are available from the dashboard, developers don't need to pass any additional parameters to the `Web3AuthProvider`.

Follow our [quickstart](https://docs.metamask.io/quickstart/?product=EMBEDDED_WALLETS&walletAggregatorOnly=NO&framework=REACT&stepIndex=0) to set up the basic flow.

```
await connectTo(WALLET_CONNECTORS.AUTH, {

  authConnection: AUTH_CONNECTION.GOOGLE,

  authConnectionId: 'w3a-google-demo',

})

```


