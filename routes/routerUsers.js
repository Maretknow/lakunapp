const router = require("express").Router();
const {
  users,
  createUser,
  getUserById,
  updateUser,
  updateUserStatus,
  deleteUsers,
} = require("../controllers/userController");
const {
  createUserRules,
  getUserByIdRules,
  updateUserRule,
  userStatusRule,
  deleteUserRule,
} = require("../validator/userValidator");

router.get("/", users);
router.post("/createUser", createUserRules, createUser);
router.get("/view/:id", getUserByIdRules, getUserById);
router.put("/update/:id", updateUserRule, updateUser);
router.put("/status/:id", userStatusRule, updateUserStatus);
router.delete("/delete/:id", deleteUserRule, deleteUsers);

module.exports = router;
