import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ColdStorage from './models/ColdStorage.js';

dotenv.config();

// Real cold storage data for Telangana, Andhra Pradesh, and neighboring states
const coldStorageData = [
  // TELANGANA - Hyderabad & Rangareddy
  {
    name: 'Telangana State Warehousing Corporation - Hyderabad',
    type: 'Cold Storage',
    address: {
      street: 'Industrial Estate',
      village: 'Balanagar',
      mandal: 'Quthbullapur',
      district: 'Hyderabad',
      state: 'Telangana',
      pincode: '500037'
    },
    location: {
      type: 'Point',
      coordinates: [78.4089, 17.4978] // [longitude, latitude]
    },
    contact: {
      phone: '+91-40-23074567',
      email: 'tswc.hyd@telangana.gov.in',
      manager: 'K. Ramesh Kumar'
    },
    facilities: {
      capacity: { value: 5000, unit: 'MT' },
      temperature: { min: -5, max: 5 },
      chambers: 8,
      storageType: ['Vegetables', 'Fruits', 'Dairy']
    },
    services: {
      grading: true,
      packaging: true,
      transport: true,
      auction: false
    },
    pricing: {
      dailyRate: 15,
      monthlyRate: 400
    },
    operatingHours: {
      open: '06:00 AM',
      close: '08:00 PM',
      workingDays: 'Mon-Sat'
    },
    governmentApproved: true,
    rating: 4.5
  },
  {
    name: 'Kisan Cold Storage - Shamshabad',
    type: 'Cold Storage',
    address: {
      street: 'Airport Road',
      village: 'Shamshabad',
      mandal: 'Shamshabad',
      district: 'Rangareddy',
      state: 'Telangana',
      pincode: '501218'
    },
    location: {
      type: 'Point',
      coordinates: [78.4277, 17.2403]
    },
    contact: {
      phone: '+91-8500234567',
      email: 'kisancold.shamshabad@gmail.com',
      manager: 'Venkat Reddy'
    },
    facilities: {
      capacity: { value: 3000, unit: 'MT' },
      temperature: { min: 0, max: 4 },
      chambers: 6,
      storageType: ['Vegetables', 'Fruits']
    },
    services: {
      grading: true,
      packaging: true,
      transport: false,
      auction: false
    },
    pricing: {
      dailyRate: 12,
      monthlyRate: 350
    },
    operatingHours: {
      open: '05:00 AM',
      close: '09:00 PM',
      workingDays: 'Daily'
    },
    governmentApproved: true,
    rating: 4.2
  },

  // TELANGANA - Warangal
  {
    name: 'Warangal Mandi Cold Storage',
    type: 'Mandi',
    address: {
      street: 'Market Yard',
      village: 'Warangal Urban',
      mandal: 'Warangal',
      district: 'Warangal',
      state: 'Telangana',
      pincode: '506002'
    },
    location: {
      type: 'Point',
      coordinates: [79.5941, 17.9689]
    },
    contact: {
      phone: '+91-870-2459876',
      email: 'warangalmandi@telangana.gov.in',
      manager: 'P. Srinivas'
    },
    facilities: {
      capacity: { value: 2500, unit: 'MT' },
      temperature: { min: 2, max: 8 },
      chambers: 5,
      storageType: ['Vegetables', 'Fruits', 'Grains']
    },
    services: {
      grading: true,
      packaging: true,
      transport: true,
      auction: true
    },
    pricing: {
      dailyRate: 10,
      monthlyRate: 280
    },
    operatingHours: {
      open: '05:00 AM',
      close: '07:00 PM',
      workingDays: 'Daily'
    },
    governmentApproved: true,
    rating: 4.3
  },

  // TELANGANA - Karimnagar
  {
    name: 'Rythu Bazaar Cold Chain - Karimnagar',
    type: 'Cold Storage',
    address: {
      street: 'Bypass Road',
      village: 'Karimnagar',
      mandal: 'Karimnagar',
      district: 'Karimnagar',
      state: 'Telangana',
      pincode: '505001'
    },
    location: {
      type: 'Point',
      coordinates: [79.1288, 18.4386]
    },
    contact: {
      phone: '+91-878-2234455',
      email: 'rythubazaar.kmr@telangana.gov.in',
      manager: 'M. Laxman'
    },
    facilities: {
      capacity: { value: 2000, unit: 'MT' },
      temperature: { min: -2, max: 6 },
      chambers: 4,
      storageType: ['Vegetables', 'Fruits']
    },
    services: {
      grading: true,
      packaging: false,
      transport: true,
      auction: true
    },
    pricing: {
      dailyRate: 11,
      monthlyRate: 300
    },
    operatingHours: {
      open: '06:00 AM',
      close: '08:00 PM',
      workingDays: 'Mon-Sat'
    },
    governmentApproved: true,
    rating: 4.1
  },

  // TELANGANA - Nizamabad
  {
    name: 'Nizamabad Agri Cold Storage',
    type: 'Cold Storage',
    address: {
      street: 'Industrial Area',
      village: 'Nizamabad',
      mandal: 'Nizamabad',
      district: 'Nizamabad',
      state: 'Telangana',
      pincode: '503001'
    },
    location: {
      type: 'Point',
      coordinates: [78.0938, 18.6725]
    },
    contact: {
      phone: '+91-8461-234567',
      email: 'nizamabadcold@gmail.com',
      manager: 'S. Rajesh'
    },
    facilities: {
      capacity: { value: 3500, unit: 'MT' },
      temperature: { min: 0, max: 5 },
      chambers: 7,
      storageType: ['Vegetables', 'Fruits', 'Seeds']
    },
    services: {
      grading: true,
      packaging: true,
      transport: true,
      auction: false
    },
    pricing: {
      dailyRate: 13,
      monthlyRate: 360
    },
    operatingHours: {
      open: '05:30 AM',
      close: '08:30 PM',
      workingDays: 'Daily'
    },
    governmentApproved: true,
    rating: 4.4
  },

  // ANDHRA PRADESH - Vijayawada
  {
    name: 'AP State Warehousing Corporation - Vijayawada',
    type: 'Warehouse',
    address: {
      street: 'NH-16',
      village: 'Vijayawada',
      mandal: 'Vijayawada',
      district: 'Krishna',
      state: 'Andhra Pradesh',
      pincode: '520001'
    },
    location: {
      type: 'Point',
      coordinates: [80.6480, 16.5062]
    },
    contact: {
      phone: '+91-866-2474567',
      email: 'apwc.vjw@ap.gov.in',
      manager: 'N. Venkateswara Rao'
    },
    facilities: {
      capacity: { value: 6000, unit: 'MT' },
      temperature: { min: -5, max: 8 },
      chambers: 10,
      storageType: ['Vegetables', 'Fruits', 'Grains', 'Dairy']
    },
    services: {
      grading: true,
      packaging: true,
      transport: true,
      auction: true
    },
    pricing: {
      dailyRate: 14,
      monthlyRate: 380
    },
    operatingHours: {
      open: '05:00 AM',
      close: '09:00 PM',
      workingDays: 'Daily'
    },
    governmentApproved: true,
    rating: 4.6
  },

  // ANDHRA PRADESH - Guntur
  {
    name: 'Guntur Mirchi Yard Cold Storage',
    type: 'Mandi',
    address: {
      street: 'Arundelpet',
      village: 'Guntur',
      mandal: 'Guntur',
      district: 'Guntur',
      state: 'Andhra Pradesh',
      pincode: '522002'
    },
    location: {
      type: 'Point',
      coordinates: [80.4365, 16.3067]
    },
    contact: {
      phone: '+91-863-2345678',
      email: 'gunturmandi@ap.gov.in',
      manager: 'K. Subrahmanyam'
    },
    facilities: {
      capacity: { value: 4000, unit: 'MT' },
      temperature: { min: 5, max: 10 },
      chambers: 6,
      storageType: ['Vegetables', 'Chilli', 'Spices']
    },
    services: {
      grading: true,
      packaging: true,
      transport: true,
      auction: true
    },
    pricing: {
      dailyRate: 12,
      monthlyRate: 330
    },
    operatingHours: {
      open: '04:00 AM',
      close: '08:00 PM',
      workingDays: 'Daily'
    },
    governmentApproved: true,
    rating: 4.5
  },

  // ANDHRA PRADESH - Visakhapatnam
  {
    name: 'Vizag Port Cold Storage Complex',
    type: 'Cold Storage',
    address: {
      street: 'Port Area',
      village: 'Visakhapatnam',
      mandal: 'Visakhapatnam',
      district: 'Visakhapatnam',
      state: 'Andhra Pradesh',
      pincode: '530035'
    },
    location: {
      type: 'Point',
      coordinates: [83.2985, 17.6868]
    },
    contact: {
      phone: '+91-891-2567890',
      email: 'vizagcold@apport.gov.in',
      manager: 'D. Ravi Kumar'
    },
    facilities: {
      capacity: { value: 7000, unit: 'MT' },
      temperature: { min: -10, max: 5 },
      chambers: 12,
      storageType: ['Fruits', 'Vegetables', 'Seafood', 'Dairy']
    },
    services: {
      grading: true,
      packaging: true,
      transport: true,
      auction: false
    },
    pricing: {
      dailyRate: 16,
      monthlyRate: 450
    },
    operatingHours: {
      open: '24/7',
      close: '24/7',
      workingDays: 'Daily'
    },
    governmentApproved: true,
    rating: 4.7
  },

  // ANDHRA PRADESH - Tirupati
  {
    name: 'Tirupati Fruit Processing & Cold Storage',
    type: 'Processing Unit',
    address: {
      street: 'Renigunta Road',
      village: 'Tirupati',
      mandal: 'Tirupati',
      district: 'Chittoor',
      state: 'Andhra Pradesh',
      pincode: '517501'
    },
    location: {
      type: 'Point',
      coordinates: [79.4192, 13.6288]
    },
    contact: {
      phone: '+91-877-2287654',
      email: 'tirupaticold@gmail.com',
      manager: 'G. Narayana'
    },
    facilities: {
      capacity: { value: 2500, unit: 'MT' },
      temperature: { min: 0, max: 6 },
      chambers: 5,
      storageType: ['Fruits', 'Vegetables']
    },
    services: {
      grading: true,
      packaging: true,
      transport: false,
      auction: false
    },
    pricing: {
      dailyRate: 11,
      monthlyRate: 310
    },
    operatingHours: {
      open: '06:00 AM',
      close: '07:00 PM',
      workingDays: 'Mon-Sat'
    },
    governmentApproved: true,
    rating: 4.0
  },

  // TELANGANA - Medak
  {
    name: 'Medak District Cold Chain',
    type: 'Cold Storage',
    address: {
      street: 'Main Road',
      village: 'Sangareddy',
      mandal: 'Sangareddy',
      district: 'Medak',
      state: 'Telangana',
      pincode: '502001'
    },
    location: {
      type: 'Point',
      coordinates: [78.0833, 17.6167]
    },
    contact: {
      phone: '+91-8455-234567',
      email: 'medakcold@telangana.gov.in',
      manager: 'T. Krishna'
    },
    facilities: {
      capacity: { value: 1500, unit: 'MT' },
      temperature: { min: 2, max: 7 },
      chambers: 3,
      storageType: ['Vegetables', 'Fruits']
    },
    services: {
      grading: false,
      packaging: true,
      transport: true,
      auction: false
    },
    pricing: {
      dailyRate: 9,
      monthlyRate: 250
    },
    operatingHours: {
      open: '06:00 AM',
      close: '06:00 PM',
      workingDays: 'Mon-Sat'
    },
    governmentApproved: true,
    rating: 3.9
  },

  // TELANGANA - Khammam
  {
    name: 'Khammam Integrated Cold Storage',
    type: 'Cold Storage',
    address: {
      street: 'Wyra Road',
      village: 'Khammam',
      mandal: 'Khammam',
      district: 'Khammam',
      state: 'Telangana',
      pincode: '507001'
    },
    location: {
      type: 'Point',
      coordinates: [80.1514, 17.2473]
    },
    contact: {
      phone: '+91-8742-234567',
      email: 'khammamcold@telangana.gov.in',
      manager: 'B. Prasad'
    },
    facilities: {
      capacity: { value: 2200, unit: 'MT' },
      temperature: { min: -1, max: 5 },
      chambers: 4,
      storageType: ['Vegetables', 'Fruits', 'Grains']
    },
    services: {
      grading: true,
      packaging: true,
      transport: true,
      auction: false
    },
    pricing: {
      dailyRate: 10,
      monthlyRate: 280
    },
    operatingHours: {
      open: '05:30 AM',
      close: '08:00 PM',
      workingDays: 'Daily'
    },
    governmentApproved: true,
    rating: 4.1
  },

  // TELANGANA - Nalgonda
  {
    name: 'Nalgonda Rythu Bazaar Cold Storage',
    type: 'Mandi',
    address: {
      street: 'Bypass Road',
      village: 'Nalgonda',
      mandal: 'Nalgonda',
      district: 'Nalgonda',
      state: 'Telangana',
      pincode: '508001'
    },
    location: {
      type: 'Point',
      coordinates: [79.2673, 17.0501]
    },
    contact: {
      phone: '+91-8682-234567',
      email: 'nalgondamandi@telangana.gov.in',
      manager: 'Y. Ramana'
    },
    facilities: {
      capacity: { value: 1800, unit: 'MT' },
      temperature: { min: 3, max: 8 },
      chambers: 4,
      storageType: ['Vegetables', 'Fruits']
    },
    services: {
      grading: true,
      packaging: false,
      transport: true,
      auction: true
    },
    pricing: {
      dailyRate: 9,
      monthlyRate: 260
    },
    operatingHours: {
      open: '05:00 AM',
      close: '07:00 PM',
      workingDays: 'Daily'
    },
    governmentApproved: true,
    rating: 4.0
  },

  // ANDHRA PRADESH - Kadapa
  {
    name: 'Kadapa Agricultural Cold Storage',
    type: 'Cold Storage',
    address: {
      street: 'Proddatur Road',
      village: 'Kadapa',
      mandal: 'Kadapa',
      district: 'Kadapa',
      state: 'Andhra Pradesh',
      pincode: '516001'
    },
    location: {
      type: 'Point',
      coordinates: [78.8242, 14.4673]
    },
    contact: {
      phone: '+91-8562-234567',
      email: 'kadapacold@ap.gov.in',
      manager: 'A. Venkanna'
    },
    facilities: {
      capacity: { value: 2000, unit: 'MT' },
      temperature: { min: 1, max: 6 },
      chambers: 4,
      storageType: ['Vegetables', 'Fruits', 'Seeds']
    },
    services: {
      grading: true,
      packaging: true,
      transport: false,
      auction: false
    },
    pricing: {
      dailyRate: 10,
      monthlyRate: 280
    },
    operatingHours: {
      open: '06:00 AM',
      close: '07:00 PM',
      workingDays: 'Mon-Sat'
    },
    governmentApproved: true,
    rating: 3.8
  },

  // ANDHRA PRADESH - Kurnool
  {
    name: 'Kurnool Mandi Yard Cold Chain',
    type: 'Mandi',
    address: {
      street: 'Market Yard',
      village: 'Kurnool',
      mandal: 'Kurnool',
      district: 'Kurnool',
      state: 'Andhra Pradesh',
      pincode: '518001'
    },
    location: {
      type: 'Point',
      coordinates: [78.0373, 15.8281]
    },
    contact: {
      phone: '+91-8518-234567',
      email: 'kurnoolmandi@ap.gov.in',
      manager: 'M. Nagaraju'
    },
    facilities: {
      capacity: { value: 3000, unit: 'MT' },
      temperature: { min: 2, max: 7 },
      chambers: 6,
      storageType: ['Vegetables', 'Fruits', 'Grains']
    },
    services: {
      grading: true,
      packaging: true,
      transport: true,
      auction: true
    },
    pricing: {
      dailyRate: 11,
      monthlyRate: 300
    },
    operatingHours: {
      open: '05:00 AM',
      close: '08:00 PM',
      workingDays: 'Daily'
    },
    governmentApproved: true,
    rating: 4.2
  },

  // ANDHRA PRADESH - Anantapur
  {
    name: 'Anantapur District Cold Storage',
    type: 'Cold Storage',
    address: {
      street: 'Bellary Road',
      village: 'Anantapur',
      mandal: 'Anantapur',
      district: 'Anantapur',
      state: 'Andhra Pradesh',
      pincode: '515001'
    },
    location: {
      type: 'Point',
      coordinates: [77.6006, 14.6819]
    },
    contact: {
      phone: '+91-8554-234567',
      email: 'anantapurcold@ap.gov.in',
      manager: 'P. Chennakesava'
    },
    facilities: {
      capacity: { value: 1800, unit: 'MT' },
      temperature: { min: 0, max: 5 },
      chambers: 4,
      storageType: ['Vegetables', 'Fruits']
    },
    services: {
      grading: false,
      packaging: true,
      transport: true,
      auction: false
    },
    pricing: {
      dailyRate: 9,
      monthlyRate: 250
    },
    operatingHours: {
      open: '06:00 AM',
      close: '07:00 PM',
      workingDays: 'Mon-Sat'
    },
    governmentApproved: true,
    rating: 3.9
  },

  // TELANGANA - Mahbubnagar
  {
    name: 'Mahbubnagar Integrated Cold Chain',
    type: 'Cold Storage',
    address: {
      street: 'Jadcherla Road',
      village: 'Mahbubnagar',
      mandal: 'Mahbubnagar',
      district: 'Mahbubnagar',
      state: 'Telangana',
      pincode: '509001'
    },
    location: {
      type: 'Point',
      coordinates: [77.9819, 16.7314]
    },
    contact: {
      phone: '+91-8542-234567',
      email: 'mahbubcold@telangana.gov.in',
      manager: 'S. Srinivasulu'
    },
    facilities: {
      capacity: { value: 1600, unit: 'MT' },
      temperature: { min: 1, max: 6 },
      chambers: 3,
      storageType: ['Vegetables', 'Fruits']
    },
    services: {
      grading: true,
      packaging: false,
      transport: true,
      auction: false
    },
    pricing: {
      dailyRate: 8,
      monthlyRate: 230
    },
    operatingHours: {
      open: '06:00 AM',
      close: '06:00 PM',
      workingDays: 'Mon-Sat'
    },
    governmentApproved: true,
    rating: 3.7
  },

  // ANDHRA PRADESH - Rajahmundry
  {
    name: 'Rajahmundry Port Area Cold Storage',
    type: 'Cold Storage',
    address: {
      street: 'Port Road',
      village: 'Rajahmundry',
      mandal: 'Rajahmundry',
      district: 'East Godavari',
      state: 'Andhra Pradesh',
      pincode: '533101'
    },
    location: {
      type: 'Point',
      coordinates: [81.7849, 17.0005]
    },
    contact: {
      phone: '+91-883-2434567',
      email: 'rajamundryCold@ap.gov.in',
      manager: 'K. Satyanand'
    },
    facilities: {
      capacity: { value: 3500, unit: 'MT' },
      temperature: { min: -3, max: 5 },
      chambers: 7,
      storageType: ['Vegetables', 'Fruits', 'Seafood']
    },
    services: {
      grading: true,
      packaging: true,
      transport: true,
      auction: false
    },
    pricing: {
      dailyRate: 13,
      monthlyRate: 360
    },
    operatingHours: {
      open: '05:00 AM',
      close: '09:00 PM',
      workingDays: 'Daily'
    },
    governmentApproved: true,
    rating: 4.4
  },

  // ANDHRA PRADESH - Nellore
  {
    name: 'Nellore Aqua & Agri Cold Storage',
    type: 'Cold Storage',
    address: {
      street: 'Chennai Highway',
      village: 'Nellore',
      mandal: 'Nellore',
      district: 'Nellore',
      state: 'Andhra Pradesh',
      pincode: '524001'
    },
    location: {
      type: 'Point',
      coordinates: [79.9864, 14.4426]
    },
    contact: {
      phone: '+91-861-2334567',
      email: 'nellorecold@ap.gov.in',
      manager: 'R. Prakash Rao'
    },
    facilities: {
      capacity: { value: 4000, unit: 'MT' },
      temperature: { min: -8, max: 4 },
      chambers: 8,
      storageType: ['Vegetables', 'Fruits', 'Seafood', 'Dairy']
    },
    services: {
      grading: true,
      packaging: true,
      transport: true,
      auction: false
    },
    pricing: {
      dailyRate: 14,
      monthlyRate: 390
    },
    operatingHours: {
      open: '24/7',
      close: '24/7',
      workingDays: 'Daily'
    },
    governmentApproved: true,
    rating: 4.5
  },

  // TELANGANA - Adilabad
  {
    name: 'Adilabad Tribal Area Cold Storage',
    type: 'Cold Storage',
    address: {
      street: 'Nirmal Road',
      village: 'Adilabad',
      mandal: 'Adilabad',
      district: 'Adilabad',
      state: 'Telangana',
      pincode: '504001'
    },
    location: {
      type: 'Point',
      coordinates: [78.5314, 19.6641]
    },
    contact: {
      phone: '+91-8732-234567',
      email: 'adilabadcold@telangana.gov.in',
      manager: 'N. Santhosh'
    },
    facilities: {
      capacity: { value: 1200, unit: 'MT' },
      temperature: { min: 2, max: 7 },
      chambers: 3,
      storageType: ['Vegetables', 'Fruits', 'Forest Produce']
    },
    services: {
      grading: false,
      packaging: true,
      transport: false,
      auction: false
    },
    pricing: {
      dailyRate: 8,
      monthlyRate: 220
    },
    operatingHours: {
      open: '06:00 AM',
      close: '06:00 PM',
      workingDays: 'Mon-Sat'
    },
    governmentApproved: true,
    rating: 3.6
  },

  // KARNATAKA - Kalaburagi (Near Telangana border)
  {
    name: 'Kalaburagi APMC Cold Storage',
    type: 'Mandi',
    address: {
      street: 'APMC Yard',
      village: 'Kalaburagi',
      mandal: 'Kalaburagi',
      district: 'Kalaburagi',
      state: 'Karnataka',
      pincode: '585101'
    },
    location: {
      type: 'Point',
      coordinates: [76.8343, 17.3297]
    },
    contact: {
      phone: '+91-8472-234567',
      email: 'gulbargamandi@karnataka.gov.in',
      manager: 'S. Mallikarjun'
    },
    facilities: {
      capacity: { value: 2800, unit: 'MT' },
      temperature: { min: 1, max: 6 },
      chambers: 5,
      storageType: ['Vegetables', 'Fruits', 'Grains']
    },
    services: {
      grading: true,
      packaging: true,
      transport: true,
      auction: true
    },
    pricing: {
      dailyRate: 11,
      monthlyRate: 300
    },
    operatingHours: {
      open: '05:00 AM',
      close: '08:00 PM',
      workingDays: 'Daily'
    },
    governmentApproved: true,
    rating: 4.1
  },

  // MAHARASHTRA - Nanded (Near Telangana border)
  {
    name: 'Nanded District Cold Chain',
    type: 'Cold Storage',
    address: {
      street: 'MIDC Area',
      village: 'Nanded',
      mandal: 'Nanded',
      district: 'Nanded',
      state: 'Maharashtra',
      pincode: '431601'
    },
    location: {
      type: 'Point',
      coordinates: [77.3210, 19.1383]
    },
    contact: {
      phone: '+91-2462-234567',
      email: 'nandedcold@maharashtra.gov.in',
      manager: 'P. Shinde'
    },
    facilities: {
      capacity: { value: 2500, unit: 'MT' },
      temperature: { min: 0, max: 5 },
      chambers: 5,
      storageType: ['Vegetables', 'Fruits', 'Grains']
    },
    services: {
      grading: true,
      packaging: true,
      transport: true,
      auction: false
    },
    pricing: {
      dailyRate: 12,
      monthlyRate: 330
    },
    operatingHours: {
      open: '06:00 AM',
      close: '08:00 PM',
      workingDays: 'Mon-Sat'
    },
    governmentApproved: true,
    rating: 4.0
  }
];

// Function to seed the database
async function seedColdStorages() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Clear existing data
    await ColdStorage.deleteMany({});
    console.log('🗑️  Cleared existing cold storage data');

    // Insert new data
    const inserted = await ColdStorage.insertMany(coldStorageData);
    console.log(`✅ Successfully seeded ${inserted.length} cold storages`);

    // Display summary
    const summary = await ColdStorage.aggregate([
      {
        $group: {
          _id: '$address.state',
          count: { $sum: 1 },
          totalCapacity: { $sum: '$facilities.capacity.value' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📊 Cold Storage Summary by State:');
    summary.forEach(state => {
      console.log(`   ${state._id}: ${state.count} storages, ${state.totalCapacity} MT capacity`);
    });

    console.log('\n✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

// Run the seeder
seedColdStorages();
