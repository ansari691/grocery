const express = require("express");
const { check, validationResult } = require("express-validator");
const Product = require("../../models/Product");
const multer = require("multer");
const fs = require("fs");

const router = express.Router();

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

var upload = multer({
  storage: storage,
}).single("image");

//post a product
router.post(
  "/",
  upload,
  [
    check("productName", "product name is required").notEmpty(),
    check("productCategory", "product category is required").notEmpty(),
    check("brandName", "brand name is required").notEmpty(),
    check("productVariants", "product variant is required").notEmpty(),
    check("productDescription", "product description is required").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let {
      productName,
      productCategory,
      brandName,
      productVariants,
      productDescription,
    } = req.body;

    productVariants = productVariants.map((p) => {
      return JSON.parse(p);
    });

    try {
      //let product = await Product.findOne({ productName });

      // if (product) {
      //   return res
      //     .status(400)
      //     .json({ errors: [{ msg: "product of same name already exists" }] });
      // }

      let product = new Product({
        productName,
        productCategory,
        brandName,
        productVariants,
        productDescription,
        image: req.file.filename,
      });

      await product.save();
      return res.json(product);
    } catch (error) {
      if(req.file){
        fs.unlink(req.file.path, () => "deleted successfully");
      }
      res.json(error);
    }
  }
);

//get all products
router.get("/", async (req, res) => {
  const products = await Product.find().sort({ productCreationDate : -1 });
  return res.json(products);
});

//get product by id
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    return res.json(product);
  } catch (error) {
    return res.status(404).json("id not found");
  }
});

//update a product by id
router.put("/:id", upload, async (req, res) => {
  
  let {
    productName,
    productCategory,
    brandName,
    productDescription,
  } = req.body;

  try {
    let product = await Product.findById(req.params.id);

    if (req.file) {
      product.image = req.file.filename;
    }

    product.productName = productName;
    product.productCategory = productCategory;
    product.brandName = brandName;
    product.productDescription = productDescription;

    await product.save();
    return res.json(product);
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, () => "image discarded");
    }
    return res.status(500).json("server error");
  }
});


//add a product variant
router.post("/:productId/productVariants", async (req, res) => {
  try {
    let product = await Product.findById(req.params.productId);
    
    const { productSize, productUnit, productPrice, productDiscount } = req.body;

    const productVariant = {
      productSize,
      productUnit,
      productPrice,
      productDiscount,
    }

    if (product) {
      product.productVariants.push(productVariant);
      await product.save();
      return res.json(product);
    } else {
      return res.status(404).json("id not found");
    }
  } catch (error) {
    return res.status(500).json("server error");
  }
});


//update product variant by id
router.put("/:productId/productVariants/:variantsId", async (req, res) => {
  try {
    let product = await Product.findById(req.params.productId);

    if (product) {
      let productVariant = product.productVariants.filter(
        (pv) => pv.id == req.params.variantsId
      );
      const { productPrice, productDiscount } = req.body;

      productVariant[0].productPrice = productPrice;
      productVariant[0].productDiscount = productDiscount;

      await product.save();
      return res.json(product);
    } else {
      return res.status(404).json("id not found");
    }
  } catch (error) {
    return res.status(500).json("server error");
  }
});

//activate and deactivate poduct status by id
router.put("/:id/status/:status", async (req, res) => {
  const { id, status } = req.params;

  try {
    const product = await Product.findById(id);

    if (status == "activate") {
      product.active = true;
      await product.save();
      res.json("activated");
    } else if (status == "deactivate") {
      product.active = false;
      await product.save();
      res.json("deactivated");
    } else {
      res.status(400).json("invalid status");
    }
  } catch (error) {
    res.status(404).json(error);
  }
});


//activate and deactivate product variant status by id
router.put("/:productId/variants/:variantId/status/:status", async (req, res) => {
  const { productId, variantId, status } = req.params;

  try {
    const product = await Product.findById(productId);

    let productVariant = product.productVariants.filter(pv => pv._id == variantId);

    console.log(productVariant);

    if (status == "activate") {
      productVariant[0].active = true;
      await product.save();
      res.json("activated");
    } else if (status == "deactivate") {
      productVariant[0].active = false;
      await product.save();
      res.json("deactivated");
    } else {
      res.status(400).json("invalid status");
    }
  } catch (error) {
    res.status(404).json(error);
  }
});


//get all active products of a category
router.get('/:category/active', async (req, res) => {
  const products = await Product.find({productCategory : req.params.category, active : true });
  return res.json(products);
})


//search a product by product name
router.get('/search/:productName', async (req, res) => {
  const query = new RegExp(req.params.productName, 'i');
  const products = await Product.find({productName : query});
  return res.json(products);
});


//delete a product by id
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    fs.unlink("uploads\\" + product.image, () => "deleted successfully");
    return res.json(product);
  } catch (error) {
    return res.status(404).json("id not found");
  }
});

//delete a product variant by id
router.delete("/:productId/productVariants/:variantId", async (req, res) => {
  try {
    let product = await Product.findById(req.params.productId);
    let productVariants = product.productVariants.filter(pv => pv._id != req.params.variantId);
    product.productVariants = productVariants;
    await product.save()
    return res.json(product);
  } catch (error) {
    return res.status(404).json("id not found");
  }
});
module.exports = router;
