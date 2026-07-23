# External Integrations

**Analysis Date:** 2026-07-23

## APIs & External Services

**Payment Processing:**
- Stripe - Subscription and payment management
  - SDK/Client: `Stripe('pk_test_...')` and `Stripe('pk_live_...')` (v3 loaded from CDN in `index.html`)
  - Implementation: `src/assets/js/subService.js` - Manages customer creation, account management, and checkout
  - Environment: Test keys for development, live keys for production

**Error Tracking & Monitoring:**
- Sentry - Application error and performance monitoring
  - SDK/Client: @sentry/browser 5.27.6, @sentry/integrations, @sentry/tracing
  - DSN: `https://2efc80c955be4b38b84e67b30d23610a@o302915.ingest.sentry.io/5174522`
  - Auth: SENTRY_AUTH_TOKEN (environment variable)
  - Configuration: `src/index.js` - Initialized with Vue integration, ignoreErrors list, denyUrls for filtering
  - Release tracking: @sentry/webpack-plugin for production builds
  - Organization: "darktier-studios" project: "fatecharactersheet"

**Analytics:**
- Google Tag Manager - Web analytics and conversion tracking
  - Tracking ID: GTM-PW959XK
  - Implementation: Script tag in `index.html` with noscript fallback
  - Tracks user interactions and events

**Consent & Privacy:**
- iubenda - Cookie consent and privacy policy management
  - Site ID: 1834373
  - Cookie Policy ID: 23267044
  - Implementation: Script loaded from `//cdn.iubenda.com/cs/iubenda_cs.js`
  - Banner: float-top-center positioned
  - Configuration: Remote consent enabled

**Real-time Communication:**
- PeerJS - P2P WebRTC connections
  - SDK/Client: peerjs 1.3.1
  - Server: fcs-peer-server.herokuapp.com (custom Peer server)
  - Configuration: `src/assets/js/peerService.js`
  - Usage: Real-time game session data sharing between connected players
  - Protocol: Secure WebSocket (port 443)

## Data Storage

**Databases:**
- DynamoDB (AWS) - Primary data store for characters, campaigns, scenes, adversaries
  - Client: aws-sdk 2.799.0 with DocumentClient (apiVersion 2012-08-10)
  - Tables: 
    - `FateCharacterSheet` (production)
    - `FateCharacterSheet_dev` (development)
  - Pagination: dynamodb-paginator 0.0.9
  - Implementation: `src/assets/js/dbService.js`
  - Key schema: Partition key `owner_id`, sort key `id`
  - Indexes: "item" index for cross-owner queries
  - Access: Via authenticated Cognito credentials with AWS.CognitoIdentityCredentials

**File Storage:**
- Local filesystem only - Static assets served from `static/` and `src/assets/` directories
- No cloud file storage integration detected

**Caching:**
- Browser localStorage/sessionStorage via vue-cookies
- Memory-based Vuex store state

## Authentication & Identity

**Auth Provider:**
- Amazon Cognito User Pools - Primary authentication mechanism
  - SDK: amazon-cognito-identity-js 4.4.0
  - User Pool ID: us-east-1_x9gvO6Gy3
  - Client ID: 4hds760dsd2acikun12bpcljhk
  - Region: us-east-1
  - Implementation: `src/assets/js/userService.js`
  - Features:
    - User registration with email verification
    - Login with username/password
    - Session management with refresh tokens
    - Custom user attributes support
  - Identity Pool: us-east-1:ba495e76-4ecc-4ae5-b116-62ed4dd2a596 (for AWS credential delegation)
  - Configuration stored in Vuex store (`src/index.js` lines 124-130)

**Authorization:**
- IAM Role-based access control via AWS
  - Authorized User ARN: arn:aws:iam::210120940769:role/FateCharacterSheetUser
  - AWS Account: 210120940769
  - Users assume this role after Cognito authentication

## Monitoring & Observability

**Error Tracking:**
- Sentry (`@sentry/browser` 5.27.6)
  - Captures JavaScript errors and exceptions
  - Ignores known third-party errors (extensions, ad blockers, etc.)
  - Filters out requests to known problematic domains (Facebook, Woopra, Chrome extensions)
  - Environment-aware reporting (production, beta, local)
  - Version tracking via package.json version in `src/index.js`
  - Vue error integration with stack trace context

**Logs:**
- Sentry - Primary error logging
- Console logging - Development debugging (removed in production via Terser)
- Noty notifications - User-facing error messages (`src/assets/js/commonService.js`)

**Performance Tracing:**
- Sentry Tracing integration (@sentry/tracing 5.27.6)
- Source maps enabled in production for error symbolication

## CI/CD & Deployment

**Hosting:**
- Web-based SPA (static hosting compatible)
- Peer server: Heroku (`fcs-peer-server.herokuapp.com`)

**CI Pipeline:**
- Not detected in codebase (no GitHub Actions, GitLab CI, or Jenkins configs)

**Build Process:**
- Webpack-based multi-environment builds
- Development: `npm run dev` (webpack-dev-server with HMR)
- Beta: `npm run beta` (webpack production build)
- Production: `npm run prod` (webpack with Sentry plugin integration)
- Linting: `npm run lint` / `npm run lint:fix` (ESLint)
- Testing: `npm run test:unit` / `npm run test` (Jest)

## Environment Configuration

**Required env vars:**
- `NODE_ENV` - Build environment (development, production, beta)
- `SENTRY_AUTH_TOKEN` - Sentry API token (for webpack plugin release tracking)

**Secrets location:**
- Stripe publishable keys: Hardcoded in `src/assets/js/subService.js` (test and live)
- Sentry DSN: Hardcoded in `src/index.js`
- AWS configuration: Derived from Cognito authentication at runtime
- Other secrets: Managed outside codebase (env vars, CI/CD secrets)

**Configuration sources:**
- `process.env.NODE_ENV` - Used throughout for environment-specific behavior
- Vuex store initialization - AWS/Cognito config loaded in `src/index.js`
- Runtime Cognito session - Maintains user credentials and refresh tokens

## Webhooks & Callbacks

**Incoming:**
- Stripe webhooks - Handled server-side (backend Lambda function `FCSStripe`)
  - Subscription status updates
  - Payment confirmations
  - Customer events

**Outgoing:**
- Stripe checkout redirect - Returns to `/account` after payment
- OAuth/Cognito redirect - Redirects to requested page after login
- Sentry source map uploads - Via @sentry/webpack-plugin on production builds

## AWS Services

**Lambda:**
- `FCSStripe` function - Manages Stripe customer lifecycle and payments
  - Called from: `src/assets/js/subService.js`
  - Operations: createcustomer, getcustomer, manage (Stripe dashboard redirect), checkout
  - Credentials: AWS.CognitoIdentityCredentials

**DynamoDB:**
- Primary database for all application data
- Tables: FateCharacterSheet (prod), FateCharacterSheet_dev
- Access: AWS.DynamoDB.DocumentClient

**Cognito Identity:**
- User authentication and identity provider
- Cross-service credential provisioning via CognitoIdentityCredentials

**CloudFront/S3:**
- Implied for static asset delivery (Sentry source maps, built files)

---

*Integration audit: 2026-07-23*
