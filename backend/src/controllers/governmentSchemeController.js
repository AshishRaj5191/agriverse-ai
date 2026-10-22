const {
  listGovernmentSchemes,
  getGovernmentSchemeById,
  createGovernmentScheme,
  updateGovernmentScheme,
  deleteGovernmentScheme,
} = require('../services/governmentSchemeService');

async function getGovernmentSchemes(req, res, next) {
  try {
    const schemes = await listGovernmentSchemes({
      search: req.query.search || req.query.q || '',
      governmentLevel: req.query.governmentLevel || '',
      category: req.query.category || '',
      state: req.query.state || '',
    });

    return res.status(200).json({ success: true, data: schemes });
  } catch (error) {
    return next(error);
  }
}

async function getGovernmentScheme(req, res, next) {
  try {
    const scheme = await getGovernmentSchemeById(req.params.id || req.params.schemeId);

    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Government scheme not found.' });
    }

    return res.status(200).json({ success: true, data: scheme });
  } catch (error) {
    return next(error);
  }
}

async function searchGovernmentSchemes(req, res, next) {
  try {
    const query = req.query.q || req.query.search || '';
    const schemes = await listGovernmentSchemes({ search: query });
    return res.status(200).json({ success: true, data: schemes });
  } catch (error) {
    return next(error);
  }
}

async function getGovernmentSchemesByCategory(req, res, next) {
  try {
    const schemes = await listGovernmentSchemes({ category: req.params.category });
    return res.status(200).json({ success: true, data: schemes });
  } catch (error) {
    return next(error);
  }
}

async function getGovernmentSchemesByState(req, res, next) {
  try {
    const schemes = await listGovernmentSchemes({ state: req.params.state });
    return res.status(200).json({ success: true, data: schemes });
  } catch (error) {
    return next(error);
  }
}

async function createGovernmentSchemeHandler(req, res, next) {
  try {
    const scheme = await createGovernmentScheme(req.body);
    return res.status(201).json({ success: true, message: 'Government scheme created successfully.', data: scheme });
  } catch (error) {
    return next(error);
  }
}

async function updateGovernmentSchemeHandler(req, res, next) {
  try {
    const scheme = await updateGovernmentScheme(req.params.id, req.body);
    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Government scheme not found.' });
    }

    return res.status(200).json({ success: true, message: 'Government scheme updated successfully.', data: scheme });
  } catch (error) {
    return next(error);
  }
}

async function deleteGovernmentSchemeHandler(req, res, next) {
  try {
    const scheme = await deleteGovernmentScheme(req.params.id);
    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Government scheme not found.' });
    }

    return res.status(200).json({ success: true, message: 'Government scheme deactivated successfully.', data: scheme });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getGovernmentSchemes,
  getGovernmentScheme,
  searchGovernmentSchemes,
  getGovernmentSchemesByCategory,
  getGovernmentSchemesByState,
  createGovernmentSchemeHandler,
  updateGovernmentSchemeHandler,
  deleteGovernmentSchemeHandler,
};
