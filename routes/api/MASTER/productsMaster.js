const express = require("express");
const { check, validationResult } = require("express-validator");
const ProductCategory = require("../../../models/MASTER/ProductCategory");
const ProductUnit = require("../../../models/MASTER/ProductUnit");
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

//add product category
router.post("/category", upload, async (req, res) => {
  const name = req.body.name;

  const productCategory = new ProductCategory({
    name,
    image: req.file.filename,
  });

  await productCategory.save();
  return res.json(productCategory);
});

//get all product categories
router.get("/category", upload, async (req, res) => {
  const productCategories = await ProductCategory.find();
  return res.json(productCategories);
});

//update product category by id
router.put("/category/:id", upload, async (req, res) => {
  const name = req.body.name;

  try {
    const productCategory = await ProductCategory.findById(req.params.id);

    if (req.file) {
      productCategory.image = req.file.filename;
    } else if (name) {
      productCategory.name = name;
    }
    else{
        return res.json("no fields provided");
    }
    await productCategory.save();
    return res.json(productCategory);
  } catch (error) {
      return res.json("id not found");
  }
});

//activate and deactivate poduct category status
router.put("/category/:id/status/:status", async (req, res) => {
  const { id, status } = req.params;

  try {
    const productCategory = await ProductCategory.findById(id);

    if (status == "activate") {
      productCategory.active = true;
      await productCategory.save();
      res.json("activated");
    } else if (status == "deactivate") {
      productCategory.active = false;
      await productCategory.save();
      res.json("deactivated");
    } else {
      res.status(400).json("invalid status");
    }
  } catch (error) {
    res.status(404).json(error);
  }
});

//get all active categories
router.get('/category/active', async (req,res) => {
  const categories = await ProductCategory.find({active : true});
  return res.json(categories); 
})

//delete product category by id
router.delete('/category/:id', async (req, res) => {
    try {
      const productCategory = await ProductCategory.findByIdAndDelete(req.params.id);
      return res.json(productCategory);
    } catch (error) {
        return res.status(404).json('id not found');
    }
    
})

//add product units
router.post("/units", async (req, res) => {
  const productUnit = new ProductUnit({
    unitName: req.body.unitName,
  });

  await productUnit.save();
  return res.json(productUnit);
});

//get product units
router.get("/units", async (req, res) => {
  const units = await ProductUnit.find();
  return res.json(units);
})

//delete unit by id
router.delete("/units/:id", async (req, res) => {
  try {
    const unit = await ProductUnit.findByIdAndDelete(req.params.id);
    if(unit){
      return res.json(unit);
    }
    return res.status(404).json("id not found");
  } catch (error) {
    res.status(500).json("server error");
  }

})

module.exports = router;
