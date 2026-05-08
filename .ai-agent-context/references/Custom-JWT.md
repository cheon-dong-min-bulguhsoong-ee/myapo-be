# Custom JWT Login with Embedded Wallets

Embedded Wallets supports integration with custom login providers through [JWT-based](https://www.jwt.io/introduction#what-is-json-web-token) authentication schemes, allowing developers to maintain their existing authentication infrastructure while leveraging Web3Auth's wallet and key management capabilities. Custom authentication can be implemented using industry-standard cryptographic algorithms such as RSA or ECDSA signatures.

To use this feature, developers must ensure that their JWTs adhere to the [JWT specification](https://datatracker.ietf.org/doc/html/rfc7519). Each JWT must be signed using a private key, and its corresponding public key must be accessible via a [JWKS (JSON Web Key Set)](https://datatracker.ietf.org/doc/html/rfc7517) endpoint. Web3Auth will use this endpoint to verify the integrity and authenticity of incoming tokens during login.

Once the custom JWT login is working, developers can proceed to add it as a custom connection in the dashboard.


## Set up a custom JWT connection​

To use this feature, developers must go to the **Custom Connections** tab in the [dashboard](https://dashboard.web3auth.io/).

Follow these steps to create a custom JWT connection:

1. Visit the [Embedded Wallets dashboard](https://dashboard.web3auth.io/).
2. Go to the **Custom Connections** section.
3. Click on the **Settings** icon near the **Custom Connection**.
4. Enter the **Auth Connection ID**.
5. Paste the **JWKS Endpoint**.
6. Paste a sample **JWT Token** to auto populate the best **JWT validations** possible.
7. Select the **JWT user identifier**: `email`, `sub` or `custom`.
8. (Optional) Toggle the case sensitivity of `User Identifier`.
9. Click on **Add Custom Validations** to add validations manually.

Type iss as a field and `your-issuer` as a value.
Type aud as a field and `your-audience` as a value.
10. Click the **Add Connection** button to save the settings.

1. Type iss as a field and `your-issuer` as a value.
2. Type aud as a field and `your-audience` as a value.


## Create a JWT​

To generate the JWT, developers may use a package of their choice. Web3Auth provides documentation and examples using both the `jsonwebtoken` and `jose` libraries.


### Generate a private key​

Developers can generate a private key using the `openssl` command-line tool. This private key will be used to sign the ID token.

Developers can run the following command in the terminal to generate a new `privateKey.pem` file containing the `RSA256` key details.

```
openssl genrsa -out privateKey.pem 2048

```

Once the private key is generated, developers can generate the public key which can be used to verify the JWT and [convert it to JWKS](https://docs.metamask.io/embedded-wallets/authentication/custom-connections/custom-jwt/#how-to-convert-pem-to-jwks).

```
openssl rsa -in privateKey.pem -pubout -out publicKey.pem

```


### Install the JWT library​

Developers can install a JWT library of their choice. Following are the documentation and examples using both the `jsonwebtoken` and `jose` libraries.

```
npm i jsonwebtoken



npm i jose

```


### Generate a JWT​

Web3Auth provides documentation for using RSA256 and ECDSA—two of the most commonly used algorithms—for generating JWTs with the `jsonwebtoken` package. For a complete list of supported algorithms, developers can refer to the [jsonwebtoken documentation](https://www.npmjs.com/package/jsonwebtoken#algorithms-supported).

Developers can create an `index.js` file and insert the following code snippet to generate a JWT using the `RSA` algorithm.

```
import jwt from 'jsonwebtoken'

import fs from 'fs'



var privateKey = fs.readFileSync('privateKey.pem')



var token = jwt.sign(

  {

    sub: 'faj2720i2fdG7NsqznOKrthDvq43', // must be unique to each user

    name: 'Mohammad Shahbaz Alam',

    email: 'shahbaz@web3auth.io',

    aud: 'urn:my-resource-server', // -> to be used in Custom Authentication as JWT Field

    iss: 'https://my-authz-server', // -> to be used in Custom Authentication as JWT Field

    iat: Math.floor(Date.now() / 1000),

    exp: Math.floor(Date.now() / 1000) + 60 * 60,

  },

  privateKey,

  { algorithm: 'RS256', keyid: '1bb9605c36e69386830202b2d' } // <-- Replace it with your kid. This has to be present in the JWKS endpoint.

)



console.log(token)

```

Check out the [troubleshooting page](https://docs.metamask.io/embedded-wallets/troubleshooting/jwt-errors/).


## Usage​

Since the **Custom Connection** details are available from the dashboard, developers don't need to pass any additional parameters to the `Web3AuthProvider`.

Follow our [quickstart](https://docs.metamask.io/quickstart/?product=EMBEDDED_WALLETS&walletAggregatorOnly=NO&framework=REACT&stepIndex=0) to set up the basic flow.


### Log in with JWT​

```
const getIdToken = async () => {

  // Get id token from server

  const res = await fetch('http://localhost:8080/api/token', {

    method: 'POST',

    headers: {

      'Content-Type': 'application/json',

    },

  })

  const data = await res.json()

  return data?.token

}



const loginWithJWT = async () => {

  try {

    const idToken = await getIdToken()



    await connectTo(WALLET_CONNECTORS.AUTH, {

      authConnection: AUTH_CONNECTION.CUSTOM,

      authConnectionId: 'w3a-node-demo',

      idToken,

      extraLoginOptions: {

        isUserIdCaseSensitive: false,

      },

    })

  } catch (err) {

    console.error(err)

  }

}

```


## What are JWKS?​

JWKS stands for JSON Web Key Set. It's a set of keys containing the public keys that should be used to verify any JSON Web Token (JWT) issued by the authorization server and signed using the RS256 signing algorithm.


### How to create JWKS?​

- Most of the login providers that support JWT-based login will provide you this URL, such as Firebase, Google, Auth0, AWS Cognito etc.

Firebase: `https://www.googleapis.com/service_accounts/v1/jwk/{your-project-id}`
Auth0: `https://{your-domain}/.well-known/jwks.json`
Google: `https://www.googleapis.com/oauth2/v3/certs`
AWS Cognito: `https://cognito-idp.{region}.amazonaws.com/{userPoolId}/.well-known/jwks.json`
- If you are using your own custom JWT, you will need to convert your PEM file to JWKS.

- Firebase: `https://www.googleapis.com/service_accounts/v1/jwk/{your-project-id}`
- Auth0: `https://{your-domain}/.well-known/jwks.json`
- Google: `https://www.googleapis.com/oauth2/v3/certs`
- AWS Cognito: `https://cognito-idp.{region}.amazonaws.com/{userPoolId}/.well-known/jwks.json`


### How to convert PEM to JWKS​

If you're using `jose` or `jsonwebtoken` library, you can use the following steps to convert your PEM file to JWKS.

1. Create a Private Key using openssl.
openssl genrsa -out privateKey.pem 2048

This privateKey will be used to sign the token.
2. Using the above privateKey.pem file, create a Public Key.
openssl rsa -in privateKey.pem -pubout -out publicKey.pem

This publicKey.pem file will be converted to JWKS.
3. Convert the publicKey.pem file to JWKS.
Now, look for a tool that converts `.pem` to `jwk(s)` format.


One of the tools is [https://pem2jwk.vercel.app/](https://pem2jwk.vercel.app/)

Select Signing Algorithm: `RS256`
Select Public Key Use: `Signing`
Key ID: `paste-yours` or leave it blank to generate a random one.
PEM encoded key: `{paste-the-publicKey-pem-file-s-content-here}`



Click on the **Convert to JWK** button.
4. To complete the process, you need to save the output as a `.json` file, host it on your server, and make sure it's publicly accessible.
This will give you the `JWKS Endpoint`, which is required when setting up a **Custom JWT Verifier** on the Embedded Wallets dashboard.

- One of the tools is [https://pem2jwk.vercel.app/](https://pem2jwk.vercel.app/)

Select Signing Algorithm: `RS256`
Select Public Key Use: `Signing`
Key ID: `paste-yours` or leave it blank to generate a random one.
PEM encoded key: `{paste-the-publicKey-pem-file-s-content-here}`
- Click on the **Convert to JWK** button.

- Select Signing Algorithm: `RS256`
- Select Public Key Use: `Signing`
- Key ID: `paste-yours` or leave it blank to generate a random one.
- PEM encoded key: `{paste-the-publicKey-pem-file-s-content-here}`


