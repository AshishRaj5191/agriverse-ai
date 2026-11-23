const mongoose = require('mongoose');
const ConsultationRequest = require('../models/ConsultationRequest');
const ConsultationMessage = require('../models/ConsultationMessage');
const ExpertProfile = require('../models/ExpertProfile');
const User = require('../models/User');
const FarmerProfile = require('../models/FarmerProfile');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const { uploadImage } = require('../services/imageService');

function ensureObjectId(value, label) {
  if (!mongoose.isValidObjectId(value)) throw new ApiError(400, `Invalid ${label}.`);
}

function clean(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

async function getConsultationForParticipant(id, userId) {
  ensureObjectId(id, 'consultation ID');
  const consultation = await ConsultationRequest.findById(id)
    .populate('farmer', 'name email')
    .populate('expert', 'name email')
    .populate('expertProfile', 'name specialization qualification verificationStatus')
    .lean();
  if (!consultation) throw new ApiError(404, 'Consultation request not found.');
  if (consultation.farmer._id.toString() !== userId && consultation.expert._id.toString() !== userId) {
    throw new ApiError(403, 'You do not have access to this consultation.');
  }
  return consultation;
}

async function createConsultation(req, res, next) {
  try {
    const { expertId, state, district, cropName, cropStage, problemTitle, problemDescription, symptoms, affectedArea, preferredContactTime, additionalInformation } = req.body;
    ensureObjectId(expertId, 'expert ID');
    const required = { state, district, cropName, problemTitle, problemDescription };
    const missing = Object.entries(required).find(([, value]) => !clean(value, 4000));
    if (missing) throw new ApiError(400, `${missing[0]} is required.`);

    const expertProfile = await ExpertProfile.findById(expertId).lean();
    if (!expertProfile || expertProfile.verificationStatus !== 'verified') {
      throw new ApiError(403, 'Consultations are available only with verified experts.');
    }
    const farmer = await User.findById(req.user.userId).lean();
    if (!farmer) throw new ApiError(404, 'Farmer account not found.');
    const farmerProfile = await FarmerProfile.findOne({ user: farmer._id }).lean();
    const images = [];
    for (const file of req.files || []) {
      images.push(await uploadImage(file.buffer, file.originalname, 'consultations'));
    }

    const consultation = await ConsultationRequest.create({
      farmer: farmer._id,
      expert: expertProfile.user,
      expertProfile: expertProfile._id,
      farmerName: farmer.name,
      farmerEmail: farmer.email,
      farmerPhone: farmerProfile?.phone || '',
      state: clean(state, 120),
      district: clean(district, 120),
      cropName: clean(cropName, 100),
      cropStage: clean(cropStage, 120),
      problemTitle: clean(problemTitle, 160),
      problemDescription: clean(problemDescription, 4000),
      symptoms: clean(symptoms, 2000),
      affectedArea: clean(affectedArea, 100),
      preferredContactTime: clean(preferredContactTime, 120),
      additionalInformation: clean(additionalInformation, 2000),
      images,
    });
    await Notification.create({
      recipient: expertProfile.user,
      type: 'consultation_request',
      message: `New consultation request from ${farmer.name}.`,
      consultation: consultation._id,
    });
    return res.status(201).json({ success: true, message: 'Consultation request sent successfully to the expert.', data: consultation });
  } catch (error) { return next(error); }
}

async function listFarmerConsultations(req, res, next) {
  try {
    const data = await ConsultationRequest.find({ farmer: req.user.userId }).populate('expert', 'name email').populate('expertProfile', 'name specialization').sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data });
  } catch (error) { return next(error); }
}

async function listExpertConsultations(req, res, next) {
  try {
    const data = await ConsultationRequest.find({ expert: req.user.userId }).populate('farmer', 'name email').populate('expertProfile', 'name specialization').sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data });
  } catch (error) { return next(error); }
}

async function getConsultation(req, res, next) {
  try { return res.json({ success: true, data: await getConsultationForParticipant(req.params.id, req.user.userId) }); }
  catch (error) { return next(error); }
}

async function respondToConsultation(req, res, next) {
  try {
    const consultation = await getConsultationForParticipant(req.params.id, req.user.userId);
    if (consultation.expert._id.toString() !== req.user.userId) throw new ApiError(403, 'Only the assigned expert can respond.');
    const status = clean(req.body.status, 20);
    const response = {
      diagnosis: clean(req.body.diagnosis, 2000),
      recommendation: clean(req.body.recommendation, 4000),
      visitRequired: req.body.visitRequired === true || req.body.visitRequired === 'true',
      visitDate: req.body.visitDate ? new Date(req.body.visitDate) : null,
      message: clean(req.body.message || req.body.response, 4000),
      respondedAt: new Date(),
    };
    if (!['accepted', 'declined', 'responded', 'closed', 'completed'].includes(status)) throw new ApiError(400, 'Invalid consultation status.');
    if (!response.diagnosis && !response.recommendation && !response.message) throw new ApiError(400, 'Expert response is required.');
    const updated = await ConsultationRequest.findByIdAndUpdate(req.params.id, { status, expertResponse: response, expertResponseAt: new Date() }, { new: true }).lean();
    await Notification.create({
      recipient: consultation.farmer._id,
      type: status === 'accepted' ? 'consultation_accepted' : 'consultation_response',
      message: status === 'accepted' ? 'Your consultation request has been accepted.' : 'Your agricultural expert has responded to your consultation request.',
      consultation: updated._id,
    });
    return res.json({ success: true, message: 'Consultation response saved.', data: updated });
  } catch (error) { return next(error); }
}

async function changeConsultationStatus(req, res, next) {
  try {
    const consultation = await getConsultationForParticipant(req.params.id, req.user.userId);
    const isCloseRequest = req.path.endsWith('/close');
    if (isCloseRequest) {
      if (consultation.farmer._id.toString() !== req.user.userId) throw new ApiError(403, 'Only the farmer who created this request can close it.');
    } else if (consultation.expert._id.toString() !== req.user.userId) {
      throw new ApiError(403, 'Only the assigned expert can accept or decline this request.');
    }
    const status = req.path.endsWith('/accept') ? 'accepted' : req.path.endsWith('/decline') ? 'declined' : 'closed';
    const updated = await ConsultationRequest.findByIdAndUpdate(req.params.id, { status }, { new: true }).lean();
    await Notification.create({ recipient: consultation.farmer._id, type: `consultation_${status}`, message: `Your consultation request has been ${status}.`, consultation: updated._id });
    return res.json({ success: true, data: updated });
  } catch (error) { return next(error); }
}

async function listMessages(req, res, next) {
  try {
    await getConsultationForParticipant(req.params.id, req.user.userId);
    const messages = await ConsultationMessage.find({ consultation: req.params.id }).populate('sender', 'name role').sort({ createdAt: 1 }).lean();
    return res.json({ success: true, data: messages });
  } catch (error) { return next(error); }
}

async function sendMessage(req, res, next) {
  try {
    const consultation = await getConsultationForParticipant(req.params.id, req.user.userId);
    const message = clean(req.body.message, 4000);
    if (!message && !(req.files || []).length) throw new ApiError(400, 'Message or image is required.');
    if (consultation.status === 'pending') throw new ApiError(400, 'Messaging is available after the expert accepts the consultation.');
    if (['declined', 'rejected', 'closed', 'completed'].includes(consultation.status)) throw new ApiError(400, 'This consultation is closed.');
    const receiver = consultation.farmer._id.toString() === req.user.userId ? consultation.expert._id : consultation.farmer._id;
    const attachments = [];
    for (const file of req.files || []) {
      attachments.push(await uploadImage(file.buffer, file.originalname, 'consultation-messages'));
    }
    const created = await ConsultationMessage.create({
      consultation: req.params.id,
      sender: req.user.userId,
      receiver,
      message: message || 'Shared an image.',
      attachments,
    });
    await Notification.create({
      recipient: receiver,
      type: 'consultation_message',
      message: `New message for your consultation: ${consultation.problemTitle}.`,
      consultation: consultation._id,
    });
    return res.status(201).json({ success: true, data: await ConsultationMessage.findById(created._id).populate('sender', 'name role').lean() });
  } catch (error) { return next(error); }
}

module.exports = { createConsultation, listFarmerConsultations, listExpertConsultations, getConsultation, respondToConsultation, changeConsultationStatus, listMessages, sendMessage };
