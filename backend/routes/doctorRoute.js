const express = require('express');
const router = express.Router();
const {
  getAllDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  doctorLogin,
  checkDoctorLogin,
  uploadDoctorPhoto,
  getOnlineDoctors
} = require('../controllers/doctor');

// GET all
router.get('/', getAllDoctor);

// GET online doctors ✅
router.get('/online', getOnlineDoctors);

// POST
router.post('/', uploadDoctorPhoto, createDoctor);

// PUT
router.put('/:id', uploadDoctorPhoto, updateDoctor);

// DELETE
router.delete('/:id', deleteDoctor);

// LOGIN
router.post('/login', doctorLogin);

// CHECK LOGIN
router.get('/check', checkDoctorLogin);

module.exports = router;
