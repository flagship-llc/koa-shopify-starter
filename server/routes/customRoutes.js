const ShopifyAPIClient = require("shopify-api-node");
const axios = require('axios');
const mongoose = require('mongoose');
require("../models/groupB");
const vipB = mongoose.model("vipB");

module.exports = (router) => {
  router
    .get('/getVipNumber', ctx => {
      console.log(ctx.query)
      vipB.find(function (err, customer) {
        if (err) return console.error(err);
        const result = customer.filter(c => c.vip_number == ctx.query.number);
        console.log("customer VIP number", result[0]);
        if (!result[0] === undefined) {
          ctx.body = {"success":"1"}
        } else {
          ctx.body = {"failure":"0"}
        }
        
      })

    })
    .get('/getVipEmail', ctx => {
      (ctx.body = 'Hello test')
      ctx.set('Access-Control-Allow-Origin', '*')
      // console.log(ctx.query)
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
