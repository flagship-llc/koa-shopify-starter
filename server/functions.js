const axios = require('axios');
module.exports = {
    checkVIP: (res) => {
      // console.log(res)
      // customer updated webhook (listen) if not VIP -> has email -> all orders -> shop money minus discount

      const customer = res.customer
      // console.log(customer)
      const shop = "ffhk.myshopify.com"
      const accessToken = "84e4a50103442b40ebb7b232548bd925"
      const axiosConfig = {
        headers: { 'X-Shopify-Access-Token': accessToken }
      };
      let totalSpent = 0
      // test customer from the manual webhook trigger
      // only for testing, prod replace with customer.id
      const customer_id = '1000994996324' 
      
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
              console.log("customer tagged as VIP"); // send email
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