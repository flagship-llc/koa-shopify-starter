const axios = require('axios');
const mongoose = require('mongoose');
require("./models/groupB");
require("./models/groupA");
const vipB = mongoose.model("vipB");
const vipA = mongoose.model("vipA");


// maybe it has to be a post if no metafields exit 

// metaKey (either vip_number or total_spent)

const deleteUpdateMetafield = async (id, customer_id, shop, totalSpent) => { // needs to be delete and update
  const deleteURL = `https://${shop}/admin/customers/${customer_id}/metafields/${id}.json`
  await axios({ // need to wait so it deletes first
    method: 'DELETE',
    url: deleteURL,
    headers: {'X-Shopify-Access-Token': "84e4a50103442b40ebb7b232548bd925"}
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
        'X-Shopify-Access-Token': "84e4a50103442b40ebb7b232548bd925",
        'Content-Type': 'application/json'
        }
      }
    ).then(response => console.log(response))
    .catch(err => console.log(err))
  })
  .catch(err => console.log(err))


}



const updateMetafieldTotalSpent = async (totalSpent, customer_id, shop) => {
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
  const URL = `https://${shop}/admin/customers/${customer_id}/metafields.json`
  const config = {
    headers: {
      'X-Shopify-Access-Token': "84e4a50103442b40ebb7b232548bd925",
    }
  }
  axios.get(URL, config)
  .then(async function (response) {
    console.log("metafields", response.data.metafields)
    const metafields = response.data.metafields
    // a customer can have two metafields 
    // look at all metafields and see if they have "vip_number" or "total_spent" 
    // store the id of the metafield 
    // vip number need to be updated, just total_spent
    if (metafields.length !== 0) { // if there is a metafield need to delete it
      // if totalSpent function, then not VIP so don't need to worry about multiple metafields to delete
      const metafieldFilter = metafields.filter(customer => customer.key === "total_spent")
      console.log("metaFieldfilter", metafieldFilter)
      const idToDelete = metafieldFilter[0].id
      // this is undefined if it is then don't need to delete 
      console.log("id to delete", idToDelete)
      if (idToDelete !== undefined) { // if there is no metafield to delete
        console.log("deleteUpdateMetafield")
        deleteUpdateMetafield(idToDelete, customer_id, shop, totalSpent)
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
            'X-Shopify-Access-Token': "84e4a50103442b40ebb7b232548bd925",
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

const updateMetafieldVIP = (VIPnumber, customer_id, shop) => {
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
      'X-Shopify-Access-Token': "84e4a50103442b40ebb7b232548bd925",
      'Content-Type': 'application/json'
      }
    }
  ).then(response => console.log(response))
  .catch(err => console.log(err))
}

const addVIPcustomer = async (VIPnumber, email, customer_id, shop) => {
  const newCustomer = await new vipB({
    vip_number: VIPnumber,
    customer_email: email
  }).save()
  // update their metafield
  updateMetafieldVIP(VIPnumber, customer_id, shop)


}

const generateVIPNumber = (email, customer_id, shop) => { 
  // get last VIP number from database
  // return last VIP number in database + 1
  // add the new one in, along with the customer email
  vipB.find(function (err, customer) {
    if (err) return console.error(err);
    console.log("customer database", customer);
    const lastVIPcustomer = customer.pop()
    addVIPcustomer(lastVIPcustomer.vip_number + 1, email, customer_id, shop)
  })
  // return 3
}



module.exports = {

    checkVIP: (res) => {
      // console.log(res)
      // customer updated webhook (listen) if not VIP -> has email -> all orders -> shop money minus discount
      const customer = res.customer
      console.log(customer)
      const shop = "ffhk.myshopify.com"
      const accessToken = "84e4a50103442b40ebb7b232548bd925"
      const axiosConfig = {
        headers: { 'X-Shopify-Access-Token': accessToken }
      };
      let totalSpent = 0
      // test customer from the manual webhook trigger
      // only for testing, prod replace with customer.id
      const customer_id = '1084779724900' // the id of john test in store (not from the webhook)
      const customerEmail = customer.email // email from the webhook
      console.log(customerEmail)
      
      // the webhook test still triggers this because CUSTOMER is from the webhook so the VIP doesn't exist 
      // however for the id we are using, the VIP tag does exist for that customer 

      if (!customer.tags.includes("VIP")) { // if customer is not VIP
        // get all orders of this customer
        const getURL = `https://${shop}/admin/customers/${customer_id}/orders.json`
        axios.get(getURL, axiosConfig)
        .then( (response) => { 
          let customerOrders = response.data.orders
          // console.log(customerOrders)
          for (let i = 0; i < customerOrders.length; i++) {
            // console.log(customerOrders[i])
            totalSpent += Number(customerOrders[i].total_line_items_price_set.shop_money.amount) - Number(customerOrders[i].total_discounts_set.shop_money.amount)
            console.log(totalSpent)
          }
          // change to 5000 for prod
          if (totalSpent > -1) { // tag the customer as VIP
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
              generateVIPNumber(customerEmail, customer_id, shop)
              
            }).catch(function (message) {
              console.log("Error:", message);
            });
          } else { // does not meet totalSpent requirments
            updateMetafieldTotalSpent(totalSpent, customer_id, shop)
          }
          }).catch( (error) => {
            console.log(error)
          });
      }

    // if total cost of all items purchased over 500HKD
    // generate new VIP number
    // get customer email
    // put new generated VIP number and customer email in the database 
    // tag that customer as VIP
    },

    saveSchemaA: async (vip_number) => {
      let newVipNumber = await new vipA({
        in_store_vip_number: vip_number,
        used_online: false
      }).save()
      console.log("newVipNumber", newVipNumber)
    },

    updateUsedOnline: async (vip_number) => {
      // find in vipA that number
      const query = {'in_store_vip_number': vip_number}
      const customerObj = await vipA.findOneAndUpdate(query, {'used_online': true})
      console.log(customerObj)
      //const oldBool = customerObj.used_online

      // get number or id and get old boolean
      // update the used online to the opposite of whatever it is 
    }


    
  };