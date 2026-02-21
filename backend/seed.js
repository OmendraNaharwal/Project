import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Hospital from './models/Hospital.js';

dotenv.config();

const hospitals = [
  {
    name: "City General Hospital",
    address: {
      street: "123 Main Street",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001"
    },
    contactNumber: "+91-22-12345678",
    email: "info@citygeneral.com",
    type: "government",
    facilities: {
      emergencyServices: true,
      icu: true,
      icuBeds: 20,
      generalBeds: 200,
      ventilators: 15,
      operationTheaters: 5,
      ambulanceService: true,
      bloodBank: true,
      pharmacy: true,
      laboratory: true,
      radiology: true,
      mriScanner: true,
      ctScanner: true,
      dialysis: true,
      physiotherapy: true
    },
    specializations: ['cardiology', 'neurology', 'trauma', 'emergency-medicine', 'general-surgery'],
    staff: {
      doctors: { total: 50, available: 35 },
      nurses: { total: 100, available: 80 },
      specialists: [
        { specialization: 'cardiology', name: 'Dr. Sharma', available: true },
        { specialization: 'neurology', name: 'Dr. Patel', available: true },
        { specialization: 'trauma', name: 'Dr. Kumar', available: true }
      ]
    },
    currentStatus: {
      isAcceptingPatients: true,
      emergencyAvailable: true,
      waitTime: 15,
      occupancyRate: 65
    },
    location: { latitude: 19.0760, longitude: 72.8777 },
    rating: 4.2
  },
  {
    name: "Apollo Super Specialty Hospital",
    address: {
      street: "456 Healthcare Avenue",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400053"
    },
    contactNumber: "+91-22-87654321",
    email: "care@apollomumbai.com",
    type: "private",
    facilities: {
      emergencyServices: true,
      icu: true,
      icuBeds: 35,
      generalBeds: 300,
      ventilators: 25,
      operationTheaters: 10,
      ambulanceService: true,
      bloodBank: true,
      pharmacy: true,
      laboratory: true,
      radiology: true,
      mriScanner: true,
      ctScanner: true,
      dialysis: true,
      physiotherapy: true
    },
    specializations: ['cardiology', 'oncology', 'orthopedics', 'neurology', 'nephrology', 'gastroenterology'],
    staff: {
      doctors: { total: 80, available: 60 },
      nurses: { total: 150, available: 120 },
      specialists: [
        { specialization: 'cardiology', name: 'Dr. Mehta', available: true },
        { specialization: 'oncology', name: 'Dr. Reddy', available: true },
        { specialization: 'orthopedics', name: 'Dr. Gupta', available: false }
      ]
    },
    currentStatus: {
      isAcceptingPatients: true,
      emergencyAvailable: true,
      waitTime: 10,
      occupancyRate: 70
    },
    location: { latitude: 19.1136, longitude: 72.8697 },
    rating: 4.6
  },
  {
    name: "Sunshine Children's Hospital",
    address: {
      street: "789 Pediatric Lane",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400028"
    },
    contactNumber: "+91-22-55556666",
    email: "contact@sunshinekids.com",
    type: "private",
    facilities: {
      emergencyServices: true,
      icu: true,
      icuBeds: 15,
      generalBeds: 100,
      ventilators: 10,
      operationTheaters: 3,
      ambulanceService: true,
      bloodBank: false,
      pharmacy: true,
      laboratory: true,
      radiology: true,
      mriScanner: false,
      ctScanner: true,
      dialysis: false,
      physiotherapy: true
    },
    specializations: ['pediatrics'],
    staff: {
      doctors: { total: 25, available: 18 },
      nurses: { total: 50, available: 40 },
      specialists: [
        { specialization: 'pediatrics', name: 'Dr. Verma', available: true },
        { specialization: 'pediatrics', name: 'Dr. Singh', available: true }
      ]
    },
    currentStatus: {
      isAcceptingPatients: true,
      emergencyAvailable: true,
      waitTime: 20,
      occupancyRate: 55
    },
    location: { latitude: 19.0596, longitude: 72.8295 },
    rating: 4.4
  },
  {
    name: "Heart Care Institute",
    address: {
      street: "101 Cardiac Road",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400012"
    },
    contactNumber: "+91-22-77778888",
    email: "help@heartcare.com",
    type: "private",
    facilities: {
      emergencyServices: true,
      icu: true,
      icuBeds: 25,
      generalBeds: 80,
      ventilators: 20,
      operationTheaters: 4,
      ambulanceService: true,
      bloodBank: true,
      pharmacy: true,
      laboratory: true,
      radiology: true,
      mriScanner: true,
      ctScanner: true,
      dialysis: false,
      physiotherapy: true
    },
    specializations: ['cardiology'],
    staff: {
      doctors: { total: 30, available: 22 },
      nurses: { total: 60, available: 50 },
      specialists: [
        { specialization: 'cardiology', name: 'Dr. Choudhary', available: true },
        { specialization: 'cardiology', name: 'Dr. Joshi', available: true },
        { specialization: 'cardiology', name: 'Dr. Malhotra', available: false }
      ]
    },
    currentStatus: {
      isAcceptingPatients: true,
      emergencyAvailable: true,
      waitTime: 5,
      occupancyRate: 45
    },
    location: { latitude: 19.0330, longitude: 72.8410 },
    rating: 4.8
  },
  {
    name: "Government District Hospital",
    address: {
      street: "District Center",
      city: "Thane",
      state: "Maharashtra",
      pincode: "400601"
    },
    contactNumber: "+91-22-33334444",
    email: "thane.district@gov.in",
    type: "government",
    facilities: {
      emergencyServices: true,
      icu: true,
      icuBeds: 10,
      generalBeds: 150,
      ventilators: 8,
      operationTheaters: 3,
      ambulanceService: true,
      bloodBank: true,
      pharmacy: true,
      laboratory: true,
      radiology: true,
      mriScanner: false,
      ctScanner: true,
      dialysis: true,
      physiotherapy: true
    },
    specializations: ['general-surgery', 'orthopedics', 'gynecology', 'pediatrics', 'emergency-medicine'],
    staff: {
      doctors: { total: 40, available: 25 },
      nurses: { total: 80, available: 55 },
      specialists: [
        { specialization: 'orthopedics', name: 'Dr. Rane', available: true },
        { specialization: 'gynecology', name: 'Dr. Deshmukh', available: true }
      ]
    },
    currentStatus: {
      isAcceptingPatients: true,
      emergencyAvailable: true,
      waitTime: 45,
      occupancyRate: 80
    },
    location: { latitude: 19.2183, longitude: 72.9781 },
    rating: 3.5
  }
];

const seedHospitals = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing hospitals
    await Hospital.deleteMany({});
    console.log('Cleared existing hospitals');

    // Insert seed data
    const inserted = await Hospital.insertMany(hospitals);
    console.log(`Inserted ${inserted.length} hospitals`);

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seedHospitals();
