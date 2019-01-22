const ShopifyAPIClient = require("shopify-api-node");
const axios = require('axios');
const mongoose = require('mongoose');
require("../models/groupB");
const vipB = mongoose.model("vipB");

// validate number and email on server

module.exports = (router) => {
  router
    .get('/getVipNumber', async ctx => {
      const customerObj = await vipB.findOne({'vip_number': ctx.query.number})  
      customerObj !== null ? ctx.response.status = 202 : ctx.response.status = 418
      ctx.set('Access-Control-Allow-Origin', '*')
    })
    .get('/getVipEmail', async ctx => {
      const customerObj = await vipB.findOne({'customer_email': ctx.query.email})  
      customerObj !== null ? ctx.response.status = 202 : ctx.response.status = 418
      ctx.set('Access-Control-Allow-Origin', '*')
    })
    // post request for the VIP number file upload
    .get("/api/hello", (ctx, next) => {
      const {views, shop} = ctx.session;
      var n = views || 0;
      ctx.session.views = ++n;
      if (n === 1) ctx.body = "Welcome here for the first time!";
      else ctx.body = "You've visited this " + shop + " " + n + " times!";
    })
    .get("/api/installation", (ctx, next) => {
      const {shop, accessToken} = ctx.session;
      const shopify = new ShopifyAPIClient({
        shopName: shop,
        accessToken: accessToken,
      });
      shopify.scriptTag
        .create({
          event: "onload",
          src: "https://cdn.jsdelivr.net/npm/riot@3.13/riot.min.js",
        })
        .then(
          (response) => {
            console.log(`scriptTag created`);
            next();
          },
          (err) => {
            console.log(
              `Error creating scriptTag. ${JSON.stringify(err.response.body)}`,
            );
          },
        );
    });
};
