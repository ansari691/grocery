const express = require("express");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");

const router = express.Router();

//post a order
router.post("/", async (req, res) => {
  let { userId, address, name, email, phone } = req.body;

  try {
    const cart = await Cart.findOne({ userId });

    if (cart) {
      let order = new Order({
        userId,
        address,
        name,
        email,
        phone
      });
      order.products = cart.products;
      order.orderAmount = cart.cartAmount;
      await order.save();
      await cart.remove();
      return res.json(order);
    }

    return res.status(404).json("cart is empty");
  } catch (error) {
    res.json(error);
  }
});

//get all orders
router.get("/", async (req, res) => {
  const orders = await Order.find();
  return res.json(orders);
});

//get order by order id
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    return res.json(order);
  } catch (error) {
    return res.status(404).json("id not found");
  }
});

//get orders by order status
router.get("/orderStatus/:orderStatus", async (req, res) => {
  let { orderStatus } = req.params;
  if(orderStatus == 'ordered'|| orderStatus == 'inProgress'|| orderStatus == 'delivered'){
    const orders = await Order.find({ orderStatus: orderStatus.toUpperCase() });
    return res.json(orders);
  }
  return res.status(400).json('order status not valid');
});

//get all orders of a user
router.get("/user/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    return res.json(orders);
  } catch (error) {
    return res.status(404).json("id not found");
  }
});

//assign a deliveryBoy to order
router.put("/:orderId/assignDeliveryBoy/:deliveryBoyId", async (req, res) => {
  const { orderId, deliveryBoyId } = req.params;

  try {
    const order = await Order.findById(orderId);

    if (order) {
      order.deliveryBoyId = deliveryBoyId;
      order.orderStatus = "INPROGRESS";
      await order.save();
      return res.json(order);
    }

    return res.status(404).json("id not found");
  } catch (error) {
    res.json(error);
  }
});

//count all orders
router.get("/count/all", async (req, res) => {
  try {
    const ordersCount = await Order.estimatedDocumentCount();
    return res.json(ordersCount);
  } catch (error) {
    return res.status(500).json(error);
  }
});

//delete a order by order id
router.delete("/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    return res.json(order);
  } catch (error) {
    return res.status(404).json("id not found");
  }
});




module.exports = router;
