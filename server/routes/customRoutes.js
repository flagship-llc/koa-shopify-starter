const ShopifyAPIClient = require("shopify-api-node");
const axios = require('axios');
const logger = require('koa-logger');
const serve = require('koa-static');
const koaBody = require('koa-body');
const Koa = require('koa');
const fs = require('fs');
const app = new Koa();
const os = require('os');
const path = require('path'); 
const mongoose = require('mongoose');
require("../models/groupB");
require("../models/groupA");
const vipB = mongoose.model("vipB");
const vipA = mongoose.model("vipA");
const csv = require('csvtojson')

// validate number and email on server

// need to make get route with VIP number parameter for group A database
// need to make post route to populate database with csv file from front end upload (file streaming)

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
    .post('/checkVipNumber', async ctx => {
      // ctx.request.body is post params
      // send with post body {vip_number: myNumber}
      const customerObj = await vipA.findOne({'in_store_vip_number': ctx.request.body.vip_number})
      console.log(ctx.request.body.vip_number)
      console.log(customerObj)
      // if found and bool is false -> return true 
      // if found and bool is true -> return false
      // if not found -> return false
      ctx.set('Access-Control-Allow-Origin', '*')
    })
    .post('/upload', async ctx => {
      console.log(ctx.request)
      const file = ctx.request.files.file;
      const reader = fs.createReadStream(file.path);
      const stream = fs.createWriteStream(path.join(os.tmpdir(), Math.random().toString()));
      reader.pipe(stream);
      console.log('uploading %s -> %s', file.name, stream.path);
      // use the path to go from csv to json and then import to database
      csv()
      .fromFile(stream.path)
      .then( async (jsonObj) => {
        console.log(jsonObj);
        // iterate and save in database
        jsonObj.forEach(async element => {
          let newVipNumber = await new vipA({
            vip_number: element.in_store_vip_number,
            used_online: element.used_online
          }).save()
          console.log(newVipNumber)
        });

      })
      ctx.set('Access-Control-Allow-Origin', '*')
      ctx.redirect('http://localhost:3006/');
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
