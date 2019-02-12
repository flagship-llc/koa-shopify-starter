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
const functions = require('../functions');
const bcrypt = require('bcrypt');
const saltRounds = 10;
// const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';

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
    // .post('/checkVipNumber', async (ctx, next) => { 
    //   // ctx.request.body is post params
    //   // send with post body {vip_number: myNu mber}
    //   // const customerObj = await vipA.findOne({'in_store_vip_number': ctx.request.body.vip_number})
    //   //  console.log(ctx.request.body.vip_number)
    //   console.log(ctx.request)
    //   ctx.response.status = 200
    //   ctx.set('Access-Control-Allow-Origin', '*')
    //   ctx.redirect('http://localhost:3006/');
    //   // const customerObj = await vipA.findOne({'in_store_vip_number': ctx.query.number}) 
    //   // console.log(customerObj)  
    //   // if found and bool is false -> return true 
    //   // if found and bool is true -> return false
    //   // if not found -> return false
    //   // try {
    //   //   const movie = await queries.addMovie(ctx.request.body);
    //   //   if (movie.length) {
    //   //     ctx.status = 201;
    //   //     ctx.body = {
    //   //       status: 'success',
    //   //       data: movie
    //   //     };
    //   //   } else {
    //   //     ctx.status = 400;
    //   //     ctx.body = {
    //   //       status: 'error',
    //   //       message: 'Something went wrong.'
    //   //     };
    //   //   }
    //   // } catch (err) {
    //   //   console.log(err)
    //   // }
    //   // ctx.set('Access-Control-Allow-Origin', '*')
      
    // })
    .get('/checkVipNumber', async ctx => {
      // console.log(ctx.request)
      const customerObj = await vipA.findOne({'in_store_vip_number': ctx.query.number})  
      customerObj !== null ? ctx.response.status = 202 : ctx.response.status = 418
      await functions.updateUsedOnline(ctx.query.number)
      ctx.set('Access-Control-Allow-Origin', '*')
      // need to set used_online to be true
      // ctx.response.status = 200
      // ctx.set('Access-Control-Allow-Origin', '*')
      // return next()
      // ctx.body = {"test":1}
    })
    .post('/upload', async ctx => {
      console.log(ctx.request)
      const file = ctx.request.files.file;
      const reader = fs.createReadStream(file.path);
      const stream = fs.createWriteStream(path.join(os.tmpdir(), Math.random().toString()));
      reader.pipe(stream);
      console.log('uploading %s -> %s', file.name, stream.path);
      // use the path to go from csv to json and then import to database
      const jsonArray = await csv().fromFile(stream.path);
      console.log("jsonArray", jsonArray)
      jsonArray.forEach(async element => {
        console.log(element.in_store_vip_number)
        await functions.saveSchemaA(element.in_store_vip_number)
      });
      // csv()
      // .then( async (jsonObj) => {
      //   console.log(jsonObj);
      //   // iterate and save in database
      //   jsonArray.forEach(async element => {
      //     console.log(element.in_store_vip_number)
      //     let newVipNumber = await new vipA({
      //       vip_number: element.in_store_vip_number,
      //       used_online: false
      //     }).save()
      //     console.log(newVipNumber)
      //   });

      // })
      ctx.set('Access-Control-Allow-Origin', '*')
      ctx.redirect('http://localhost:3006/');
    })
    .get('/login', async ctx => { // only uses password 
      console.log("username", ctx.query.username)
      console.log("passowrd", ctx.query.password)
      let myHash = await bcrypt.hash("test", saltRounds) // could store the hash if 1 password
      const match = await bcrypt.compare(ctx.query.password, myHash);
      match ? ctx.response.status = 202 : ctx.response.status = 418
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
