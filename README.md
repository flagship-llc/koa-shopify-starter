# Flagship Shopify App Starter code
This repository is meant as a starting boilerplate for new Flagship Shopify apps. It was heavily inspired by the Unite React Node App workshop with updated dependencies.

TODO: example for private app 

## Initial set up (+ creating Shopify app)
```
1. Download the code
> git clone ...
> npm install

2. Set up ngrok
> ngrok http -subdomain <PROJECT_NAME> 3000

3. Create new app https://partners.shopify.com/124860/apps/new
Add ngrok URL. For whitelist, add `<DOMAIN>/shopify/auth` and `<DOMAIN>/shopify/auth/callback`

After getting the app credentials
> cp .env.example .env
Update `SHOPIFY_API_KEY`, `SHOPIFY_SECRET`, and `SHOPIFY_APP_HOST`

> npm run dev

4. go to <DOMAIN>/install to install on a development shop
```
Now you can visit `http://localhost:3000/hello`, which should show `Hello world!`

## Code explained

## Useful commands
```
> npm run dev

> npm run type-check:watch

> npm run test
```

Repo sets up
- webhook 
- app proxy
- authentication on every requests

## Whats included
We have pre-configured a number of tools to get started quickly. You do not need to have a deep understanding of them for this workshop, however feel free to learn more about them in the following links.

* [babel](https://babeljs.io/) lets us use modern syntax and JSX everywhere
* [webpack](https://webpack.js.org/) compiles our client-side code into a bundle
* [prettier](https://prettier.io/) make our code look pretty and maintains consistency
* [ESLint] TODO
* [dotenv](https://github.com/motdotla/dotenv) helps configure our environment variables
* [koa](https://koajs.com/) minimalistic and modern node server framework
* [Shopify API] TODO
* [Typescript] TODO
* [Testing] TODO 