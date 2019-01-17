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
      
      if (!customer.tags.includes("VIP")) { // if customer is not VIP
        // get all orders of this customer
        const URL = `https://${shop}/admin/orders.json`
        axios.get(URL, axiosConfig)
        .then( (response) => { 
          let allOrders = response.data.orders
          // console.log(allOrders)
          // filter orders by email to get all orders made by one customer
          let customerOrders = allOrders.filter(order => order.email === customer.email)
          console.log(customerOrders.length)
          for (let i = 0; i < customerOrders.length; i++) {
            console.log(customerOrders[i])
            totalSpent += Number(customerOrders[i].total_line_items_price_set.shop_money.amount)
            console.log(totalSpent)

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