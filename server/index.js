import dotenv from "dotenv";
dotenv.config();
import Koa from "koa";
var serve = require("koa-static");
import mount from "koa-mount";
import views from "koa-views";
import path from "path";
import session from "koa-session";
import koaWebpack from "koa-webpack";
import bodyParser from "koa-bodyparser";
import Router from "koa-router";
import shopifyAuth, {verifyRequest} from "@shopify/koa-shopify-auth";
import webpack from "webpack";
import proxy from "@shopify/koa-shopify-graphql-proxy";
const ShopifyAPIClient = require("shopify-api-node");
import webhookVerification from "../middleware/webhookVerification";
import appProxy from "../middleware/appProxy";
const functions = require('./functions');
const cors = require('@koa/cors');
const {
  SHOPIFY_SECRET,
  SHOPIFY_API_KEY,
  SHOPIFY_APP_HOST,
  NODE_ENV,
  MONGODB_URI
} = process.env;
var mongoose = require('mongoose');
const options = {useFindAndModify: false}
mongoose.connect(MONGODB_URI, options);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log("connected to database")
});


const validateWebhook = require('./webhooks');

// if total cost of all items purchased over 500HKD
// generate new VIP number
// get customer email
// put new generated VIP number and customer email in the database 
// tag that customer as VIP


// function to populate in_store_vip_number on upload 

// 

// start example

var kittySchema = new mongoose.Schema({
  name: String,
});

kittySchema.methods.speak = function () {
  var greeting = this.name
    ? "Meow name is " + this.name
    : "I don't have a name";
  console.log(greeting);
}

var Kitten = mongoose.model('Kitten', kittySchema);

var fluffy = new Kitten({ name: 'fluffy' });
fluffy.speak(); // "Meow name is fluffy"

fluffy.save(function (err, fluffy) {
  if (err) return console.error(err);
  fluffy.speak();
});

Kitten.find(function (err, kittens) {
  if (err) return console.error(err);
  // console.log(kittens);
})

// end example




//todo: add any database you want.

const registerWebhook = function(shopDomain, accessToken, webhook) {
  const shopify = new ShopifyAPIClient({
    shopName: shopDomain,
    accessToken: accessToken,
  });
  shopify.webhook
    .create(webhook)
    .then(
      (response) => console.log(`webhook '${webhook.topic}' created`),
      (err) =>
        console.log(
          `Error creating webhook '${webhook.topic}'. ${JSON.stringify(
            err.response.body,
          )}`,
        ),
    );
};
const app = new Koa();
app.use(cors());
const isDev = NODE_ENV !== "production";
app.use(views(path.join(__dirname, "views"), {extension: "ejs"}));
app.keys = [SHOPIFY_SECRET];
app.use(session(app));
app.use(bodyParser());
const router = Router();
app.use(
  shopifyAuth({
    apiKey: SHOPIFY_API_KEY,
    secret: SHOPIFY_SECRET,
    scopes: [
      "write_products",
      "read_themes",
      "write_themes",
      "read_script_tags",
      "write_script_tags",
      "read_customers",
      "write_customers",
      "read_orders",
      "read_all_orders",
      "read_checkouts",
      "write_checkouts"
    ],
    afterAuth(ctx) {
      const {shop, accessToken} = ctx.session;
      registerWebhook(shop, accessToken, {
        topic: "themes/create",
        address: `${SHOPIFY_APP_HOST}/webhooks/themes/create`,
        format: "json",
      });
      registerWebhook(shop, accessToken, {
        topic: "themes/delete",
        address: `${SHOPIFY_APP_HOST}/webhooks/themes/delete`,
        format: "json",
      });
      console.log("after auth")
      ctx.redirect("/");
    },
  }),
);
app.use(serve(__dirname + "/public"));
if (isDev) {
  const config = require("../webpack.config.js");
  const compiler = webpack(config);
  koaWebpack({compiler}).then((middleware) => {
    app.use(middleware);
  });
} else {
  const staticPath = path.resolve(__dirname, "../");
  app.use(mount("/", serve(staticPath)));
}

router.post('/webhooks/products/create', validateWebhook);

router.get("/install", (ctx) => ctx.render("install"));
// router.use(["/api"], verifyRequest()); //all requests with /api must be verified.
router.use(["/webhooks"], webhookVerification); //webhook skips verifyRequest but verified with hmac
require("./routes/webhookRoutes")(router);
require("./routes/customRoutes")(router);

app.use(router.routes()).use(router.allowedMethods());
// app.use(
//   verifyRequest({
//     fallbackRoute: "/install",
//   }),
// );
app.use(proxy());
app.use(async (ctx, next) => {
  await next();
  if (ctx.status === 404) {
    return ctx.render("app", {
      title: "Delete Me",
      apiKey: ctx.session.accessToken,
      shop: ctx.session.shop,
    });
  }
});
app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  ctx.set('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  await next();
});
export default app;