// api/get-love-profile.js
// Get user's love profile data for LP display

const { getUserLoveProfile } = require('../utils/love-type-mapper');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  
  try {
    const loveProfile = await getUserLoveProfile(userId);
    
    if (!loveProfile) {
      return res.status(404).json({ 
        error: 'Profile not found or incomplete',
        message: 'Please complete the questionnaire first' 
      });
    }
    
    return res.status(200).json({
      success: true,
      profile: loveProfile,
      userId: userId
    });
    
  } catch (error) {
    console.error('Error fetching love profile:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch profile',
      message: error.message 
    });
  }
};