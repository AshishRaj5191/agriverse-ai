const { indianLocations, stateNames } = require('../constants/indianLocations');

function listIndianLocations(req, res) {
  return res.status(200).json({
    success: true,
    data: {
      states: stateNames,
      districtsByState: indianLocations,
    },
  });
}

module.exports = { listIndianLocations };
