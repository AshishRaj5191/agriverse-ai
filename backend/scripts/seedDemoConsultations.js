const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const env = require('../src/config/env');
const User = require('../src/models/User');
const FarmerProfile = require('../src/models/FarmerProfile');
const ExpertProfile = require('../src/models/ExpertProfile');
const ConsultationRequest = require('../src/models/ConsultationRequest');
const ConsultationMessage = require('../src/models/ConsultationMessage');
const Notification = require('../src/models/Notification');

async function upsertUser({ name, email, password, role }) {
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name,
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role,
    });
  } else {
    user.passwordHash = await bcrypt.hash(password, 12);
    user.name = name;
    user.role = role;
    await user.save();
  }
  return user;
}

async function main() {
  await mongoose.connect(env.mongodbUri, { serverSelectionTimeoutMS: 5000 });

  const demoPassword = 'Demo@12345';
  let farmer = await upsertUser({
    name: 'Ramesh Kumar',
    email: 'farmer@agriverse.local',
    password: demoPassword,
    role: 'farmer',
  });

  await FarmerProfile.findOneAndUpdate(
    { user: farmer._id },
    {
      user: farmer._id,
      name: farmer.name,
      email: farmer.email,
      phone: '9876543210',
      state: 'Uttar Pradesh',
      district: 'Lucknow',
      village: 'Bani',
      pincode: '226001',
      farmSize: '4.5 acres',
      soilType: 'Loamy',
      irrigationType: 'Drip irrigation',
      primaryCrops: 'Wheat, Potato, Tomato',
      preferredLanguage: 'Hindi',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const expertSeeds = [
    {
      name: 'Dr. Anita Sharma',
      email: 'expert1@agriverse.local',
      specialization: 'Crop Disease Specialist',
      qualification: 'PhD in Plant Pathology',
      experience: 12,
      state: 'Uttar Pradesh',
      district: 'Lucknow',
      serviceRadius: 150,
      phone: '9876501001',
      bio: 'Crop disease diagnosis, integrated pest management, and field treatment guidance.',
    },
    {
      name: 'Rajesh Verma',
      email: 'expert2@agriverse.local',
      specialization: 'Soil Specialist',
      qualification: 'MSc in Soil Science',
      experience: 9,
      state: 'Uttar Pradesh',
      district: 'Kanpur Nagar',
      serviceRadius: 120,
      phone: '9876501002',
      bio: 'Soil health, fertilizer planning, nutrient deficiency diagnosis, and soil testing.',
    },
  ];

  const experts = [];
  for (const seed of expertSeeds) {
    const user = await upsertUser({ name: seed.name, email: seed.email, password: demoPassword, role: 'expert' });
    const profile = await ExpertProfile.findOneAndUpdate(
      { user: user._id },
      {
        user: user._id,
        name: seed.name,
        email: seed.email,
        phone: seed.phone,
        specialization: seed.specialization,
        qualification: seed.qualification,
        experience: seed.experience,
        state: seed.state,
        district: seed.district,
        serviceRadius: seed.serviceRadius,
        bio: seed.bio,
        verificationStatus: 'verified',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    experts.push({ user, profile });
  }

  const consultationSeeds = [
    {
      expertIndex: 0,
      cropName: 'Tomato',
      cropStage: 'Flowering',
      problemTitle: 'Yellow spots appearing on tomato leaves',
      problemDescription: 'Yellow circular spots are increasing on the lower leaves. The affected leaves later develop brown edges. Please advise whether this is a fungal disease and what immediate care is needed.',
      symptoms: 'Yellow spots, brown leaf edges, gradual spreading from lower leaves',
      affectedArea: 'Small field near the western side',
      preferredContactTime: 'Evening between 5 PM and 7 PM',
      status: 'accepted',
      expertResponse: {
        diagnosis: 'The symptoms indicate a possible fungal leaf infection, but field inspection and image quality should confirm the exact disease.',
        recommendation: 'Remove severely infected leaves, avoid overhead irrigation, improve spacing, and consult a local extension office before chemical treatment.',
        visitRequired: false,
        visitDate: null,
        message: 'Please send two close-up photos and one full-plant photo in the chat.',
        respondedAt: new Date(),
      },
    },
    {
      expertIndex: 1,
      cropName: 'Wheat',
      cropStage: 'Tillering',
      problemTitle: 'Wheat growth is slower than last season',
      problemDescription: 'My wheat plants are thinner and shorter in one part of the field. The soil remains wet for several days after irrigation.',
      symptoms: 'Slow growth, pale leaves, uneven field growth',
      affectedArea: 'North field',
      preferredContactTime: 'Morning between 9 AM and 11 AM',
      status: 'responded',
      expertResponse: {
        diagnosis: 'Slow growth may be linked to poor drainage, nitrogen imbalance, or compacted soil.',
        recommendation: 'Check soil moisture before irrigation and complete a soil test before increasing fertilizer. Improve drainage in the wet section.',
        visitRequired: true,
        visitDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        message: 'A field visit is recommended after the next soil test.',
        respondedAt: new Date(),
      },
    },
    {
      expertIndex: 0,
      cropName: 'Potato',
      cropStage: 'Vegetative',
      problemTitle: 'Small black insects found under potato leaves',
      problemDescription: 'Small black insects are visible under the potato leaves and some leaves are curling at the edges.',
      symptoms: 'Curled leaves, black insects under leaves, sticky residue',
      affectedArea: 'Entire small plot',
      preferredContactTime: 'After 4 PM',
      status: 'pending',
    },
  ];

  for (const seed of consultationSeeds) {
    const expert = experts[seed.expertIndex];
    let consultation = await ConsultationRequest.findOne({
      farmer: farmer._id,
      expert: expert.user._id,
      problemTitle: seed.problemTitle,
    });

    if (!consultation) {
      consultation = await ConsultationRequest.create({
        farmer: farmer._id,
        expert: expert.user._id,
        expertProfile: expert.profile._id,
        farmerName: farmer.name,
        farmerEmail: farmer.email,
        farmerPhone: '9876543210',
        state: 'Uttar Pradesh',
        district: 'Lucknow',
        cropName: seed.cropName,
        cropStage: seed.cropStage,
        problemTitle: seed.problemTitle,
        problemDescription: seed.problemDescription,
        symptoms: seed.symptoms,
        affectedArea: seed.affectedArea,
        preferredContactTime: seed.preferredContactTime,
        additionalInformation: 'Please provide practical advice suitable for a small farm.',
        status: seed.status,
        expertResponse: seed.expertResponse || {},
        expertResponseAt: seed.expertResponse?.respondedAt || null,
      });

      const notificationType = seed.status === 'pending'
        ? 'consultation_request'
        : 'consultation_response';
      await Notification.create({
        recipient: farmer._id,
        type: notificationType,
        message: seed.status === 'pending'
          ? `Your consultation request for ${seed.cropName} has been sent to ${expert.profile.name}.`
          : `${expert.profile.name} responded to your ${seed.cropName} consultation.`,
        consultation: consultation._id,
      });

      if (seed.expertResponse) {
        await ConsultationMessage.create({
          consultation: consultation._id,
          sender: expert.user._id,
          receiver: farmer._id,
          message: seed.expertResponse.message || seed.expertResponse.recommendation,
        });
      }
    }
  }

  await Notification.updateMany(
    { recipient: farmer._id, consultation: { $ne: null } },
    { $set: { readAt: null } }
  );

  console.log('Demo consultations seeded successfully.');
  console.log(`Farmer login: farmer@agriverse.local / ${demoPassword}`);
  console.log(`Expert login: expert1@agriverse.local / ${demoPassword}`);
  console.log(`Expert login: expert2@agriverse.local / ${demoPassword}`);
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error('Demo seed failed:', error);
  await mongoose.disconnect();
  process.exit(1);
});
