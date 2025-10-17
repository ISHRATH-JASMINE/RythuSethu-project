import express from 'express';
import ColdStorage from '../models/ColdStorage.js';

const router = express.Router();

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

// Get nearby cold storages by coordinates (GPS)
router.get('/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radius = 100, limit = 10, type } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        message: 'Latitude and longitude are required'
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const radiusInKm = parseFloat(radius);
    const maxResults = parseInt(limit);

    // Build query
    let query = { isActive: true };
    if (type && type !== 'all') {
      query.type = type;
    }

    // Get all active storages
    const storages = await ColdStorage.find(query);

    // Calculate distances and filter by radius
    const storagesWithDistance = storages
      .map(storage => {
        const distance = calculateDistance(
          lat,
          lng,
          storage.location.coordinates[1],
          storage.location.coordinates[0]
        );
        return {
          ...storage.toObject(),
          distance: Math.round(distance * 10) / 10, // Round to 1 decimal
          distanceText: distance < 1 
            ? `${Math.round(distance * 1000)}m` 
            : `${Math.round(distance * 10) / 10}km`
        };
      })
      .filter(storage => storage.distance <= radiusInKm)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, maxResults);

    res.json({
      success: true,
      count: storagesWithDistance.length,
      searchLocation: { latitude: lat, longitude: lng },
      radius: radiusInKm,
      storages: storagesWithDistance
    });
  } catch (error) {
    console.error('Nearby storage error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get cold storages by pincode
router.get('/pincode/:pincode', async (req, res) => {
  try {
    const { pincode } = req.params;
    const { radius = 50, limit = 10, type } = req.query;

    // Find storage with exact pincode match
    const exactMatch = await ColdStorage.findOne({ 
      'address.pincode': pincode,
      isActive: true 
    });

    if (exactMatch) {
      // Use exact match location as center
      const lat = exactMatch.location.coordinates[1];
      const lng = exactMatch.location.coordinates[0];

      // Build query
      let query = { isActive: true };
      if (type && type !== 'all') {
        query.type = type;
      }

      const storages = await ColdStorage.find(query);

      const storagesWithDistance = storages
        .map(storage => {
          const distance = calculateDistance(
            lat,
            lng,
            storage.location.coordinates[1],
            storage.location.coordinates[0]
          );
          return {
            ...storage.toObject(),
            distance: Math.round(distance * 10) / 10,
            distanceText: distance < 1 
              ? `${Math.round(distance * 1000)}m` 
              : `${Math.round(distance * 10) / 10}km`,
            isExactMatch: storage._id.toString() === exactMatch._id.toString()
          };
        })
        .filter(storage => storage.distance <= parseFloat(radius))
        .sort((a, b) => {
          // Exact match first, then by distance
          if (a.isExactMatch) return -1;
          if (b.isExactMatch) return 1;
          return a.distance - b.distance;
        })
        .slice(0, parseInt(limit));

      return res.json({
        success: true,
        count: storagesWithDistance.length,
        pincode,
        searchLocation: {
          latitude: lat,
          longitude: lng,
          source: exactMatch.name
        },
        storages: storagesWithDistance
      });
    }

    // If no exact match, search nearby pincodes
    const nearby = await ColdStorage.find({
      'address.pincode': {
        $regex: `^${pincode.substring(0, 3)}` // Match first 3 digits
      },
      isActive: true
    }).limit(parseInt(limit));

    res.json({
      success: true,
      count: nearby.length,
      pincode,
      message: nearby.length > 0 
        ? 'No exact pincode match. Showing nearby storages.'
        : 'No storages found for this pincode.',
      storages: nearby.map(storage => ({
        ...storage.toObject(),
        distance: null,
        distanceText: 'Same region'
      }))
    });
  } catch (error) {
    console.error('Pincode search error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get cold storages by district
router.get('/district/:district', async (req, res) => {
  try {
    const { district } = req.params;
    const { type, limit = 20 } = req.query;

    let query = {
      'address.district': { $regex: new RegExp(district, 'i') },
      isActive: true
    };

    if (type && type !== 'all') {
      query.type = type;
    }

    const storages = await ColdStorage.find(query)
      .limit(parseInt(limit))
      .sort({ rating: -1 });

    res.json({
      success: true,
      count: storages.length,
      district,
      storages
    });
  } catch (error) {
    console.error('District search error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all storage types
router.get('/types', async (req, res) => {
  try {
    const types = await ColdStorage.distinct('type');
    res.json({
      success: true,
      types
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get storage statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await ColdStorage.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalStorages: { $sum: 1 },
          totalCapacity: { $sum: '$facilities.capacity.value' },
          avgRating: { $avg: '$rating' },
          governmentApproved: {
            $sum: { $cond: ['$governmentApproved', 1, 0] }
          }
        }
      }
    ]);

    const byState = await ColdStorage.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$address.state',
          count: { $sum: 1 },
          capacity: { $sum: '$facilities.capacity.value' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const byType = await ColdStorage.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      overall: stats[0] || {},
      byState,
      byType
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get storage by ID
router.get('/:id', async (req, res) => {
  try {
    const storage = await ColdStorage.findById(req.params.id);
    
    if (!storage) {
      return res.status(404).json({ message: 'Storage not found' });
    }

    res.json({
      success: true,
      storage
    });
  } catch (error) {
    console.error('Get storage error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Search storages by text (name, district, village)
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 10 } = req.query;

    const storages = await ColdStorage.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { 'address.district': { $regex: query, $options: 'i' } },
        { 'address.village': { $regex: query, $options: 'i' } },
        { 'address.mandal': { $regex: query, $options: 'i' } }
      ],
      isActive: true
    })
      .limit(parseInt(limit))
      .sort({ rating: -1 });

    res.json({
      success: true,
      count: storages.length,
      query,
      storages
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
