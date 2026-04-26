const router = require("express").Router();
const auth = require("../../middlewares/auth.middleware");
const controller = require("./company.controller");
const upload = require("../../middlewares/upload.middleware");

router.get("/profile", auth, controller.getProfile);
router.put("/profile", auth, upload.single("logo"), controller.updateProfile);
router.get("/dashboard", controller.getDashboard);
router.get("/hr-dashboard", controller.getHrDashboard);
router.get("/analytics", controller.getAnalytics);

router.use((req, res, next) => {
  console.log("Company route hit:", req.method, req.url);
  next();
});



module.exports = router;