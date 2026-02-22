import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Hospital from './models/Hospital.js';

// Load .env from the same directory as this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const hospitals = [
  {
    name: "Ambala Civil Hospital",
    address: { street: "Ambala City", city: "Ambala", state: "Haryana", pincode: "134003" },
    contactNumber: "+91-171-2530001",
    email: "info@ambalacivil.gov.in",
    type: "government",
    facilities: { emergencyServices: true, icu: true, icuBeds: 20, generalBeds: 250, ventilators: 12, operationTheaters: 4, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: false, ctScanner: true, dialysis: true, physiotherapy: true },
    specializations: ['emergency-medicine', 'general-medicine'],
    staff: { doctors: { total: 80, available: 60 }, nurses: { total: 160, available: 120 }, specialists: [{ specialization: 'emergency-medicine', name: 'Dr. Sharma', available: true }, { specialization: 'general-medicine', name: 'Dr. Verma', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 18, occupancyRate: 74 },
    location: { latitude: 30.3782, longitude: 76.7767 },
    rating: 3.8
  },
  {
    name: "MM Institute of Medical Sciences",
    address: { street: "Mullana", city: "Ambala", state: "Haryana", pincode: "133207" },
    contactNumber: "+91-1731-274375",
    email: "info@mmumullana.org",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 30, generalBeds: 350, ventilators: 18, operationTheaters: 8, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: true, physiotherapy: true },
    specializations: ['cardiology', 'trauma'],
    staff: { doctors: { total: 120, available: 90 }, nurses: { total: 240, available: 180 }, specialists: [{ specialization: 'cardiology', name: 'Dr. Gupta', available: true }, { specialization: 'trauma', name: 'Dr. Singh', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 15, occupancyRate: 74 },
    location: { latitude: 30.2356, longitude: 77.0592 },
    rating: 4.3
  },
  {
    name: "Healing Hands Hospital Ambala",
    address: { street: "Ambala Cantt", city: "Ambala", state: "Haryana", pincode: "133001" },
    contactNumber: "+91-171-2640001",
    email: "contact@healinghandsambala.com",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 16, generalBeds: 180, ventilators: 10, operationTheaters: 4, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: false, ctScanner: true, dialysis: false, physiotherapy: true },
    specializations: ['orthopedics', 'emergency-medicine'],
    staff: { doctors: { total: 70, available: 50 }, nurses: { total: 140, available: 100 }, specialists: [{ specialization: 'orthopedics', name: 'Dr. Rao', available: true }, { specialization: 'emergency-medicine', name: 'Dr. Kumar', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 20, occupancyRate: 77 },
    location: { latitude: 30.3568, longitude: 76.8312 },
    rating: 4.0
  },
  {
    name: "Life Care Hospital Ambala",
    address: { street: "Model Town", city: "Ambala", state: "Haryana", pincode: "134003" },
    contactNumber: "+91-171-2560001",
    email: "info@lifecareambala.com",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 14, generalBeds: 160, ventilators: 8, operationTheaters: 3, ambulanceService: true, bloodBank: false, pharmacy: true, laboratory: true, radiology: true, mriScanner: false, ctScanner: true, dialysis: false, physiotherapy: true },
    specializations: ['general-medicine'],
    staff: { doctors: { total: 60, available: 45 }, nurses: { total: 120, available: 90 }, specialists: [{ specialization: 'general-medicine', name: 'Dr. Jain', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 16, occupancyRate: 70 },
    location: { latitude: 30.3752, longitude: 76.7823 },
    rating: 3.9
  },
  {
    name: "Metro Hospital Ambala",
    address: { street: "Ambala City Center", city: "Ambala", state: "Haryana", pincode: "134003" },
    contactNumber: "+91-171-2570001",
    email: "care@metroambala.com",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 18, generalBeds: 200, ventilators: 12, operationTheaters: 5, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: true, physiotherapy: true },
    specializations: ['cardiology'],
    staff: { doctors: { total: 75, available: 55 }, nurses: { total: 150, available: 110 }, specialists: [{ specialization: 'cardiology', name: 'Dr. Mehta', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 14, occupancyRate: 72 },
    location: { latitude: 30.3800, longitude: 76.7750 },
    rating: 4.2
  },
  {
    name: "Ambala Trauma Center",
    address: { street: "NH Road", city: "Ambala", state: "Haryana", pincode: "134003" },
    contactNumber: "+91-171-2580001",
    email: "emergency@ambalatrauma.com",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 20, generalBeds: 220, ventilators: 14, operationTheaters: 6, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: false, physiotherapy: true },
    specializations: ['trauma', 'emergency-medicine'],
    staff: { doctors: { total: 85, available: 60 }, nurses: { total: 170, available: 120 }, specialists: [{ specialization: 'trauma', name: 'Dr. Choudhary', available: true }, { specialization: 'emergency-medicine', name: 'Dr. Patel', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 22, occupancyRate: 77 },
    location: { latitude: 30.3650, longitude: 76.7900 },
    rating: 4.1
  },
  {
    name: "Prime Hospital Ambala",
    address: { street: "Ambala Cantt Road", city: "Ambala", state: "Haryana", pincode: "133001" },
    contactNumber: "+91-171-2590001",
    email: "info@primeambala.com",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 13, generalBeds: 150, ventilators: 8, operationTheaters: 3, ambulanceService: true, bloodBank: false, pharmacy: true, laboratory: true, radiology: true, mriScanner: false, ctScanner: true, dialysis: false, physiotherapy: true },
    specializations: ['orthopedics'],
    staff: { doctors: { total: 58, available: 42 }, nurses: { total: 115, available: 85 }, specialists: [{ specialization: 'orthopedics', name: 'Dr. Reddy', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 17, occupancyRate: 69 },
    location: { latitude: 30.3520, longitude: 76.8250 },
    rating: 3.8
  },
  {
    name: "Carewell Hospital Ambala",
    address: { street: "Sector 8", city: "Ambala", state: "Haryana", pincode: "134003" },
    contactNumber: "+91-171-2600001",
    email: "care@carewellambala.com",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 12, generalBeds: 140, ventilators: 7, operationTheaters: 3, ambulanceService: true, bloodBank: false, pharmacy: true, laboratory: true, radiology: true, mriScanner: false, ctScanner: true, dialysis: false, physiotherapy: true },
    specializations: ['general-medicine'],
    staff: { doctors: { total: 52, available: 38 }, nurses: { total: 105, available: 78 }, specialists: [{ specialization: 'general-medicine', name: 'Dr. Agarwal', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 15, occupancyRate: 69 },
    location: { latitude: 30.3720, longitude: 76.7850 },
    rating: 3.7
  },
  {
    name: "City Heart Hospital Ambala",
    address: { street: "Ambala Main Road", city: "Ambala", state: "Haryana", pincode: "134003" },
    contactNumber: "+91-171-2610001",
    email: "info@cityheartambala.com",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 16, generalBeds: 170, ventilators: 10, operationTheaters: 4, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: true, physiotherapy: true },
    specializations: ['cardiology'],
    staff: { doctors: { total: 65, available: 48 }, nurses: { total: 130, available: 95 }, specialists: [{ specialization: 'cardiology', name: 'Dr. Saxena', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 14, occupancyRate: 69 },
    location: { latitude: 30.3790, longitude: 76.7780 },
    rating: 4.1
  },
  {
    name: "Sunrise Hospital Ambala",
    address: { street: "Model Town Extension", city: "Ambala", state: "Haryana", pincode: "134003" },
    contactNumber: "+91-171-2620001",
    email: "care@sunriseambala.com",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 14, generalBeds: 155, ventilators: 9, operationTheaters: 3, ambulanceService: true, bloodBank: false, pharmacy: true, laboratory: true, radiology: true, mriScanner: false, ctScanner: true, dialysis: false, physiotherapy: true },
    specializations: ['general-medicine'],
    staff: { doctors: { total: 59, available: 44 }, nurses: { total: 120, available: 88 }, specialists: [{ specialization: 'general-medicine', name: 'Dr. Kapoor', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 16, occupancyRate: 68 },
    location: { latitude: 30.3755, longitude: 76.7810 },
    rating: 3.9
  },
  {
    name: "Patiala Emergency Center",
    address: { street: "Sirhind Road", city: "Patiala", state: "Punjab", pincode: "147001" },
    contactNumber: "+91-175-2210001",
    email: "emergency@patialaec.com",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 18, generalBeds: 200, ventilators: 12, operationTheaters: 5, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: false, physiotherapy: true },
    specializations: ['emergency-medicine', 'trauma'],
    staff: { doctors: { total: 72, available: 52 }, nurses: { total: 140, available: 100 }, specialists: [{ specialization: 'emergency-medicine', name: 'Dr. Sidhu', available: true }, { specialization: 'trauma', name: 'Dr. Gill', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 21, occupancyRate: 75 },
    location: { latitude: 30.3398, longitude: 76.3869 },
    rating: 4.0
  },
  {
    name: "Golden Care Hospital",
    address: { street: "Urban Estate Phase 5", city: "Patiala", state: "Punjab", pincode: "147001" },
    contactNumber: "+91-175-2220001",
    email: "info@goldencarepatiala.com",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 12, generalBeds: 135, ventilators: 8, operationTheaters: 3, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: true, physiotherapy: true },
    specializations: ['cardiology'],
    staff: { doctors: { total: 48, available: 36 }, nurses: { total: 100, available: 75 }, specialists: [{ specialization: 'cardiology', name: 'Dr. Bhatia', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 13, occupancyRate: 70 },
    location: { latitude: 30.3420, longitude: 76.3950 },
    rating: 4.2
  },
  {
    name: "Unity Care Hospital",
    address: { street: "Tripuri Road", city: "Patiala", state: "Punjab", pincode: "147001" },
    contactNumber: "+91-175-2230001",
    email: "care@unitycarepatiala.com",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 11, generalBeds: 120, ventilators: 7, operationTheaters: 2, ambulanceService: true, bloodBank: false, pharmacy: true, laboratory: true, radiology: true, mriScanner: false, ctScanner: true, dialysis: false, physiotherapy: true },
    specializations: ['general-medicine'],
    staff: { doctors: { total: 42, available: 32 }, nurses: { total: 90, available: 68 }, specialists: [{ specialization: 'general-medicine', name: 'Dr. Kaur', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 12, occupancyRate: 69 },
    location: { latitude: 30.3350, longitude: 76.3780 },
    rating: 3.8
  },
  {
    name: "Shiv Shakti Hospital",
    address: { street: "Leela Bhawan Road", city: "Patiala", state: "Punjab", pincode: "147001" },
    contactNumber: "+91-175-2240001",
    email: "info@shivshaktipatiala.com",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 9, generalBeds: 95, ventilators: 5, operationTheaters: 2, ambulanceService: true, bloodBank: false, pharmacy: true, laboratory: true, radiology: true, mriScanner: false, ctScanner: true, dialysis: false, physiotherapy: true },
    specializations: ['emergency-medicine'],
    staff: { doctors: { total: 34, available: 26 }, nurses: { total: 70, available: 52 }, specialists: [{ specialization: 'emergency-medicine', name: 'Dr. Arora', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 10, occupancyRate: 71 },
    location: { latitude: 30.3280, longitude: 76.3850 },
    rating: 3.6
  },
  {
    name: "Advanced Neuro Hospital Patiala",
    address: { street: "Rajpura Road", city: "Patiala", state: "Punjab", pincode: "147001" },
    contactNumber: "+91-175-2250001",
    email: "neuro@advancedpatiala.com",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 15, generalBeds: 160, ventilators: 10, operationTheaters: 4, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: false, physiotherapy: true },
    specializations: ['neurology'],
    staff: { doctors: { total: 60, available: 45 }, nurses: { total: 120, available: 90 }, specialists: [{ specialization: 'neurology', name: 'Dr. Malhotra', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 15, occupancyRate: 69 },
    location: { latitude: 30.3380, longitude: 76.4050 },
    rating: 4.3
  },
  {
    name: "Royal Care Hospital Patiala",
    address: { street: "Sirhind Bypass", city: "Patiala", state: "Punjab", pincode: "147001" },
    contactNumber: "+91-175-2260001",
    email: "info@royalcarepatiala.com",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 16, generalBeds: 175, ventilators: 11, operationTheaters: 4, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: true, physiotherapy: true },
    specializations: ['cardiology'],
    staff: { doctors: { total: 68, available: 48 }, nurses: { total: 135, available: 96 }, specialists: [{ specialization: 'cardiology', name: 'Dr. Dhillon', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 19, occupancyRate: 74 },
    location: { latitude: 30.3450, longitude: 76.3720 },
    rating: 4.1
  },
  {
    name: "City Medical Center Patiala",
    address: { street: "Urban Estate Central", city: "Patiala", state: "Punjab", pincode: "147001" },
    contactNumber: "+91-175-2270001",
    email: "care@citymedicalpatiala.com",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 13, generalBeds: 140, ventilators: 8, operationTheaters: 3, ambulanceService: true, bloodBank: false, pharmacy: true, laboratory: true, radiology: true, mriScanner: false, ctScanner: true, dialysis: false, physiotherapy: true },
    specializations: ['general-medicine'],
    staff: { doctors: { total: 52, available: 39 }, nurses: { total: 110, available: 82 }, specialists: [{ specialization: 'general-medicine', name: 'Dr. Sandhu', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 14, occupancyRate: 69 },
    location: { latitude: 30.3400, longitude: 76.3900 },
    rating: 3.9
  },
  {
    name: "Ambala Heart Institute",
    address: { street: "Ambala Cantt", city: "Ambala", state: "Haryana", pincode: "133001" },
    contactNumber: "+91-171-2630001",
    email: "heart@ambalaheartinstitute.com",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 18, generalBeds: 190, ventilators: 12, operationTheaters: 5, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: true, physiotherapy: true },
    specializations: ['cardiology'],
    staff: { doctors: { total: 70, available: 52 }, nurses: { total: 150, available: 112 }, specialists: [{ specialization: 'cardiology', name: 'Dr. Taneja', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 15, occupancyRate: 68 },
    location: { latitude: 30.3550, longitude: 76.8280 },
    rating: 4.4
  },
  {
    name: "Ambala Neuro Care",
    address: { street: "Sector 9", city: "Ambala", state: "Haryana", pincode: "134003" },
    contactNumber: "+91-171-2640001",
    email: "neuro@ambalaneurocare.com",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 15, generalBeds: 165, ventilators: 10, operationTheaters: 4, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: false, physiotherapy: true },
    specializations: ['neurology'],
    staff: { doctors: { total: 62, available: 46 }, nurses: { total: 130, available: 96 }, specialists: [{ specialization: 'neurology', name: 'Dr. Sinha', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 16, occupancyRate: 70 },
    location: { latitude: 30.3730, longitude: 76.7880 },
    rating: 4.2
  },
  {
    name: "Ambala Emergency Hospital",
    address: { street: "NH Ambala", city: "Ambala", state: "Haryana", pincode: "134003" },
    contactNumber: "+91-171-2650001",
    email: "emergency@ambalaemergency.com",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 20, generalBeds: 210, ventilators: 14, operationTheaters: 6, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: false, physiotherapy: true },
    specializations: ['emergency-medicine', 'trauma'],
    staff: { doctors: { total: 80, available: 56 }, nurses: { total: 165, available: 115 }, specialists: [{ specialization: 'emergency-medicine', name: 'Dr. Bhardwaj', available: true }, { specialization: 'trauma', name: 'Dr. Mishra', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 23, occupancyRate: 74 },
    location: { latitude: 30.3680, longitude: 76.7950 },
    rating: 4.0
  },
  {
    name: "Wellcare Hospital Patiala",
    address: { street: "Tripuri Extension", city: "Patiala", state: "Punjab", pincode: "147001" },
    contactNumber: "+91-175-2280001",
    email: "info@wellcarepatiala.com",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 12, generalBeds: 125, ventilators: 7, operationTheaters: 3, ambulanceService: true, bloodBank: false, pharmacy: true, laboratory: true, radiology: true, mriScanner: false, ctScanner: true, dialysis: false, physiotherapy: true },
    specializations: ['general-medicine'],
    staff: { doctors: { total: 46, available: 35 }, nurses: { total: 95, available: 72 }, specialists: [{ specialization: 'general-medicine', name: 'Dr. Grewal', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 13, occupancyRate: 70 },
    location: { latitude: 30.3320, longitude: 76.3750 },
    rating: 3.7
  },
  {
    name: "CarePlus Hospital Patiala",
    address: { street: "Rajpura Road Phase 2", city: "Patiala", state: "Punjab", pincode: "147001" },
    contactNumber: "+91-175-2290001",
    email: "care@carepluspatiala.com",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 13, generalBeds: 135, ventilators: 8, operationTheaters: 3, ambulanceService: true, bloodBank: false, pharmacy: true, laboratory: true, radiology: true, mriScanner: false, ctScanner: true, dialysis: false, physiotherapy: true },
    specializations: ['orthopedics'],
    staff: { doctors: { total: 50, available: 38 }, nurses: { total: 105, available: 78 }, specialists: [{ specialization: 'orthopedics', name: 'Dr. Mann', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 15, occupancyRate: 70 },
    location: { latitude: 30.3360, longitude: 76.4080 },
    rating: 3.8
  },
  {
    name: "Harmony Care Hospital Patiala",
    address: { street: "Urban Estate Phase 6", city: "Patiala", state: "Punjab", pincode: "147001" },
    contactNumber: "+91-175-2300001",
    email: "info@harmonycarepatiala.com",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 11, generalBeds: 120, ventilators: 7, operationTheaters: 2, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: true, physiotherapy: true },
    specializations: ['cardiology'],
    staff: { doctors: { total: 44, available: 33 }, nurses: { total: 90, available: 68 }, specialists: [{ specialization: 'cardiology', name: 'Dr. Bajwa', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 12, occupancyRate: 71 },
    location: { latitude: 30.3440, longitude: 76.3980 },
    rating: 4.0
  },
  {
    name: "Ambala Multi Speciality Hospital",
    address: { street: "Ambala City Center", city: "Ambala", state: "Haryana", pincode: "134003" },
    contactNumber: "+91-171-2660001",
    email: "info@ambalamultispeciality.com",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 20, generalBeds: 220, ventilators: 14, operationTheaters: 6, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: true, physiotherapy: true },
    specializations: ['cardiology', 'orthopedics'],
    staff: { doctors: { total: 85, available: 62 }, nurses: { total: 170, available: 125 }, specialists: [{ specialization: 'cardiology', name: 'Dr. Bansal', available: true }, { specialization: 'orthopedics', name: 'Dr. Yadav', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 17, occupancyRate: 68 },
    location: { latitude: 30.3810, longitude: 76.7740 },
    rating: 4.3
  },
  {
    name: "Ambala LifeCare Center",
    address: { street: "Model Town", city: "Ambala", state: "Haryana", pincode: "134003" },
    contactNumber: "+91-171-2670001",
    email: "care@ambalalifcare.com",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 14, generalBeds: 150, ventilators: 9, operationTheaters: 3, ambulanceService: true, bloodBank: false, pharmacy: true, laboratory: true, radiology: true, mriScanner: false, ctScanner: true, dialysis: false, physiotherapy: true },
    specializations: ['general-medicine'],
    staff: { doctors: { total: 58, available: 43 }, nurses: { total: 120, available: 88 }, specialists: [{ specialization: 'general-medicine', name: 'Dr. Garg', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 16, occupancyRate: 68 },
    location: { latitude: 30.3760, longitude: 76.7830 },
    rating: 3.8
  },
  {
    name: "Ambala Surgical Center",
    address: { street: "Ambala Cantt Road", city: "Ambala", state: "Haryana", pincode: "133001" },
    contactNumber: "+91-171-2680001",
    email: "surgery@ambalasurgical.com",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 15, generalBeds: 170, ventilators: 10, operationTheaters: 5, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: false, physiotherapy: true },
    specializations: ['general-surgery'],
    staff: { doctors: { total: 65, available: 46 }, nurses: { total: 130, available: 92 }, specialists: [{ specialization: 'general-surgery', name: 'Dr. Tiwari', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 21, occupancyRate: 76 },
    location: { latitude: 30.3530, longitude: 76.8260 },
    rating: 4.0
  },
  {
    name: "Ambala Orthopedic Hospital",
    address: { street: "Sector 10", city: "Ambala", state: "Haryana", pincode: "134003" },
    contactNumber: "+91-171-2690001",
    email: "ortho@ambalaortho.com",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 12, generalBeds: 140, ventilators: 8, operationTheaters: 3, ambulanceService: true, bloodBank: false, pharmacy: true, laboratory: true, radiology: true, mriScanner: false, ctScanner: true, dialysis: false, physiotherapy: true },
    specializations: ['orthopedics'],
    staff: { doctors: { total: 52, available: 38 }, nurses: { total: 110, available: 80 }, specialists: [{ specialization: 'orthopedics', name: 'Dr. Chauhan', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 15, occupancyRate: 70 },
    location: { latitude: 30.3740, longitude: 76.7900 },
    rating: 4.0
  },
  {
    name: "Patiala Surgical Center",
    address: { street: "Sirhind Road Extension", city: "Patiala", state: "Punjab", pincode: "147001" },
    contactNumber: "+91-175-2310001",
    email: "surgery@patialasurgical.com",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 14, generalBeds: 150, ventilators: 9, operationTheaters: 4, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: false, physiotherapy: true },
    specializations: ['general-surgery'],
    staff: { doctors: { total: 55, available: 42 }, nurses: { total: 115, available: 86 }, specialists: [{ specialization: 'general-surgery', name: 'Dr. Sethi', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 16, occupancyRate: 70 },
    location: { latitude: 30.3370, longitude: 76.3800 },
    rating: 4.1
  },
  {
    name: "Patiala Neuro Center",
    address: { street: "Urban Estate Phase 7", city: "Patiala", state: "Punjab", pincode: "147001" },
    contactNumber: "+91-175-2320001",
    email: "neuro@patialaneuro.com",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 15, generalBeds: 160, ventilators: 10, operationTheaters: 4, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: false, physiotherapy: true },
    specializations: ['neurology'],
    staff: { doctors: { total: 60, available: 45 }, nurses: { total: 130, available: 96 }, specialists: [{ specialization: 'neurology', name: 'Dr. Oberoi', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 15, occupancyRate: 69 },
    location: { latitude: 30.3460, longitude: 76.4000 },
    rating: 4.2
  },
  {
    name: "Patiala Advanced Care Hospital",
    address: { street: "Rajpura Bypass Road", city: "Patiala", state: "Punjab", pincode: "147001" },
    contactNumber: "+91-175-2330001",
    email: "care@patialaadvanced.com",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 18, generalBeds: 180, ventilators: 12, operationTheaters: 5, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: true, physiotherapy: true },
    specializations: ['cardiology', 'emergency-medicine'],
    staff: { doctors: { total: 70, available: 50 }, nurses: { total: 145, available: 105 }, specialists: [{ specialization: 'cardiology', name: 'Dr. Chopra', available: true }, { specialization: 'emergency-medicine', name: 'Dr. Randhawa', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 20, occupancyRate: 71 },
    location: { latitude: 30.3480, longitude: 76.4120 },
    rating: 4.2
  },
  // Major Hospitals across India (HSP091-HSP120)
  {
    name: "AIIMS Delhi",
    address: { street: "Ansari Nagar", city: "New Delhi", state: "Delhi", pincode: "110029" },
    contactNumber: "+91-11-26588500",
    email: "info@aiims.edu",
    type: "government",
    facilities: { emergencyServices: true, icu: true, icuBeds: 200, generalBeds: 2500, ventilators: 150, operationTheaters: 40, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: true, physiotherapy: true },
    specializations: ['cardiology', 'neurology', 'oncology', 'trauma'],
    staff: { doctors: { total: 900, available: 650 }, nurses: { total: 1800, available: 1400 }, specialists: [{ specialization: 'cardiology', name: 'Dr. Trehan', available: true }, { specialization: 'neurology', name: 'Dr. Suri', available: true }, { specialization: 'oncology', name: 'Dr. Batra', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 28, occupancyRate: 83 },
    location: { latitude: 28.5672, longitude: 77.2100 },
    rating: 4.5
  },
  {
    name: "Safdarjung Hospital",
    address: { street: "Ansari Nagar West", city: "New Delhi", state: "Delhi", pincode: "110029" },
    contactNumber: "+91-11-26165060",
    email: "info@safdarjunghospital.nic.in",
    type: "government",
    facilities: { emergencyServices: true, icu: true, icuBeds: 120, generalBeds: 1600, ventilators: 90, operationTheaters: 25, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: true, physiotherapy: true },
    specializations: ['emergency-medicine', 'orthopedics', 'trauma'],
    staff: { doctors: { total: 700, available: 500 }, nurses: { total: 1400, available: 1050 }, specialists: [{ specialization: 'emergency-medicine', name: 'Dr. Sharma', available: true }, { specialization: 'orthopedics', name: 'Dr. Kapoor', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 22, occupancyRate: 80 },
    location: { latitude: 28.5682, longitude: 77.2070 },
    rating: 4.0
  },
  {
    name: "PGIMER Chandigarh",
    address: { street: "Sector 12", city: "Chandigarh", state: "Chandigarh", pincode: "160012" },
    contactNumber: "+91-172-2756565",
    email: "director@pgimer.edu.in",
    type: "government",
    facilities: { emergencyServices: true, icu: true, icuBeds: 150, generalBeds: 1800, ventilators: 120, operationTheaters: 35, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: true, physiotherapy: true },
    specializations: ['cardiology', 'neurology', 'nephrology'],
    staff: { doctors: { total: 800, available: 580 }, nurses: { total: 1600, available: 1200 }, specialists: [{ specialization: 'cardiology', name: 'Dr. Malhotra', available: true }, { specialization: 'neurology', name: 'Dr. Khurana', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 24, occupancyRate: 83 },
    location: { latitude: 30.7626, longitude: 76.7748 },
    rating: 4.6
  },
  {
    name: "Apollo Hospitals Chennai",
    address: { street: "Greams Road", city: "Chennai", state: "Tamil Nadu", pincode: "600006" },
    contactNumber: "+91-44-28290200",
    email: "info@apollohospitals.com",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 90, generalBeds: 1000, ventilators: 70, operationTheaters: 20, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: true, physiotherapy: true },
    specializations: ['cardiology', 'oncology', 'transplant'],
    staff: { doctors: { total: 450, available: 340 }, nurses: { total: 900, available: 700 }, specialists: [{ specialization: 'cardiology', name: 'Dr. Reddy', available: true }, { specialization: 'oncology', name: 'Dr. Iyer', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 18, occupancyRate: 74 },
    location: { latitude: 13.0604, longitude: 80.2496 },
    rating: 4.7
  },
  {
    name: "Fortis Escorts Heart Institute",
    address: { street: "Okhla Road", city: "New Delhi", state: "Delhi", pincode: "110025" },
    contactNumber: "+91-11-47135000",
    email: "info@fortisescorts.in",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 40, generalBeds: 350, ventilators: 35, operationTheaters: 8, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: false, physiotherapy: true },
    specializations: ['cardiology'],
    staff: { doctors: { total: 180, available: 135 }, nurses: { total: 360, available: 280 }, specialists: [{ specialization: 'cardiology', name: 'Dr. Naresh Trehan', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 15, occupancyRate: 73 },
    location: { latitude: 28.5494, longitude: 77.2760 },
    rating: 4.8
  },
  {
    name: "Medanta The Medicity",
    address: { street: "Sector 38", city: "Gurgaon", state: "Haryana", pincode: "122001" },
    contactNumber: "+91-124-4141414",
    email: "info@medanta.org",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 150, generalBeds: 1600, ventilators: 120, operationTheaters: 45, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: true, physiotherapy: true },
    specializations: ['cardiology', 'oncology', 'neurology'],
    staff: { doctors: { total: 700, available: 500 }, nurses: { total: 1400, available: 1050 }, specialists: [{ specialization: 'cardiology', name: 'Dr. Naresh Trehan', available: true }, { specialization: 'oncology', name: 'Dr. Harit Chaturvedi', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 25, occupancyRate: 81 },
    location: { latitude: 28.4395, longitude: 77.0266 },
    rating: 4.7
  },
  {
    name: "Max Super Speciality Hospital Saket",
    address: { street: "Press Enclave Road, Saket", city: "New Delhi", state: "Delhi", pincode: "110017" },
    contactNumber: "+91-11-26515050",
    email: "info@maxhealthcare.com",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 45, generalBeds: 500, ventilators: 40, operationTheaters: 12, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: true, physiotherapy: true },
    specializations: ['neurology', 'cardiology'],
    staff: { doctors: { total: 220, available: 165 }, nurses: { total: 450, available: 340 }, specialists: [{ specialization: 'neurology', name: 'Dr. Sandeep Vaishya', available: true }, { specialization: 'cardiology', name: 'Dr. Balbir Singh', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 18, occupancyRate: 76 },
    location: { latitude: 28.5275, longitude: 77.2139 },
    rating: 4.5
  },
  {
    name: "Sir Ganga Ram Hospital",
    address: { street: "Rajinder Nagar", city: "New Delhi", state: "Delhi", pincode: "110060" },
    contactNumber: "+91-11-25750000",
    email: "info@sgrh.com",
    type: "charitable",
    facilities: { emergencyServices: true, icu: true, icuBeds: 60, generalBeds: 700, ventilators: 50, operationTheaters: 15, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: true, physiotherapy: true },
    specializations: ['general-surgery', 'cardiology'],
    staff: { doctors: { total: 300, available: 225 }, nurses: { total: 650, available: 500 }, specialists: [{ specialization: 'general-surgery', name: 'Dr. Samiran Nundy', available: true }, { specialization: 'cardiology', name: 'Dr. Ashok Seth', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 17, occupancyRate: 77 },
    location: { latitude: 28.6412, longitude: 77.1887 },
    rating: 4.4
  },
  {
    name: "Tata Memorial Hospital",
    address: { street: "Dr. E Borges Road, Parel", city: "Mumbai", state: "Maharashtra", pincode: "400012" },
    contactNumber: "+91-22-24177000",
    email: "info@tmc.gov.in",
    type: "government",
    facilities: { emergencyServices: true, icu: true, icuBeds: 70, generalBeds: 850, ventilators: 55, operationTheaters: 18, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: false, physiotherapy: true },
    specializations: ['oncology'],
    staff: { doctors: { total: 350, available: 260 }, nurses: { total: 700, available: 530 }, specialists: [{ specialization: 'oncology', name: 'Dr. R A Badwe', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 30, occupancyRate: 79 },
    location: { latitude: 19.0040, longitude: 72.8420 },
    rating: 4.6
  },
  {
    name: "Lilavati Hospital",
    address: { street: "Bandra Reclamation", city: "Mumbai", state: "Maharashtra", pincode: "400050" },
    contactNumber: "+91-22-26751000",
    email: "info@lilavatihospital.com",
    type: "charitable",
    facilities: { emergencyServices: true, icu: true, icuBeds: 28, generalBeds: 320, ventilators: 25, operationTheaters: 8, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: true, physiotherapy: true },
    specializations: ['cardiology', 'neurology'],
    staff: { doctors: { total: 150, available: 115 }, nurses: { total: 300, available: 230 }, specialists: [{ specialization: 'cardiology', name: 'Dr. Ramakanta Panda', available: true }, { specialization: 'neurology', name: 'Dr. Paresh Doshi', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 18, occupancyRate: 72 },
    location: { latitude: 19.0510, longitude: 72.8325 },
    rating: 4.3
  },
  {
    name: "Kokilaben Dhirubhai Ambani Hospital",
    address: { street: "Four Bungalows, Andheri West", city: "Mumbai", state: "Maharashtra", pincode: "400053" },
    contactNumber: "+91-22-30999999",
    email: "info@kokilabenhospital.com",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 70, generalBeds: 750, ventilators: 60, operationTheaters: 18, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: true, physiotherapy: true },
    specializations: ['neurology', 'oncology'],
    staff: { doctors: { total: 320, available: 240 }, nurses: { total: 650, available: 490 }, specialists: [{ specialization: 'neurology', name: 'Dr. Mazda Turel', available: true }, { specialization: 'oncology', name: 'Dr. Sridhar Epari', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 20, occupancyRate: 72 },
    location: { latitude: 19.1269, longitude: 72.8318 },
    rating: 4.6
  },
  {
    name: "Christian Medical College Vellore",
    address: { street: "Ida Scudder Road", city: "Vellore", state: "Tamil Nadu", pincode: "632004" },
    contactNumber: "+91-416-2281000",
    email: "info@cmcvellore.ac.in",
    type: "charitable",
    facilities: { emergencyServices: true, icu: true, icuBeds: 220, generalBeds: 2600, ventilators: 170, operationTheaters: 50, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: true, physiotherapy: true },
    specializations: ['cardiology', 'neurology', 'transplant'],
    staff: { doctors: { total: 950, available: 700 }, nurses: { total: 2000, available: 1500 }, specialists: [{ specialization: 'cardiology', name: 'Dr. Paul V George', available: true }, { specialization: 'transplant', name: 'Dr. George Chandy', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 28, occupancyRate: 82 },
    location: { latitude: 12.9224, longitude: 79.1325 },
    rating: 4.8
  },
  {
    name: "Narayana Health Bangalore",
    address: { street: "Bommasandra Industrial Area", city: "Bangalore", state: "Karnataka", pincode: "560099" },
    contactNumber: "+91-80-71222222",
    email: "info@narayanahealth.org",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 140, generalBeds: 1500, ventilators: 110, operationTheaters: 35, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: true, physiotherapy: true },
    specializations: ['cardiology'],
    staff: { doctors: { total: 650, available: 480 }, nurses: { total: 1300, available: 980 }, specialists: [{ specialization: 'cardiology', name: 'Dr. Devi Shetty', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 20, occupancyRate: 79 },
    location: { latitude: 12.8095, longitude: 77.6895 },
    rating: 4.6
  },
  {
    name: "Manipal Hospital Bangalore",
    address: { street: "HAL Airport Road", city: "Bangalore", state: "Karnataka", pincode: "560017" },
    contactNumber: "+91-80-25024444",
    email: "info@manipalhospital.com",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 60, generalBeds: 650, ventilators: 50, operationTheaters: 15, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: true, physiotherapy: true },
    specializations: ['neurology', 'cardiology'],
    staff: { doctors: { total: 280, available: 210 }, nurses: { total: 550, available: 420 }, specialists: [{ specialization: 'neurology', name: 'Dr. Suresh Babu', available: true }, { specialization: 'cardiology', name: 'Dr. Vivek Jawali', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 18, occupancyRate: 77 },
    location: { latitude: 12.9594, longitude: 77.6489 },
    rating: 4.5
  },
  {
    name: "Yashoda Hospitals Hyderabad",
    address: { street: "Somajiguda", city: "Hyderabad", state: "Telangana", pincode: "500082" },
    contactNumber: "+91-40-45674567",
    email: "info@yashodahospitals.com",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 90, generalBeds: 1000, ventilators: 70, operationTheaters: 22, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: true, physiotherapy: true },
    specializations: ['cardiology', 'oncology'],
    staff: { doctors: { total: 420, available: 315 }, nurses: { total: 850, available: 640 }, specialists: [{ specialization: 'cardiology', name: 'Dr. S Radhakrishnan', available: true }, { specialization: 'oncology', name: 'Dr. Rahul Naithani', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 22, occupancyRate: 74 },
    location: { latitude: 17.4260, longitude: 78.4492 },
    rating: 4.4
  },
  {
    name: "KIMS Hospital Hyderabad",
    address: { street: "Minister Road, Secunderabad", city: "Hyderabad", state: "Telangana", pincode: "500003" },
    contactNumber: "+91-40-44885000",
    email: "info@kimshospitals.com",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 70, generalBeds: 800, ventilators: 55, operationTheaters: 18, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: true, physiotherapy: true },
    specializations: ['neurology', 'cardiology'],
    staff: { doctors: { total: 350, available: 260 }, nurses: { total: 700, available: 530 }, specialists: [{ specialization: 'neurology', name: 'Dr. Subodh Raju', available: true }, { specialization: 'cardiology', name: 'Dr. Giridhar Kini', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 19, occupancyRate: 74 },
    location: { latitude: 17.4340, longitude: 78.4890 },
    rating: 4.3
  },
  {
    name: "AMRI Hospital Kolkata",
    address: { street: "Dhakuria", city: "Kolkata", state: "West Bengal", pincode: "700029" },
    contactNumber: "+91-33-66800000",
    email: "info@amrihospitals.in",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 50, generalBeds: 550, ventilators: 40, operationTheaters: 12, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: true, physiotherapy: true },
    specializations: ['cardiology'],
    staff: { doctors: { total: 230, available: 175 }, nurses: { total: 480, available: 360 }, specialists: [{ specialization: 'cardiology', name: 'Dr. Kunal Sarkar', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 18, occupancyRate: 73 },
    location: { latitude: 22.5093, longitude: 88.3660 },
    rating: 4.2
  },
  {
    name: "Apollo Gleneagles Hospital",
    address: { street: "Canal Circular Road", city: "Kolkata", state: "West Bengal", pincode: "700054" },
    contactNumber: "+91-33-23203040",
    email: "info@apollogleneagles.in",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 60, generalBeds: 700, ventilators: 50, operationTheaters: 15, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: true, physiotherapy: true },
    specializations: ['neurology', 'cardiology'],
    staff: { doctors: { total: 300, available: 225 }, nurses: { total: 600, available: 450 }, specialists: [{ specialization: 'neurology', name: 'Dr. Kalyan Bommakanti', available: true }, { specialization: 'cardiology', name: 'Dr. Saptarshi Basu', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 22, occupancyRate: 74 },
    location: { latitude: 22.5475, longitude: 88.3931 },
    rating: 4.4
  },
  {
    name: "Fortis Hospital Mohali",
    address: { street: "Sector 62, Phase 8", city: "Mohali", state: "Punjab", pincode: "160062" },
    contactNumber: "+91-172-5096001",
    email: "info@fortismohali.com",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 35, generalBeds: 375, ventilators: 30, operationTheaters: 10, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: true, physiotherapy: true },
    specializations: ['cardiology', 'neurology'],
    staff: { doctors: { total: 160, available: 120 }, nurses: { total: 320, available: 240 }, specialists: [{ specialization: 'cardiology', name: 'Dr. Harinder Singh Bedi', available: true }, { specialization: 'neurology', name: 'Dr. Sandeep Grewal', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 17, occupancyRate: 72 },
    location: { latitude: 30.7050, longitude: 76.7200 },
    rating: 4.5
  },
  {
    name: "Fortis Hospital Gurgaon",
    address: { street: "Sector 44", city: "Gurgaon", state: "Haryana", pincode: "122002" },
    contactNumber: "+91-124-4585555",
    email: "info@fortisgurgaon.com",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 90, generalBeds: 1000, ventilators: 70, operationTheaters: 22, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: true, physiotherapy: true },
    specializations: ['cardiology', 'oncology'],
    staff: { doctors: { total: 420, available: 315 }, nurses: { total: 850, available: 640 }, specialists: [{ specialization: 'cardiology', name: 'Dr. Ashok Seth', available: true }, { specialization: 'oncology', name: 'Dr. Hari Goyal', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 23, occupancyRate: 76 },
    location: { latitude: 28.4520, longitude: 77.0730 },
    rating: 4.4
  },
  {
    name: "BLK Max Super Speciality Hospital",
    address: { street: "Pusa Road", city: "New Delhi", state: "Delhi", pincode: "110005" },
    contactNumber: "+91-11-30403040",
    email: "info@blkmaxhospital.com",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 60, generalBeds: 650, ventilators: 50, operationTheaters: 15, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: true, physiotherapy: true },
    specializations: ['cardiology', 'neurology'],
    staff: { doctors: { total: 280, available: 210 }, nurses: { total: 560, available: 420 }, specialists: [{ specialization: 'cardiology', name: 'Dr. Sushant Srivastava', available: true }, { specialization: 'neurology', name: 'Dr. BK Misra', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 18, occupancyRate: 77 },
    location: { latitude: 28.6422, longitude: 77.1886 },
    rating: 4.3
  },
  {
    name: "Hinduja Hospital Mumbai",
    address: { street: "Veer Savarkar Marg, Mahim", city: "Mumbai", state: "Maharashtra", pincode: "400016" },
    contactNumber: "+91-22-24447000",
    email: "info@hindujahospital.com",
    type: "charitable",
    facilities: { emergencyServices: true, icu: true, icuBeds: 35, generalBeds: 400, ventilators: 30, operationTheaters: 10, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: true, physiotherapy: true },
    specializations: ['neurology', 'cardiology'],
    staff: { doctors: { total: 180, available: 135 }, nurses: { total: 360, available: 270 }, specialists: [{ specialization: 'neurology', name: 'Dr. Sunil Pandya', available: true }, { specialization: 'cardiology', name: 'Dr. Aashish Contractor', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 19, occupancyRate: 73 },
    location: { latitude: 19.0373, longitude: 72.8414 },
    rating: 4.4
  },
  {
    name: "Care Hospitals Hyderabad",
    address: { street: "Road No 1, Banjara Hills", city: "Hyderabad", state: "Telangana", pincode: "500034" },
    contactNumber: "+91-40-30417777",
    email: "info@carehospitals.com",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 65, generalBeds: 750, ventilators: 50, operationTheaters: 16, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: true, physiotherapy: true },
    specializations: ['cardiology'],
    staff: { doctors: { total: 320, available: 240 }, nurses: { total: 640, available: 480 }, specialists: [{ specialization: 'cardiology', name: 'Dr. B Soma Raju', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 22, occupancyRate: 75 },
    location: { latitude: 17.4156, longitude: 78.4484 },
    rating: 4.3
  },
  {
    name: "Aster CMI Hospital Bangalore",
    address: { street: "Hebbal", city: "Bangalore", state: "Karnataka", pincode: "560092" },
    contactNumber: "+91-80-43420100",
    email: "info@astercmi.com",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 45, generalBeds: 500, ventilators: 38, operationTheaters: 12, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: true, physiotherapy: true },
    specializations: ['neurology'],
    staff: { doctors: { total: 210, available: 160 }, nurses: { total: 420, available: 320 }, specialists: [{ specialization: 'neurology', name: 'Dr. Vikram Huded', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 18, occupancyRate: 72 },
    location: { latitude: 13.0358, longitude: 77.5970 },
    rating: 4.4
  },
  {
    name: "Jaslok Hospital Mumbai",
    address: { street: "Pedder Road", city: "Mumbai", state: "Maharashtra", pincode: "400026" },
    contactNumber: "+91-22-66573333",
    email: "info@jaslokhospital.net",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 30, generalBeds: 350, ventilators: 25, operationTheaters: 8, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: true, physiotherapy: true },
    specializations: ['cardiology'],
    staff: { doctors: { total: 150, available: 115 }, nurses: { total: 300, available: 228 }, specialists: [{ specialization: 'cardiology', name: 'Dr. Ashwin Mehta', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 17, occupancyRate: 73 },
    location: { latitude: 18.9693, longitude: 72.8073 },
    rating: 4.3
  },
  {
    name: "Bombay Hospital Mumbai",
    address: { street: "Marine Lines", city: "Mumbai", state: "Maharashtra", pincode: "400020" },
    contactNumber: "+91-22-22067676",
    email: "info@bombayhospital.com",
    type: "charitable",
    facilities: { emergencyServices: true, icu: true, icuBeds: 70, generalBeds: 800, ventilators: 55, operationTheaters: 18, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: true, physiotherapy: true },
    specializations: ['neurology', 'cardiology'],
    staff: { doctors: { total: 340, available: 255 }, nurses: { total: 680, available: 510 }, specialists: [{ specialization: 'neurology', name: 'Dr. BS Singhal', available: true }, { specialization: 'cardiology', name: 'Dr. Prafulla Kerkar', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 21, occupancyRate: 75 },
    location: { latitude: 18.9422, longitude: 72.8263 },
    rating: 4.2
  },
  {
    name: "Ruby Hall Clinic Pune",
    address: { street: "Sassoon Road", city: "Pune", state: "Maharashtra", pincode: "411001" },
    contactNumber: "+91-20-26163391",
    email: "info@rubyhall.com",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 18, generalBeds: 250, ventilators: 15, operationTheaters: 6, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: false, physiotherapy: true },
    specializations: ['orthopedics'],
    staff: { doctors: { total: 95, available: 72 }, nurses: { total: 210, available: 160 }, specialists: [{ specialization: 'orthopedics', name: 'Dr. Shrirang Limaye', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 15, occupancyRate: 72 },
    location: { latitude: 18.5322, longitude: 73.8760 },
    rating: 4.1
  },
  {
    name: "Fortis Hospital Pune",
    address: { street: "Aundh", city: "Pune", state: "Maharashtra", pincode: "411007" },
    contactNumber: "+91-20-66145200",
    email: "info@fortispune.com",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 20, generalBeds: 300, ventilators: 18, operationTheaters: 8, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: true, physiotherapy: true },
    specializations: ['cardiology'],
    staff: { doctors: { total: 120, available: 90 }, nurses: { total: 260, available: 195 }, specialists: [{ specialization: 'cardiology', name: 'Dr. Shirish Hiremath', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 22, occupancyRate: 80 },
    location: { latitude: 18.5580, longitude: 73.8138 },
    rating: 4.2
  },
  {
    name: "Deenanath Mangeshkar Hospital",
    address: { street: "Erandwane", city: "Pune", state: "Maharashtra", pincode: "411004" },
    contactNumber: "+91-20-40151000",
    email: "info@dmhospital.org",
    type: "charitable",
    facilities: { emergencyServices: true, icu: true, icuBeds: 32, generalBeds: 400, ventilators: 28, operationTheaters: 10, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: true, physiotherapy: true },
    specializations: ['neurology'],
    staff: { doctors: { total: 180, available: 135 }, nurses: { total: 390, available: 295 }, specialists: [{ specialization: 'neurology', name: 'Dr. Rahul Kulkarni', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 17, occupancyRate: 74 },
    location: { latitude: 18.5089, longitude: 73.8332 },
    rating: 4.4
  },
  {
    name: "Aditya Birla Memorial Hospital",
    address: { street: "Chinchwad", city: "Pune", state: "Maharashtra", pincode: "411033" },
    contactNumber: "+91-20-30717171",
    email: "info@adityabirlahospital.com",
    type: "private",
    facilities: { emergencyServices: true, icu: true, icuBeds: 40, generalBeds: 500, ventilators: 35, operationTheaters: 12, ambulanceService: true, bloodBank: true, pharmacy: true, laboratory: true, radiology: true, mriScanner: true, ctScanner: true, dialysis: true, physiotherapy: true },
    specializations: ['cardiology', 'trauma'],
    staff: { doctors: { total: 210, available: 158 }, nurses: { total: 460, available: 345 }, specialists: [{ specialization: 'cardiology', name: 'Dr. Ajit Desai', available: true }, { specialization: 'trauma', name: 'Dr. Santosh Ghalsasi', available: true }] },
    currentStatus: { isAcceptingPatients: true, emergencyAvailable: true, waitTime: 18, occupancyRate: 76 },
    location: { latitude: 18.6298, longitude: 73.8013 },
    rating: 4.3
  }
];

const seedHospitals = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing hospitals only (preserves user registrations)
    await Hospital.deleteMany({});
    console.log('Cleared existing hospitals');

    // Insert seed data
    const inserted = await Hospital.insertMany(hospitals);
    console.log(`Inserted ${inserted.length} hospitals`);

    console.log('\n========================================');
    console.log('Seed completed successfully!');
    console.log('========================================');
    console.log(`\n${inserted.length} hospitals are now available.`);
    console.log('Hospital staff can register at the NERVE portal.');
    console.log('----------------------------------------\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seedHospitals();
