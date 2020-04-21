const express = require("express");
const { check, validationResult } = require("express-validator");
const DeliveryBoy = require("../../models/DeliveryBoy");
const Order = require('../../models/Order');
const multer = require("multer");
const fs = require("fs");
const DatabaseSequence = require("../../models/DatabaseSequence");
const bcrypt = require("bcryptjs");

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

//post a delivery boy
router.post("/", upload, async (req, res) => {
  let {
    firstName,
    lastName,
    gender,
    dob,
    phone,
    email,
    aadharNo,
    panNo,
    joiningDate,
    address,
    emergencyContactName,
    emergencyContactNumber,
  } = req.body;

  let sequence = 0;
  const sequenceName = "delivery_boy_sequence";

  dob = new Date(dob);
  joiningDate = new Date(joiningDate);

  try {
    deliveryBoy = new DeliveryBoy({
      firstName,
      lastName,
      gender,
      dob,
      phone,
      email,
      aadharNo,
      panNo,
      joiningDate,
      address,
      emergencyContactName,
      emergencyContactNumber,
      image: req.file.filename,
    });

    await deliveryBoy.save();

    try {
      const databaseSequence = await DatabaseSequence.findOne({
        sequenceName,
      });
      sequence = databaseSequence.sequence;
      databaseSequence.sequence++;
      await databaseSequence.save();
    } catch {
      const databaseSequence = new DatabaseSequence({
        sequenceName,
        sequence: 1,
      });
      sequence = 1;
      await databaseSequence.save();
    }

    deliveryBoy.sequence = sequence;
    deliveryBoy.userName = "GROCYBD" + sequence;
    let id = JSON.stringify(deliveryBoy._id);
    deliveryBoy.password = deliveryBoy.firstName + id.slice(20, 25);
    const salt = await bcrypt.genSalt(10);
    deliveryBoy.password = await bcrypt.hash(deliveryBoy.password, salt);

    await deliveryBoy.save();
    return res.json(deliveryBoy);
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, () => "deleted successfully");
    }
    res.status(500).json(error);
  }
});

//logging in
router.post(
  "/login",
  [
    check("userName", "username is required").exists(),
    check("password", "password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { userName, password } = req.body;

    try {
      let deliveryBoy = await DeliveryBoy.findOne({ userName });
      if (!deliveryBoy) {
        return res
          .status(400)
          .json({ errors: [{ msg: "invalid credentials" }] });
      }

      const isMatched = await bcrypt.compare(password, deliveryBoy.password);

      if (!isMatched)
        return res
          .status(400)
          .json({ errors: [{ msg: "invalid credentials" }] });

      // const payload = {
      //     user : {
      //         id : user.id
      //     }
      // }

      // jwt.sign(payload, config.get('jwtSecret'), {expiresIn : 360000}, (err, token) => {
      //     if(err) throw err
      //     res.json({token});
      // });
      res.json(deliveryBoy);
    } catch {
      //res.status(500).json({ errors : errors.message});
      res.status(500).json({ errors: errors.message });
    }
  }
);

//get all delivery boys
router.get("/", async (req, res) => {
  const deliveryBoys = await DeliveryBoy.find();
  return res.json(deliveryBoys);
});

//get  a delivery boy by id
router.get("/:id", async (req, res) => {
  try {
    const deliveryBoy = await DeliveryBoy.findById(req.params.id);
    return res.json(deliveryBoy);
  } catch (error) {
    return res.status(404).json("id not found");
  }
});

//update a delivery boy by id
router.put("/:id", upload, async (req, res) => {
  let {
    firstName,
    lastName,
    gender,
    dob,
    phone,
    email,
    aadharNo,
    panNo,
    joiningDate,
    address,
    emergencyContactName,
    emergencyContactNumber,
  } = req.body;

  try {
    let deliveryBoy = await DeliveryBoy.findById(req.params.id);

    if (req.file) {
      deliveryBoy.image = req.file.filename;
    }

    deliveryBoy.firstName = firstName;
    deliveryBoy.lastName = lastName;
    deliveryBoy.gender = gender;
    deliveryBoy.dob = dob;
    deliveryBoy.phone = phone;
    deliveryBoy.email = email;
    deliveryBoy.aadharNo = aadharNo;
    deliveryBoy.panNo = panNo;
    deliveryBoy.joiningDate = joiningDate;
    deliveryBoy.address = address;
    deliveryBoy.emergencyContactName = emergencyContactName;
    deliveryBoy.emergencyContactNumber = emergencyContactNumber;

    await deliveryBoy.save();
    return res.json(deliveryBoy);
  } catch (error) {
    if (req.file) {
      fs.unlink(req.file.path, () => "image discarded");
    }
    return res.status(500).json("server error");
  }
});


//activate and deactivate delivery boy by id
router.put("/:id/status/:status", async (req, res) => {
  const { id, status } = req.params;

  try {
    const deliveryBoy = await DeliveryBoy.findById(id);

    if (status == "activate") {
      deliveryBoy.active = true;
      await deliveryBoy.save();
      res.json("activated");
    } else if (status == "deactivate") {
      deliveryBoy.active = false;
      await deliveryBoy.save();
      res.json("deactivated");
    } else {
      res.status(400).json("invalid status");
    }
  } catch (error) {
    res.status(404).json(error);
  }
});

//delete a delivery boy by id
router.delete("/:id", async (req, res) => {
  try {
    const deliveryBoy = await DeliveryBoy.findByIdAndDelete(req.params.id);
    fs.unlink("uploads\\" + deliveryBoy.image, () => "deleted successfully");
    return res.json(deliveryBoy);
  } catch (error) {
    return res.status(404).json("id not found");
  }
});


//get a delivery boys password by id
router.get("/:id/password", async (req, res) => {
  try {
    const deliveryBoy = await DeliveryBoy.findById(req.params.id);
    const id = JSON.stringify(deliveryBoy._id);
    const password = deliveryBoy.firstName + id.slice(20, 25)
    return res.json(password);
  } catch {
    return res.status(404).json("id not found");
  }
});

//get all orders of delivery boy by id
router.get('/:id/orders', async(req, res) => {
  const orders = await Order.find({ deliveryBoyId : req.params.id });
  return res.json(orders);
});

//mark delivered by order id
router.put('/:deliveryBoyId/orders/:orderId', async(req, res) => {
  
  let { deliveryBoyId, orderId } = req.params;

  const order = await Order.findById(orderId);

  if(order.deliveryBoyId == deliveryBoyId){
    order.orderStatus = "DELIVERED";
    let date = new Date();
    order.deliveryDate = date.toJSON();
    await order.save();
    return res.json(order);
  }
  return res.status(401).json("unauthorized");
  
});

module.exports = router;
