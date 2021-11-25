const express = require("express");
const Users = require("../schemas/user");
const router = express.Router();
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/auth-middleware");
