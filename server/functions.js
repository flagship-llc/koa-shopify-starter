const axios = require('axios');
const mongoose = require('mongoose');
require("./models/groupB");
const vipB = mongoose.model("vipB");

// remember, to update a customer metafield you need to delete what is already there

// maybe it has to be a post if no metafields exit 

const updateMetafield = (VIPnumber, customer_id, shop) => {
  const metafieldData = {
    "customer": {
        "id": 1000942534756,
        "metafields": [
          {
            "key": "vip_nuer",
            "value": 100,
            "value_type": "integer",
            "namespace": "global"
          }
        ]
      }
    }  
  
  console.log("updateMetafield", `https://${shop}/admin/customers/1000942534756.json`)
  // axios({
  //   method: 'put',
  //   url: `https://${shop}/admin/customers/${customer_id}.json`,
  //   data: metafieldData,
  //   headers: { 'X-Shopify-Access-Token': "84e4a50103442b40ebb7b232548bd925" }
  // }).then(function (message) {
  //   console.log("customer metafield updated", message)
  // }).catch(function (message) {
  //   console.log("Error:", message);
  // });
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
  updateMetafield(VIPnumber, customer_id, shop)


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
      const customer_id = '1000994996324' // the id of john test in store (not from the webhook)
      const customerEmail = customer.email
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
          if (totalSpent > 5) { // tag the customer as VIP
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


    
  };