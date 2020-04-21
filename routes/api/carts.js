const express = require("express");
const Cart = require("../../models/Cart");

const router = express.Router();

//post a product in cart
router.post("/", async (req, res) => {
  let {
    userId,
    image,
    productName,
    brandName,
    productSize,
    productUnit,
    productPrice,
    productDiscount,
    productQuantity,
  } = req.body;

  try {
    let cart = await Cart.findOne({ userId });

    let productDetails = {
      image,
      productName,
      brandName,
      productSize,
      productUnit,
      productPrice,
      productDiscount,
      productQuantity,
    };

    productDetails.productTotal =
      [productDetails.productPrice * productDetails.productQuantity] -
      [productDetails.productDiscount * productDetails.productQuantity];

    if (cart) {
      let product = cart.products.filter(
        (p) =>
          p.productName == productName &&
          p.productSize == productSize &&
          p.productUnit == productUnit
      );

      if (product.length > 0) {
        product[0].productQuantity =
          product[0].productQuantity + productQuantity;

        product[0].productTotal =
          [product[0].productPrice * product[0].productQuantity] -
          [product[0].productDiscount * product[0].productQuantity];

        cart.cartAmount = cart.products.reduce((total, single) => {
          return total + single.productTotal;
        }, 0);
        await cart.save();
        return res.json(cart);
      }

      cart.products.push(productDetails);
      cart.cartAmount = cart.products.reduce((total, single) => {
        return total + single.productTotal;
      }, 0);
      await cart.save();
      return res.json(cart);
    }

    cart = new Cart({
      userId,
    });

    cart.products[0] = productDetails;
    cart.cartAmount =
      [productDetails.productPrice * productDetails.productQuantity] -
      [productDetails.productDiscount * productDetails.productQuantity];
    await cart.save();
    return res.json(cart);
  } catch (error) {
    res.json(error);
  }
});

//get all carts
router.get("/", async (req, res) => {
  const carts = await Cart.find();
  return res.json(carts);
});

//get cart by user id
router.get("/:id", async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.params.id });
    return res.json(cart);
  } catch (error) {
    return res.status(404).json("id not found");
  }
});

//delete a product form cart
router.delete("/:userId/product/:productId", async (req, res) => {
  const { userId, productId } = req.params;
  try {
    let cart = await Cart.findOne({ userId });

    if (cart) {
      let product = cart.products.filter((p) => p._id != productId);
      cart.products = product;
      await cart.save();
      res.json(cart);
    }
  } catch (error) {
    return res.status(404).json("id not found");
  }
});

//delete a cart by user id
router.delete("/:id", async (req, res) => {
  try {
    const cart = await Cart.deleteOne({ userId: req.params.id });
    return res.json("deleted successfully");
  } catch (error) {
    return res.status(404).json("id not found");
  }
});

module.exports = router;
