const express = require("express");
const { check, validationResult } = require("express-validator");
const User = require("../../models/User");
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

//registering a user
router.post(
  "/",
  [
    check("email", "enter email in correct format").isEmail(),
    check("uid", "uid is required").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, uid } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "user already exists" }] });
      }

      user = new User({
        email,
        uid,
      });

      await user.save();
      res.json(user);
    } catch {
      res.status(500).json({ errors: errors.message });
    }
  }
);

//get all users
router.get("/", async (req, res) => {
  let users = await User.find();
  res.json(users);
});

//get users by id
router.get("/:id", async (req, res) => {
  let users = await User.findById(req.params.id);
  res.json(users);
});

//get users by uid
router.get("/uid/:uid", async (req, res) => {
  let users = await User.findOne({ uid : req.params.uid});
  res.json(users);
});

//update user info by id
router.put(
  "/:id",
  [
    check("email", "enter email in correct format").isEmail(),
    check("phone", "enter 10 digits mobile number").isMobilePhone(),
    check("name", "name cannot be empty").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, phone, name } = req.body;

    try {
      let user = await User.findById(req.params.id);

      if (user) {
        (user.name = name), (user.email = email), (user.phone = phone);
      }

      await user.save();
      res.json(user);
    } catch(err) {
      res.status(500).json(err);
    }
  }
);

//update user photo by id
router.put("/:id/image", upload, [], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    let user = await User.findById(req.params.id);
    if (user !== null) {
      if (req.file !== null) {
        user.image = req.file.filename;
        await user.save();
        return res.json(user);
      }
    }
  } catch {
    if (req.file == null) {
      return res.status(404).json("img is empty");
    } else {
      fs.unlink(req.file.path, () => "deleted successfully");
      return res.status(404).json("user not found");
    }
  }
});

//update user address by id
router.put(
  "/:id/address",
  [check("address", "cannot upload empty address")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let user = await User.findById(req.params.id);
      if (user) {
        user.address.push(req.body.newAddress);
        await user.save();
        return res.json(user);
      }
    } catch {
      return res.status(404).json("user not found");
    }
  }
);

//count all users
router.get("/count/all", async (req, res) => {
  try {
    const usersCount = await User.estimatedDocumentCount();
    return res.json(usersCount);
  } catch (error) {
    return res.status(500).json(error);
  }
});

module.exports = router;
