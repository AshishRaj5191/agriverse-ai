const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const GovernmentScheme = require('../models/GovernmentScheme');

const DATA_FILE = path.join(__dirname, '..', 'data', 'governmentSchemes.json');

function ensureDataFile() {
  const directory = path.dirname(DATA_FILE);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]', 'utf8');
  }
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function matchesSearchText(values, searchTerm) {
  const normalizedTerm = String(searchTerm || '').trim().toLowerCase();
  if (!normalizedTerm) return true;
  const text = values.filter(Boolean).join(' ').toLowerCase();
  if (normalizedTerm.length > 2) return text.includes(normalizedTerm);
  return text.split(/[^a-z0-9]+/).some((token) => token.startsWith(normalizedTerm));
}

function mapSchemeRecord(record) {
  if (!record) {
    return record;
  }

  const id = record._id ? String(record._id) : record.id || `scheme_${slugify(record.title || 'scheme')}`;

  return {
    ...record,
    id,
    slug: record.slug || slugify(record.title),
    officialStatusUrl: record.officialStatusUrl || record.statusUrl || '',
    officialApplicationUrl: record.officialApplicationUrl || record.applicationUrl || '',
    statusUrl: record.officialStatusUrl || record.statusUrl || '',
    applicationUrl: record.officialApplicationUrl || record.applicationUrl || '',
    isActive: record.isActive !== false,
    lastVerifiedAt: record.lastVerifiedAt || new Date().toISOString(),
  };
}

function readSchemeStore() {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function writeSchemeStore(items) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), 'utf8');
  return items;
}

async function listGovernmentSchemes(filters = {}) {
  const query = { ...filters };

  if (mongoose.connection.readyState === 1) {
    const dbQuery = {};

    if (query.governmentLevel) {
      dbQuery.governmentLevel = query.governmentLevel;
    }

    if (query.category) {
      dbQuery.category = query.category;
    }

    if (query.state) {
      dbQuery.$and = [
        ...(dbQuery.$and || []),
        { $or: [{ state: query.state }, { state: 'All India' }] },
      ];
    }

    if (query.search) {
        const searchTerm = query.search.trim();
      if (searchTerm) {
        const searchPattern = searchTerm.length <= 2 ? `\\b${searchTerm}` : searchTerm;
        dbQuery.$or = [
          { title: { $regex: searchPattern, $options: 'i' } },
          { slug: { $regex: searchPattern, $options: 'i' } },
          { description: { $regex: searchPattern, $options: 'i' } },
          { category: { $regex: searchPattern, $options: 'i' } },
          { governmentLevel: { $regex: searchPattern, $options: 'i' } },
          { state: { $regex: searchPattern, $options: 'i' } },
          { targetFarmers: { $regex: searchPattern, $options: 'i' } },
          { benefits: { $regex: searchPattern, $options: 'i' } },
          { eligibility: { $regex: searchPattern, $options: 'i' } },
          { documents: { $regex: searchPattern, $options: 'i' } },
          { applicationSteps: { $regex: searchPattern, $options: 'i' } },
        ];
      }
    }

    if (query.onlyActive !== false) {
      dbQuery.isActive = true;
    }

    const documents = await GovernmentScheme.find(dbQuery).sort({ lastVerifiedAt: -1, createdAt: -1 }).lean();
    return documents.map((item) => mapSchemeRecord({ ...item, id: String(item._id) }));
  }

  let items = readSchemeStore().map((item) => ({ ...item, isActive: item.isActive !== false }));

  if (query.governmentLevel) {
    items = items.filter((item) => item.governmentLevel === query.governmentLevel);
  }

  if (query.category) {
    items = items.filter((item) => item.category === query.category);
  }

  if (query.state) {
    items = items.filter((item) => item.state === query.state || item.state === 'All India');
  }

  if (query.search) {
    const searchTerm = query.search.trim().toLowerCase();
    items = items.filter((item) => {
      const searchable = [
        item.id,
        item.title,
        item.description,
        item.category,
        item.governmentLevel,
        item.state,
        item.targetFarmers,
        item.id,
        ...(item.benefits || []),
        ...(item.eligibility || []),
      ];
      return matchesSearchText(searchable, searchTerm);
    });
  }

  if (query.onlyActive !== false) {
    items = items.filter((item) => item.isActive !== false);
  }

  return items
    .sort((a, b) => new Date(b.lastVerifiedAt || 0) - new Date(a.lastVerifiedAt || 0))
    .map(mapSchemeRecord);
}

async function getGovernmentSchemeById(id) {
  if (!id) {
    return null;
  }

  if (mongoose.connection.readyState === 1) {
    const existing = await GovernmentScheme.findOne({
      $or: [{ _id: id }, { slug: id }],
      ...(mongoose.connection.readyState === 1 ? {} : {}),
    }).lean();

    if (!existing) {
      return null;
    }

    return mapSchemeRecord({ ...existing, id: String(existing._id) });
  }

  const items = readSchemeStore();
  const match = items.find((item) => item.id === id || item.slug === id || item.title === id);
  return match ? mapSchemeRecord({ ...match, isActive: match.isActive !== false }) : null;
}

async function createGovernmentScheme(payload) {
  const data = { ...payload };
  const title = String(data.title || '').trim();

  if (!title) {
    throw new Error('Title is required.');
  }

  const normalized = {
    id: data.id || `scheme_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title,
    slug: data.slug || slugify(title),
    description: String(data.description || '').trim() || 'No description available.',
    governmentLevel: data.governmentLevel || 'Central Government',
    state: data.state || 'All India',
    districts: Array.isArray(data.districts) ? data.districts.map((item) => String(item).trim()).filter(Boolean) : [],
    category: data.category || 'Other',
    targetFarmers: data.targetFarmers || 'Farmers and agricultural households',
    benefits: Array.isArray(data.benefits) ? data.benefits.map((item) => String(item).trim()).filter(Boolean) : [],
    eligibility: Array.isArray(data.eligibility) ? data.eligibility.map((item) => String(item).trim()).filter(Boolean) : [],
    documents: Array.isArray(data.documents) ? data.documents.map((item) => String(item).trim()).filter(Boolean) : [],
    applicationSteps: Array.isArray(data.applicationSteps) ? data.applicationSteps.map((item) => String(item).trim()).filter(Boolean) : [],
    officialWebsite: data.officialWebsite || '',
    officialStatusUrl: data.officialStatusUrl || data.statusUrl || '',
    officialApplicationUrl: data.officialApplicationUrl || data.applicationUrl || data.officialWebsite || '',
    lastVerifiedAt: data.lastVerifiedAt || new Date().toISOString(),
    sourceName: data.sourceName || 'Official Government Portal',
    sourceUrl: data.sourceUrl || data.officialWebsite || '',
    isActive: data.isActive !== false,
  };

  normalized.statusUrl = normalized.officialStatusUrl;
  normalized.applicationUrl = normalized.officialApplicationUrl;

  if (mongoose.connection.readyState === 1) {
    const existing = await GovernmentScheme.findOne({ slug: normalized.slug });
    if (existing) {
      throw new Error('A scheme with this slug already exists.');
    }

    const created = await GovernmentScheme.create(normalized);
    return mapSchemeRecord({ ...created.toObject(), id: String(created._id) });
  }

  const items = readSchemeStore();
  items.unshift(normalized);
  writeSchemeStore(items);
  return mapSchemeRecord(normalized);
}

async function updateGovernmentScheme(id, payload) {
  if (mongoose.connection.readyState === 1) {
    const existing = await GovernmentScheme.findOne({ $or: [{ _id: id }, { slug: id }] });
    if (!existing) {
      return null;
    }

    const updates = { ...payload };
    if (updates.title && !updates.slug) {
      updates.slug = slugify(updates.title);
    }

    if (updates.lastVerifiedAt) {
      updates.lastVerifiedAt = new Date(updates.lastVerifiedAt);
    }

    Object.assign(existing, updates);
    await existing.save();
    return mapSchemeRecord({ ...existing.toObject(), id: String(existing._id) });
  }

  const items = readSchemeStore();
  const index = items.findIndex((item) => item.id === id || item.slug === id || item.title === id);
  if (index === -1) {
    return null;
  }

  const updated = {
    ...items[index],
    ...payload,
    officialStatusUrl: payload.officialStatusUrl || payload.statusUrl || items[index].officialStatusUrl || items[index].statusUrl || '',
    officialApplicationUrl: payload.officialApplicationUrl || payload.applicationUrl || items[index].officialApplicationUrl || items[index].applicationUrl || '',
    slug: payload.slug || payload.title ? slugify(payload.title || items[index].title) : items[index].slug,
    lastVerifiedAt: payload.lastVerifiedAt || items[index].lastVerifiedAt,
    isActive: payload.isActive !== undefined ? payload.isActive : items[index].isActive,
  };

  items[index] = updated;
  writeSchemeStore(items);
  return mapSchemeRecord(updated);
}

async function deleteGovernmentScheme(id) {
  if (mongoose.connection.readyState === 1) {
    const existing = await GovernmentScheme.findOne({ $or: [{ _id: id }, { slug: id }] });
    if (!existing) {
      return null;
    }

    existing.isActive = false;
    await existing.save();
    return mapSchemeRecord({ ...existing.toObject(), id: String(existing._id) });
  }

  const items = readSchemeStore();
  const index = items.findIndex((item) => item.id === id || item.slug === id || item.title === id);
  if (index === -1) {
    return null;
  }

  items[index].isActive = false;
  writeSchemeStore(items);
  return mapSchemeRecord(items[index]);
}

module.exports = {
  listGovernmentSchemes,
  getGovernmentSchemeById,
  createGovernmentScheme,
  updateGovernmentScheme,
  deleteGovernmentScheme,
  slugify,
  mapSchemeRecord,
};
