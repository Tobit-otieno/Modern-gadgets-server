const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductBySlug,
  getRelatedProducts,
  getFeaturedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getBrands,
  addReview,
} = require("../controllers/productController");


import cloudinary from "../utilities/cloudinary.js"
import upload from "../middlewares/uploadMidleware.js"
import fs from "fs";

// TODO: once auth is added, protect the write routes below with an
// admin-only middleware (e.g. router.post("/", protect, admin, createProduct)).

router.route("/").get(getProducts).post(createProduct);

router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            upload_preset: "mashthrift",
            folder: "uploads"
        });

        fs.unlinkSync(req.file.path);
        return res.json({ data: result.secure_url });
    } catch (error) {
        if (req.file?.path) fs.unlinkSync(req.file.path);
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Specific, fixed-path routes must come before the "/:slug" catch-all below.
router.get("/featured", getFeaturedProducts);
router.get("/brands", getBrands);

router.route("/id/:id").put(updateProduct).delete(deleteProduct);

router.get("/:slug", getProductBySlug);
router.get("/:slug/related", getRelatedProducts);
router.post("/:slug/reviews", addReview);

module.exports = router;
