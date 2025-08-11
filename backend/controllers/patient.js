/********************************************************************
  patient.js is part of controller for handleing patient information.
  It use for managing patient models.
********************************************************************/

const express = require('express');
const router = express.Router();
const {Patient} = require('../models/Patient');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const APIFeatures = require('../helpers/apiFeatures');

// GET Request in REST API (GET ALL)
// getAllPatient() is use for getting all patient in the database
exports.getAllPatient = asyncHandler(async (req, res) => {
  // Execute query : query.sort().select().skip().limit()
  const feature = new APIFeatures(
    Patient.find().select('-passwordHash'),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();
  // Get data
  const patient = await feature.query;

  // return HTTP response 
  res.status(200).json({
    status: 'sucess',
    DateTime: req.requestTime,
    result: patient.length,
    data: patient,
  });
});

// GET Request in REST API (GET by id)
// getPatient() is use for getting all patient in the database
exports.getPatient = asyncHandler(async (req, res) => {
  // Get data
  const patient = await Patient.findById(req.params.id).select('-passwordHash');
  if (!patient) {
    return res.status(404).json({
      status: 'fail',
      message: "can't find the patient",
    });
  }
  // return HTTP response
  res.status(200).json({
    status: 'sucess',
    DateTime: req.requestTime,
    data: patient,
  });
});

// POST Request in REST API 
// createPatient() is use for create patient in the database
exports.createPatient = asyncHandler(async (req, res) => {
  // get patient from HTTP request
  let patient = new Patient({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    gender: req.body.gender,
    birthdate: req.body.birthdate,
    IDcard: req.body.IDcard,
    allergy: req.body.allergy,
    bloodType: req.body.bloodType,
    // currentAddress: req.body.currentAddress,
    // relative: req.body.relative,
  });
  // create new patient
  patient = await patient.save();

  // return HTTP response
  res.status(201).json({
    status: 'sucess',
    data: patient,
  });
});

// PUT Request in REST API (by id)
// updatePatient() is use for update patient in the database
exports.updatePatient = asyncHandler(async (req, res) => {
  // get password from HTTP request
  if (req.body.password) {
    req.body.passwordHash = bcrypt.hashSync(req.body.password, 10) // hashing
  }
  // find and update
  const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  // return HTTP response
  if (!patient) {
    return res.status(404).json({
      status: 'fail',
      message: "can't find the patient",
    });
  }
  res.status(200).json({
    status: 'sucess',
    data: {
      patient,
    },
  });
});

// DELETE Request in REST API (by id)
// deletePatient() is use for update patient in the database
exports.deletePatient = asyncHandler(async (req, res, next) => {
  // find and delete
  await Patient.findByIdAndDelete(req.params.id);
  // return HTTP response
  res.status(204).json({
    status: 'sucess',
    data: null,
  });
});

// checkPatientLogin() use to checking patient token information
exports.checkPatientLogin = asyncHandler(async (req, res) => {
  // set local variable to be use with other middleware
  res.send(res.locals);
});

// controller for patient Login
//const jwt = require("jsonwebtoken");
//const asyncHandler = require("express-async-handler");
//const bcrypt = require("bcryptjs");
//const Patient = require("../models/patient");

// @desc    Login Patient
// @route   POST /api/v1/patient/login
// @access  Public
exports.patientLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const patient = await Patient.findOne({ email });

  // ✅ Get JWT secret correctly from environment
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return res.status(500).json({
      status: "error",
      message: "JWT_SECRET is not defined in .env file",
    });
  }

  if (!patient) {
    return res.status(400).json({
      status: "fail",
      message: "Incorrect Email or Password",
    });
  }

  const passwordMatch = bcrypt.compareSync(password, patient.passwordHash);

  if (passwordMatch) {
    const token = jwt.sign(
      {
        id: patient.id,
        type: "patient",
      },
      secret,
      { expiresIn: "7d" } // Optional: token expiry
    );

    return res.status(200).json({
      status: "success",
      user: patient.email,
      token,
    });
  } else {
    return res.status(400).json({
      status: "fail",
      message: "Incorrect Email or Password",
    });
  }
});
