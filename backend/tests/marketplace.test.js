const test = require('node:test');
const assert = require('node:assert/strict');
const Product = require('../src/models/Product');
const MarketplaceConversation = require('../src/models/MarketplaceConversation');
const MarketplaceMessage = require('../src/models/MarketplaceMessage');

const validProduct = {
  seller: '507f1f77bcf86cd799439011',
  name: 'Organic wheat',
  category: 'grains',
  description: 'Freshly harvested organic wheat from our farm.',
  price: 42,
  quantity: 100,
  unit: 'kg',
  location: {
    state: 'Maharashtra',
    district: 'Nashik',
    tehsil: 'Nashik',
    village: 'Nashik',
    pincode: '422001',
  },
};

test('marketplace product accepts a valid listing and defaults to available', () => {
  const product = new Product(validProduct);
  const error = product.validateSync();
  assert.equal(error, undefined);
  assert.equal(product.status, 'available');
});

test('marketplace animal listing stores weight, full address, and contact number', () => {
  const product = new Product({
    ...validProduct,
    category: 'livestock',
    name: 'Cow',
    unit: 'animal',
    contactPhone: '9876543210',
    location: {
      state: 'Maharashtra',
      district: 'Nashik',
      address: 'Main Road, Village Nashik',
      pincode: '422001',
    },
    animalDetails: {
      animalType: 'Cow',
      weightKg: 320,
    },
  });
  const error = product.validateSync();
  assert.equal(error, undefined);
  assert.equal(product.animalDetails.weightKg, 320);
  assert.equal(product.location.address, 'Main Road, Village Nashik');
  assert.equal(product.contactPhone, '9876543210');
});

test('marketplace product rejects missing fields and non-positive values', () => {
  const product = new Product({ ...validProduct, name: '', price: 0, quantity: -1 });
  const error = product.validateSync();
  assert.ok(error);
  assert.ok(error.errors.name);
  assert.ok(error.errors.price);
  assert.ok(error.errors.quantity);
});

test('marketplace product rejects unsupported categories', () => {
  const product = new Product({ ...validProduct, category: 'unknown_category' });
  const error = product.validateSync();
  assert.ok(error?.errors?.category);
});

test('marketplace conversation requires a listing and both participants', () => {
  const conversation = new MarketplaceConversation();
  const error = conversation.validateSync();
  assert.ok(error?.errors?.listing);
  assert.ok(error?.errors?.buyer);
  assert.ok(error?.errors?.seller);
});

test('marketplace message rejects empty text and accepts a conversation reference', () => {
  const message = new MarketplaceMessage({
    conversation: '507f1f77bcf86cd799439011',
    sender: '507f1f77bcf86cd799439012',
    message: '',
  });
  const error = message.validateSync();
  assert.ok(error?.errors?.message);
});
