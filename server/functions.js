const axios = require('axios');
const mongoose = require('mongoose');
require("./models/groupB");
require("./models/groupA");
const vipB = mongoose.model("vipB");
const vipA = mongoose.model("vipA");

const deleteUpdateMetafield = async (id, customer_id, shop, totalSpent, accessToken) => { 
  const deleteURL = `https://${shop}/admin/customers/${customer_id}/metafields/${id}.json`
  await axios({ // need to wait so it deletes first
    method: 'DELETE',
    url: deleteURL,
    headers: {'X-Shopify-Access-Token': accessToken}
  })
  .then((message) => {
    // put request to add metafield 
    console.log(message)
    const metafieldData = {
      "customer": {
          "id": customer_id,
          "metafields": [
            {
              "key": "total_spent",
              "value": totalSpent,
              "value_type": "integer",
              "namespace": "global"
            }
          ]
        }
      }
    // check if metafield exists 
    axios.put(
      `https://${shop}/admin/customers/${customer_id}.json`,
      metafieldData,
      {
        headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
        }
      }
    ).then(response => console.log(response))
    .catch(err => console.log(err))
  })
  .catch(err => console.log(err))
}



const updateMetafieldTotalSpent = async (totalSpent, customer_id, shop, accessToken) => {
  const URL = `https://${shop}/admin/customers/${customer_id}/metafields.json`
  const config = {
    headers: {
      'X-Shopify-Access-Token': accessToken,
    }
  }
  axios.get(URL, config)
  .then(async function (response) {
    console.log("metafields", response.data.metafields)
    const metafields = response.data.metafields
    if (metafields.length !== 0) { // if there is a metafield need to delete it
      // if totalSpent function, then not VIP so don't need to worry about multiple metafields to delete
      const metafieldFilter = metafields.filter(customer => customer.key === "total_spent")
      console.log("metaFieldfilter", metafieldFilter)
      const idToDelete = metafieldFilter[0].id
      // this is undefined if it is then don't need to delete 
      console.log("id to delete", idToDelete)
      if (idToDelete !== undefined) { // if there is no metafield to delete
        console.log("deleteUpdateMetafield")
        deleteUpdateMetafield(idToDelete, customer_id, shop, totalSpent, accessToken)
      } 
    } else {
        // no metafield exists yet 
        console.log("metafield length is 0")
        const metafieldData = {
          "customer": {
              "id": customer_id,
              "metafields": [
                {
                  "key": "total_spent",
                  "value": totalSpent,
                  "value_type": "integer",
                  "namespace": "global"
                }
              ]
            }
          }
        // check if metafield exists 
        axios.put(
          `https://${shop}/admin/customers/${customer_id}.json`,
          metafieldData,
          {
            headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json'
            }
          }
        ).then(response => console.log(response))
        .catch(err => console.log(err))
    }
  })
  .catch(err => {
    console.log(err)
  })

}

const updateMetafieldVIP = (VIPnumber, customer_id, shop, accessToken) => {
  const metafieldData = {
    "customer": {
        "id": customer_id,
        "metafields": [
          {
            "key": "vip_number",
            "value": VIPnumber,
            "value_type": "integer",
            "namespace": "global"
          }
        ]
      }
    }  

  // check if metafield exists 
  axios.put(
    `https://${shop}/admin/customers/${customer_id}.json`,
    metafieldData,
    {
      headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json'
      }
    }
  ).then(response => console.log(response))
  .catch(err => console.log(err))
}

const addVIPcustomer = async (VIPnumber, email, customer_id, shop, accessToken) => {
  const newCustomer = await new vipB({
    vip_number: VIPnumber,
    customer_email: email
  }).save()
  // update their metafield
  updateMetafieldVIP(VIPnumber, customer_id, shop, accessToken)
}

const generateVIPNumber = (email, customer_id, shop, accessToken) => { 
  vipB.find(function (err, customer) {
    if (err) return console.error(err);
    console.log("customer database", customer);
    const lastVIPcustomer = customer.pop()
    // add 1 to previous VIP number and add to database
    addVIPcustomer(lastVIPcustomer.vip_number + 1, email, customer_id, shop, accessToken)
  })
}

module.exports = {

    checkVIP: (res) => {
      const customer = res.customer
      console.log("customer object", customer)
      const shop = "hkfrancfranc.myshopify.com"
      const accessToken = "417ef1fbb01349d7c1ea11dea7bd9847"
      const axiosConfig = {
        headers: { 'X-Shopify-Access-Token': accessToken }
      };
      let totalSpent = 0
      // test webhook customer can not be manipulated 
      // const customer_id = '1128559870052' // to test specific customer
      const customer_id = customer.id
      const customerEmail = customer.email // email from the webhook
      console.log(customerEmail)

      if (!customer.tags.includes("VIP")) { // if customer is not VIP
        // get all orders of this customer
        const getURL = `https://${shop}/admin/customers/${customer_id}/orders.json`
        // filter by finiancial status paid 
        // add since refunds negative 
        // untag if less (get all tags since look like this "VIP,myTag") and take out VIP but keep rest and replace (split by comma to get just VIP)
        axios.get(getURL, axiosConfig)
        .then( (response) => { 
          let customerOrders = response.data.orders
          // console.log(customerOrders)
          for (let i = 0; i < customerOrders.length; i++) {
            // console.log(customerOrders[i])
            totalSpent += Number(customerOrders[i].total_line_items_price_set.shop_money.amount) - Number(customerOrders[i].total_discounts_set.shop_money.amount)
            console.log(totalSpent)
          }
          if (totalSpent >= 5000) { 
            console.log("total spent")
            const customerVIP = {
              "customer": {
                "id": customer_id,
                "tags": "VIP"
              }
            }
            axios({
              method: 'put',
              url: `https://${shop}/admin/customers/${customer_id}.json`,
              data: customerVIP,
              headers: { 'X-Shopify-Access-Token': accessToken }
            }).then(function (message) {
              console.log("customer tagged as VIP"); // notify customer
              generateVIPNumber(customerEmail, customer_id, shop, accessToken)
              
            }).catch(function (message) {
              console.log("Error:", message);
            });
          } else { // does not meet totalSpent requirments
            updateMetafieldTotalSpent(totalSpent, customer_id, shop, accessToken)
          }
          }).catch( (error) => {
            console.log(error)
          });
      }
    },

    saveSchemaA: async (vip_number) => {
      let newVipNumber = await new vipA({
        in_store_vip_number: vip_number,
        used_online: false
      }).save()
      console.log("newVipNumber", newVipNumber)
    },

    updateUsedOnline: async (vip_number) => {
      const query = {'in_store_vip_number': vip_number}
      const customerObj = await vipA.findOneAndUpdate(query, {'used_online': true})
      console.log("customerObj", customerObj)
    }


    
  };