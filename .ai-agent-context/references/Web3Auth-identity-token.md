# Embedded Wallets identity token

The **Identity Token** (ID Token) issued by Embedded Wallets is a JSON Web Token (JWT) that contains verified identity claims about the authenticated user. This token is signed using Embedded Wallets' private key and cannot be spoofed, allowing developers to trust the identity information presented by the client.

Once a user successfully authenticates via Embedded Wallets, the platform issues an ID token which can then be used to authorize client-to-server requests or verify ownership of associated wallet addresses.


#### Purpose of the ID token​

- **User identity verification**: Ensures that the client user is indeed who they claim to be.
- **Secure backend requests**: The token should be passed in API requests to validate sessions server-side.
- **Wallet ownership proof**: Includes public wallet keys to prove a user owns a particular wallet.

When making a backend request from the frontend, the client must include this ID token to ensure the backend can verify the authenticated user.


## ID token format​

Embedded Wallets (previously Web3Auth) issues tokens as ES256-signed JWTs containing various identity claims about the user.

A sample decoded token is shown below:


## Getting the ID Token​

To retrieve the ID token on the client-side, use the `getIdentityToken()` method. This is typically called after the user logs in.

```
try {

  const idToken = await web3auth.getIdentityToken()

  console.log(idToken)

} catch (error) {

  console.error('Error authenticating user:', error)

}

```


## Verifying the ID Token​

To validate an ID token server-side, use Web3Auth's JWKS endpoint or project-specific verification key. This process ensures the JWT was issued by Web3Auth and its contents have not been tampered with.


### Using the JWKS endpoint​

JWKS Endpoint: `https://api-auth.web3auth.io/jwks`

```
import * as jose from 'jose'

import { NextRequest, NextResponse } from 'next/server'



export async function POST(req: NextRequest) {

  try {

    // Extract JWT token from Authorization header

    const authHeader = req.headers.get('authorization')

    const idToken = authHeader?.split(' ')[1]

    // Get public key from request body

    const { appPubKey } = await req.json()



    if (!idToken) {

      return NextResponse.json({ error: 'No token provided' }, { status: 401 })

    }



    if (!appPubKey) {

      return NextResponse.json({ error: 'No appPubKey provided' }, { status: 400 })

    }



    // Verify JWT using Web3Auth JWKS

    const jwks = jose.createRemoteJWKSet(new URL('https://api-auth.web3auth.io/jwks'))

    const { payload } = await jose.jwtVerify(idToken, jwks, { algorithms: ['ES256'] })



    // Find matching wallet in JWT

    const wallets = (payload as any).wallets || []

    const normalizedAppKey = appPubKey.toLowerCase().replace(/^0x/, '')



    const isValid = wallets.some((wallet: any) => {

      if (wallet.type !== 'web3auth_app_key') return false



      const walletKey = wallet.public_key.toLowerCase()



      // Direct key comparison for ed25519 keys

      if (walletKey === normalizedAppKey) return true



      // Handle compressed secp256k1 keys

      if (

        wallet.curve === 'secp256k1' &&

        walletKey.length === 66 &&

        normalizedAppKey.length === 128

      ) {

        const compressedWithoutPrefix = walletKey.substring(2)

        return normalizedAppKey.startsWith(compressedWithoutPrefix)

      }



      return false

    })



    if (isValid) {

      return NextResponse.json({ name: 'Verification Successful' }, { status: 200 })

    } else {

      return NextResponse.json({ name: 'Verification Failed' }, { status: 400 })

    }

  } catch (error) {

    console.error('Social login verification error:', error)

    return NextResponse.json({ error: 'Verification error' }, { status: 500 })

  }

}

```


### Using the verification key​

To manually verify the token, use your **Verification Key** available on the **Project Settings** page in the dashboard.

```
npm install jsonwebtoken

```

```
const verificationKey = 'insert-your-web3auth-verification-key'.replace(/\\n/g, '\n')



const idToken = 'insert-the-users-id-token'



try {

  const decoded = jwt.verify(idToken, verificationKey, {

    issuer: 'https://api-auth.web3auth.io',

    audience: 'your-project-client-id',

  })

  console.log(decoded)

} catch (error) {

  console.error(error)

}

```

The replace operation above ensures that any instances of '\n' in the stringified public key are replaced with actual newlines, per the PEM-encoded format.

If the token is valid, the payload will contain identity claims (such as, userId). If invalid, an error is thrown.


## Troubleshooting​

- The `iss` field in the token must be `https://api-auth.web3auth.io`.
- The `aud` field must match your **Project Client ID**.
- The `exp` field must be in the future.
- The `iat` field must be in the past.


