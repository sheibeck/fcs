# Technology Stack

**Analysis Date:** 2026-07-23

## Languages

**Primary:**
- JavaScript (ES6+) - Vue.js single-file components (.vue) and supporting scripts
- SCSS/SASS - Styling throughout the application

**Secondary:**
- HTML - Template markup in Vue components and index.html

## Runtime

**Environment:**
- Node.js (version unspecified in .nvmrc)

**Package Manager:**
- npm (package-lock.json present)
- Yarn (scripts reference yarn commands)
- Lockfile: `package-lock.json` (present and maintained)

## Frameworks

**Core:**
- Vue 2.6.12 - Frontend SPA framework
- Vue Router 3.4.3 - Client-side routing
- Vuex 3.5.1 - State management

**UI Components:**
- Bootstrap 4.5.2 - CSS framework
- Bootstrap-Vue 2.17.0 - Vue components for Bootstrap
- FontAwesome 5.14.0 - Icon library

**Dev Tools:**
- Webpack 4.44.1 - Module bundler
- Webpack Dev Server 3.11.3 - Development server
- Babel 7.11.6 - JavaScript transpiler
- Vue Loader 15.9.3 - Single-file component loader

**Testing:**
- Jest 25.5.4 - Test runner (configured in `package.json`)
- Vue Test Utils 1.1.0 - Vue component testing utilities
- vue-jest 3.0.7 - Jest transformer for .vue files
- jest-serializer-vue 2.0.2 - Snapshot serializer

**Build/Optimization:**
- Terser 2.3.8 - JavaScript minification
- Mini CSS Extract Plugin 0.9.0 - CSS extraction
- Clean Webpack Plugin 3.0.0 - Build artifact cleanup
- Copy Webpack Plugin 5.1.2 - Static file copying

## Key Dependencies

**Critical:**
- amazon-cognito-identity-js 4.4.0 - Cognito identity management
- aws-sdk 2.799.0 - AWS services SDK (DynamoDB, Lambda, Cognito)
- dynamodb-paginator 0.0.9 - DynamoDB pagination helper

**UI/UX:**
- @johmun/vue-tags-input 2.1.0 - Tag input component
- @trevoreyre/autocomplete-vue 2.2.0 - Autocomplete component
- bootbox 5.4.0 - Modal dialogs
- noty 3.2.0-beta - Notification system
- vue-color 2.7.1 - Color picker component
- vue-draggable-resizable 2.2.0 - Draggable/resizable elements
- vue-dragscroll 2.1.0 - Draggable scroll
- vue-datetime 1.0.0-beta.14 - DateTime picker
- vuedraggable 2.24.1 - Vue wrapper for Sortable.js
- interactjs 1.9.22 - Touch/pointer interaction library
- @panzoom/panzoom 4.3.2 - Pan and zoom functionality

**Utilities:**
- vue-cookies 1.7.4 - Cookie management
- vue-debounce 2.5.7 - Debounce directive
- vue-append 2.0.0 - Append DOM elements
- vue-showdown 2.4.1 - Markdown rendering
- vue-meta 2.4.0 - Document head management
- luxon 1.25.0 - Date/time library
- shortid 2.2.15 - Short ID generation
- lodash-es 4.17.15 - Utility functions
- jquery 3.5.1 - jQuery (used with Bootstrap)
- popper.js 1.16.1 - Tooltip/popover positioning
- peerjs 1.3.1 - P2P WebRTC connections

**Monitoring & Analytics:**
- @sentry/browser 5.27.6 - Error tracking (client)
- @sentry/integrations 5.24.2 - Sentry integrations
- @sentry/tracing 5.27.6 - Sentry performance tracing
- @sentry/cli 1.58.0 - Sentry CLI tool
- @sentry/webpack-plugin 1.13.0 - Sentry release tracking

**Testing (Dev Dependencies):**
- babel-jest 25.5.1 - Babel transformer for Jest
- babel-core 7.0.0-bridge.0 - Babel bridge package
- @babel/core 7.11.6 - Babel core
- @babel/preset-env 7.11.5 - Babel preset for modern JavaScript
- @babel/plugin-proposal-class-properties 7.10.4 - Class properties support
- @vue/babel-preset-app 5.0.6 - Vue-optimized Babel preset

## Configuration

**Environment:**
- Webpack dev/beta/prod modes (separate config files in `build/`)
- NODE_ENV detection: `process.env.NODE_ENV`
- Environment-based DynamoDB table naming: `FateCharacterSheet` (prod) vs `FateCharacterSheet_dev`
- Environment-specific Stripe keys (test vs live)

**Build:**
- `build/webpack.config.base.js` - Base Webpack configuration with loaders and plugins
- `build/webpack.config.dev.js` - Development-specific config (HMR, dev server on localhost:8080)
- `build/webpack.config.beta.js` - Beta build configuration
- `build/webpack.config.prod.js` - Production config (minification, source maps, Sentry integration)
- `.babelrc` - Babel configuration with @vue/app preset and class properties plugin
- `.postcssrc.js` - PostCSS configuration (autoprefixer)
- `index.html` - HTML entry point with Stripe and Google Tag Manager scripts
- `jest` config in `package.json` - Jest configuration with Vue transform

**File Loaders:**
- Images (png, jpg, gif, svg) - url-loader with 10KB limit
- Media (mp4, webm, ogg, mp3, wav, flac, aac) - url-loader with 10KB limit
- Fonts (woff, woff2, eot, ttf, otf) - url-loader with 10KB limit
- CSS/SCSS - css-loader and sass-loader
- Vue files - vue-loader
- JavaScript - babel-loader

## Platform Requirements

**Development:**
- Node.js runtime
- npm/yarn package manager
- Webpack dev server for local development
- Browser with ES6+ support

**Production:**
- Deployed to web (static hosting compatible)
- Client-side SPA (no backend server required for serving)
- AWS services for backend (Cognito, DynamoDB, Lambda)
- Heroku for peer connection server (`fcs-peer-server.herokuapp.com`)

---

*Stack analysis: 2026-07-23*
