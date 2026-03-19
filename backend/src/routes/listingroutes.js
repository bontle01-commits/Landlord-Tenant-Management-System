const router = require("express").Router();
import multer from "multer";
import auth from './authmiddleware';
import { createListing, getListings } from './listingcontroller';

const upload = multer({ dest: "uploads/" });

router.get("/", getListings);
router.post("/", auth, upload.single("image"), createListing);

export default router;