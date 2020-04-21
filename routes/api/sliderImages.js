const express = require("express");
const { check, validationResult } = require("express-validator");
const SliderImage = require("../../models/SliderImage");
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


//post a slider Image
router.post('/', upload, async (req, res) => {
    
    let sliderImage = new SliderImage({
        image : req.file.filename,
        text : req.body.text
    })

    await sliderImage.save();
    res.json(sliderImage);
});


//get all slider images
router.get('/', async (req, res) => {
    let sliderImages = await SliderImage.find();
    res.json(sliderImages);
})

//get slider image by id
router.get("/:id", async (req, res) => {
  try {
    const sliderImage = await SliderImage.findById(req.params.id);
      return res.json(sliderImage);
  } catch (error) {
    return res.status(404).json("id not found");
  }
});


//update a product by id
router.put("/:id", upload, async (req, res) => {
  try {
    let sliderImage = await SliderImage.findById(req.params.id);

    if (req.file) {
      sliderImage.image = req.file.filename;
    }

    sliderImage.text = req.body.text;
    
    await sliderImage.save();
    return res.json(sliderImage);
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, () => "image discarded");
    }
    return res.status(500).json("server error");
  }
});


module.exports = router;