const express = require('express');
const axios = require('axios');

const { Order } = require('../models/order');
const { OrderItem } = require('../models/order-item');
const { Product } = require('../models/product');

const router = express.Router();
const stripe = require('stripe')(
  'sk_test_51K4juWSILkqWlNJOVGwBl5wESCPsQICdq8wPCi6uB3dExoC5T6hfaJ5xXWm7ZseEdGJTf8MuAxVOHq1qVclOC1ZJ00j8H6zBWd'
);

router.get(`/`, async (req, res) => {
  const orderList = await Order.find()
    .populate('user', 'name')
    .sort({ dateOrdered: -1 });
  if (!orderList) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(orderList);
});

router.get(`/:id`, async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name')
    .populate({
      path: 'orderItems',
      populate: { path: 'product', populate: 'category' },
    });

  if (!order) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(order);
});

router.post('/', async (req, res) => {
  console.log(
    '-----------------------------------------------------------------------------'
  );
  console.log(req.body.orderItems);
  console.log(
    '-----------------------------------------------------------------------------'
  );
  const orderItemsIds = Promise.all(
    req.body.orderItems.map(async (orderitem) => {
      let newOrderItem = new OrderItem({
        quantity: orderitem.quantity,
        product: orderitem.product,
      });
      newOrderItem = await newOrderItem.save();
      return newOrderItem._id;
    })
  );

  const orderItemsIdsResolved = await orderItemsIds;

  const totalPrices = await Promise.all(
    orderItemsIdsResolved.map(async (orderItemId) => {
      const orderItem = await OrderItem.findById(orderItemId).populate(
        'product',
        'price'
      );
      const totalPrice = orderItem.product.price * orderItem.quantity;
      return totalPrice;
    })
  );

  const totalPrice = totalPrices.reduce((a, b) => {
    return a + b;
  }, 0);

  console.log(totalPrices);

  let order = new Order({
    orderItems: orderItemsIdsResolved,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip.trim(),
    country: req.body.country.trim(),
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: totalPrice,
    user: req.body.user.trim(),
    longitude: req.body.longitude,
    latitude: req.body.latitude,
  });
  order = await order.save();
  if (order) {
    const states = req.body.orderItems;
    for (const prod of states) {
      const productId = prod.product;
      const quan = +prod.quantity;
      const productTarget = await Product.findById(productId);
      console.log(productTarget, '*******************************');
      const targetProductQuantity = +productTarget.countInStock;
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        {
          countInStock: targetProductQuantity - quan,
        },
        { new: true }
      );
    }
  }
  if (!order) {
    return res.status(404).send('the order cannot be created!');
  } else {
    return res.send(order);
  }
});

router.post('/create-checkout-session', async (req, res) => {
  const orderItems = req.body;
  if (!orderItems) {
    return res
      .status(400)
      .send('Checkout session cannot be created-check the order items');
  }

  const lineItems = await Promise.all(
    orderItems.map(async (orderItem) => {
      const product = await Product.findById(orderItem.product);
      return {
        price_data: {
          currency: 'inr',
          product_data: {
            name: product.name,
          },
          unit_amount: product.price * 100,
        },
        quantity: orderItem.quantity,
      };
    })
  );
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: 'http://localhost:4200/success',
    cancel_url: 'http://localhost:4200/error',
  });
  res.json({ id: session.id });
});

router.post('/create-checkout-session-khalti', async (req, res) => {
  const gotToken = req.body.token;
  const gotAmount = req.body.amount;
  console.log(gotToken);
  console.log(gotAmount);
  let data = {
    token: gotToken,
    amount: gotAmount,
  };
  console.log(data);
  console.log(
    data.token,
    typeof data.token,
    '-----------------------------------------------------------'
  );
  console.log(data.amount, typeof data.amount);
  let config = {
    headers: {
      Authorization: 'Key test_secret_key_1c29c97dd180462897bf3d160863729e',
    },
  };
  console.log(config);
  try {
    const response = await axios.post(
      'https://khalti.com/api/v2/payment/verify/',
      data,
      config
    );
    console.log(response);

    return res.status(200).json(response.data);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
  // axios
  //   .post('https://khalti.com/api/v2/payment/verify/', data, config)
  //   .then((response) => {
  //     console.log(response);
  //     return res.status(200).json(response.data);
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //     return res.status(500).json(error);
  //   });
});

router.put('/:id', async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },
    { new: true }
  );
  if (!order) {
    return res.status(404).send('the order cannot be updated!');
  }
  return res.send(order);
});

router.delete('/:id', (req, res) => {
  Order.findByIdAndRemove(req.params.id)
    .then(async (order) => {
      if (order) {
        await order.orderItems.map(async (orderItem) => {
          await OrderItem.findByIdAndRemove(orderItem);
        });
        return res
          .status(200)
          .json({ success: true, message: 'The order is deleted!' });
      } else {
        return res
          .status(404)
          .json({ success: false, message: 'Order not found!' });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

router.get('/get/totalsales', async (req, res) => {
  const totalSales = await Order.aggregate([
    { $group: { _id: null, totalsales: { $sum: '$totalPrice' } } },
  ]);
  if (!totalSales) {
    return res.status(400).send('The order sales cannot be generated');
  }
  return res.send({ totalsales: totalSales.pop().totalsales });
});

router.get(`/get/count`, (req, res) => {
  Order.countDocuments()
    .then((count) => {
      if (count) {
        return res.status(200).json({ orderCount: count });
      } else {
        return res.status(500).json({ success: false });
      }
    })
    .catch((err) => {
      return res.status(400).json({
        success: false,
        error: err,
      });
    });
});

router.get(`/get/userorders/:userid`, async (req, res) => {
  try {
    const userOrderList = await Order.find({ user: req.params.userid })
      .populate({
        path: 'orderItems',
        populate: { path: 'product', populate: 'category' },
      })
      .sort({ dateOrdered: -1 });
    res.send(userOrderList);
  } catch (err) {
    res.status(500).json({
      success: false,
    });
  }
  // const userOrderList = await Order.find({ user: req.params.userid })
  //   .populate({
  //     path: 'orderItems',
  //     populate: { path: 'product', populate: 'category' },
  //   })
  //   .sort({ dateOrdered: -1 });
  // if (!userOrderList) {
  //   res.status(500).json({
  //     success: false,
  //   });
  // }
  // res.send(userOrderList);
});

module.exports = router;
