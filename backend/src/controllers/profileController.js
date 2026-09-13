const {
  getFarmerProfile,
  updateFarmerProfile,
  getExpertProfile,
  updateExpertProfile,
  getBuyerProfile,
  updateBuyerProfile,
  getAdminUsers,
  getAdminExperts,
} = require('../services/profileService');

async function fetchFarmerProfile(req, res, next) {
  try {
    const result = await getFarmerProfile(req.user.userId);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
}

async function updateFarmerProfileHandler(req, res, next) {
  try {
    const result = await updateFarmerProfile(req.user.userId, req.body);
    return res.status(200).json({ success: true, message: 'Farmer profile updated successfully.', data: result });
  } catch (error) {
    return next(error);
  }
}

async function fetchExpertProfile(req, res, next) {
  try {
    const result = await getExpertProfile(req.user.userId);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
}

async function updateExpertProfileHandler(req, res, next) {
  try {
    const result = await updateExpertProfile(req.user.userId, req.body);
    return res.status(200).json({ success: true, message: 'Expert profile updated successfully.', data: result });
  } catch (error) {
    return next(error);
  }
}

async function fetchBuyerProfile(req, res, next) {
  try {
    const result = await getBuyerProfile(req.user.userId);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
}

async function updateBuyerProfileHandler(req, res, next) {
  try {
    const result = await updateBuyerProfile(req.user.userId, req.body);
    return res.status(200).json({ success: true, message: 'Buyer profile updated successfully.', data: result });
  } catch (error) {
    return next(error);
  }
}

async function listAdminUsers(req, res, next) {
  try {
    const users = await getAdminUsers();
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    return next(error);
  }
}

async function listAdminExperts(req, res, next) {
  try {
    const experts = await getAdminExperts();
    return res.status(200).json({ success: true, data: experts });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  fetchFarmerProfile,
  updateFarmerProfileHandler,
  fetchExpertProfile,
  updateExpertProfileHandler,
  fetchBuyerProfile,
  updateBuyerProfileHandler,
  listAdminUsers,
  listAdminExperts,
};
