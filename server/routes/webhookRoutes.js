const functions = require('../functions');
module.exports = (router) => {
  router
    .post("/webhooks/customer/data-request", (ctx, next) => {
      console.log("We got a webhook!");
      console.log("Body:", ctx.request.body);
      ctx.response.status = 200;
    })
    .post("/webhooks/customer/redact", (ctx, next) => {
      console.log("We got a webhook!");
      console.log("Body:", ctx.request.body);
      ctx.response.status = 200;
    })
    .post("/webhooks/shop/redact", (ctx, next) => {
      console.log("We got a webhook!");
      console.log("Body:", ctx.request.body);
      ctx.response.status = 200;
    })
    .post("/webhooks/themes/create", (ctx, next) => {
      console.log("We got a webhook!");
      console.log("Body:", ctx.request.body);
      ctx.response.status = 200;
    })
    .post("/webhooks/orders/fulfilled", (ctx, next) => {
      console.log("We got a webhook!");
      // console.log("Body:", ctx.request.body);
      ctx.response.status = 200;
      // functions.checkVIP(ctx.request.body)
    })
    .post("/webhooks/orders/created", (ctx, next) => {
      console.log("We got a webhook!");
      // console.log("Body:", ctx.request.body);
      ctx.response.status = 200;
      functions.checkVIP(ctx.request.body)
    })
    .post("/webhooks/themes/delete", (ctx, next) => {
      console.log("We got a webhook!");
      console.log("Body:", ctx.request.body);
      ctx.response.status = 200;
    });
};
