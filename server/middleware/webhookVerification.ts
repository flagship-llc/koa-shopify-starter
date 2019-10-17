import crypto from "crypto";
import * as Koa from "koa";
import nullthrows from "nullthrows";

export default (ctx: Koa.ParameterizedContext, next: Function) => {
  const hmac = ctx.get("X-Shopify-Hmac-Sha256");
  const generated_hash = crypto
    .createHmac("sha256", nullthrows(process.env.SHOPIFY_SECRET))
    .update(ctx.request.rawBody, "utf8")
    .digest("base64");
  if (generated_hash == hmac) {
    next();
  } else {
    ctx.response.status = 403;
    console.log("webhook error");
  }
};
