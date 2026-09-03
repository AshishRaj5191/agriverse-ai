const { validationResult } = require('express-validator');
const FarmRecord = require('../models/FarmRecord');
const { uploadImage, deleteImage } = require('../services/imageService');
const ApiError = require('../utils/ApiError');

async function createFarmRecord(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, errors.array()[0].msg);
    }

    const {
      crop,
      cropVariety,
      sowingDate,
      expectedHarvestDate,
      soilInfo,
      notes,
      farmProfileId,
    } = req.body;

    const farmerId = req.user.userId;

    const farmRecord = await FarmRecord.create({
      farmerId,
      farmProfileId,
      crop,
      cropVariety,
      sowingDate: new Date(sowingDate),
      expectedHarvestDate: expectedHarvestDate ? new Date(expectedHarvestDate) : null,
      soilInfo,
      notes,
    });

    res.status(201).json({
      success: true,
      message: 'Farm record created successfully.',
      data: farmRecord,
    });
  } catch (error) {
    next(error);
  }
}

async function getFarmRecords(req, res, next) {
  try {
    const farmerId = req.user.userId;
    const { skip = 0, limit = 10 } = req.query;

    const records = await FarmRecord.find({ farmerId })
      .sort({ recordDate: -1 })
      .skip(Number(skip))
      .limit(Number(limit))
      .lean();

    const total = await FarmRecord.countDocuments({ farmerId });

    res.status(200).json({
      success: true,
      message: 'Farm records retrieved successfully.',
      data: {
        records,
        pagination: {
          total,
          skip: Number(skip),
          limit: Number(limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getFarmRecordById(req, res, next) {
  try {
    const { id } = req.params;
    const farmerId = req.user.userId;

    const record = await FarmRecord.findById(id);

    if (!record) {
      throw new ApiError(404, 'Farm record not found.');
    }

    if (record.farmerId.toString() !== farmerId) {
      throw new ApiError(403, 'You do not have access to this farm record.');
    }

    res.status(200).json({
      success: true,
      message: 'Farm record retrieved successfully.',
      data: record,
    });
  } catch (error) {
    next(error);
  }
}

async function updateFarmRecord(req, res, next) {
  try {
    const { id } = req.params;
    const farmerId = req.user.userId;
    const {
      crop,
      cropVariety,
      sowingDate,
      expectedHarvestDate,
      harvestDate,
      soilInfo,
      notes,
    } = req.body;

    const record = await FarmRecord.findById(id);

    if (!record) {
      throw new ApiError(404, 'Farm record not found.');
    }

    if (record.farmerId.toString() !== farmerId) {
      throw new ApiError(403, 'You do not have access to this farm record.');
    }

    if (crop) record.crop = crop;
    if (cropVariety !== undefined) record.cropVariety = cropVariety;
    if (sowingDate) record.sowingDate = new Date(sowingDate);
    if (expectedHarvestDate) record.expectedHarvestDate = new Date(expectedHarvestDate);
    if (harvestDate) record.harvestDate = new Date(harvestDate);
    if (soilInfo !== undefined) record.soilInfo = soilInfo;
    if (notes !== undefined) record.notes = notes;

    await record.save();

    res.status(200).json({
      success: true,
      message: 'Farm record updated successfully.',
      data: record,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteFarmRecord(req, res, next) {
  try {
    const { id } = req.params;
    const farmerId = req.user.userId;

    const record = await FarmRecord.findById(id);

    if (!record) {
      throw new ApiError(404, 'Farm record not found.');
    }

    if (record.farmerId.toString() !== farmerId) {
      throw new ApiError(403, 'You do not have access to this farm record.');
    }

    if (record.images && record.images.length > 0) {
      for (const image of record.images) {
        await deleteImage(image.publicId);
      }
    }

    await FarmRecord.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Farm record deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}

async function uploadFarmImage(req, res, next) {
  try {
    const { id } = req.params;
    const farmerId = req.user.userId;

    if (!req.file) {
      throw new ApiError(400, 'No image file provided.');
    }

    const record = await FarmRecord.findById(id);

    if (!record) {
      throw new ApiError(404, 'Farm record not found.');
    }

    if (record.farmerId.toString() !== farmerId) {
      throw new ApiError(403, 'You do not have access to this farm record.');
    }

    const uploadResult = await uploadImage(req.file.buffer, req.file.originalname);

    record.images.push({
      url: uploadResult.url,
      publicId: uploadResult.publicId,
    });

    await record.save();

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully.',
      data: {
        imageUrl: uploadResult.url,
        images: record.images,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function deleteRecordImage(req, res, next) {
  try {
    const { id } = req.params;
    const rawImagePublicId = req.params.imagePublicId || '';
    const imagePublicId = decodeURIComponent(rawImagePublicId);
    const farmerId = req.user.userId;

    const record = await FarmRecord.findById(id);

    if (!record) {
      throw new ApiError(404, 'Farm record not found.');
    }

    if (record.farmerId.toString() !== farmerId) {
      throw new ApiError(403, 'You do not have access to this farm record.');
    }

    const imageIndex = record.images.findIndex(
      (img) =>
        img.publicId === imagePublicId ||
        decodeURIComponent(img.publicId) === imagePublicId ||
        img.publicId === rawImagePublicId
    );

    if (imageIndex === -1) {
      throw new ApiError(404, 'Image not found in this record.');
    }

    await deleteImage(imagePublicId);

    record.images.splice(imageIndex, 1);
    await record.save();

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully.',
      data: {
        images: record.images,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function addFertilizerEntry(req, res, next) {
  try {
    const { id } = req.params;
    const { name, quantity, dateApplied } = req.body;
    const farmerId = req.user.userId;

    if (!name || !quantity || !dateApplied) {
      throw new ApiError(400, 'Fertilizer name, quantity, and date are required.');
    }

    const record = await FarmRecord.findById(id);

    if (!record) {
      throw new ApiError(404, 'Farm record not found.');
    }

    if (record.farmerId.toString() !== farmerId) {
      throw new ApiError(403, 'You do not have access to this farm record.');
    }

    record.fertilizersUsed.push({
      name,
      quantity,
      dateApplied: new Date(dateApplied),
    });

    await record.save();

    res.status(200).json({
      success: true,
      message: 'Fertilizer entry added successfully.',
      data: record,
    });
  } catch (error) {
    next(error);
  }
}

async function addActivityEntry(req, res, next) {
  try {
    const { id } = req.params;
    const { activity, date, notes } = req.body;
    const farmerId = req.user.userId;

    if (!activity || !date) {
      throw new ApiError(400, 'Activity and date are required.');
    }

    const record = await FarmRecord.findById(id);

    if (!record) {
      throw new ApiError(404, 'Farm record not found.');
    }

    if (record.farmerId.toString() !== farmerId) {
      throw new ApiError(403, 'You do not have access to this farm record.');
    }

    record.farmingActivities.push({
      activity,
      date: new Date(date),
      notes: notes || '',
    });

    await record.save();

    res.status(200).json({
      success: true,
      message: 'Activity entry added successfully.',
      data: record,
    });
  } catch (error) {
    next(error);
  }
}

async function addDiseaseEntry(req, res, next) {
  try {
    const { id } = req.params;
    const { disease, dateObserved, treatment, status } = req.body;
    const farmerId = req.user.userId;

    if (!disease || !dateObserved) {
      throw new ApiError(400, 'Disease name and observation date are required.');
    }

    const record = await FarmRecord.findById(id);

    if (!record) {
      throw new ApiError(404, 'Farm record not found.');
    }

    if (record.farmerId.toString() !== farmerId) {
      throw new ApiError(403, 'You do not have access to this farm record.');
    }

    record.diseaseHistory.push({
      disease,
      dateObserved: new Date(dateObserved),
      treatment: treatment || '',
      status: status || 'suspected',
    });

    await record.save();

    res.status(200).json({
      success: true,
      message: 'Disease entry added successfully.',
      data: record,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createFarmRecord,
  getFarmRecords,
  getFarmRecordById,
  updateFarmRecord,
  deleteFarmRecord,
  uploadFarmImage,
  deleteRecordImage,
  addFertilizerEntry,
  addActivityEntry,
  addDiseaseEntry,
};
