const mongoose = require('mongoose');

const OdometerDamageDisclosureSchema = new mongoose.Schema(
  {
    leaseReturnId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LeaseReturns',
      required: true,
    },
    vehicleInfo: {
      vehicleYear: {
        type: String,
        required: true,
        trim: true,
      },
      make: {
        type: String,
        required: true,
        trim: true,
      },
      model: {
        type: String,
        required: true,
        trim: true,
      },
      bodyType: {
        type: String,
        required: true,
        trim: true,
      },
      vin: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
      },
    },

    odometerInfo: {
      odometerReading: {
        type: String,
        required: true,
      },
      odometerDigits: {
        type: String,
        required: true,
        enum: ['five', 'six'],
      },
      certification: {
        actualMileage: {
          type: Boolean,
          default: false,
        },
        exceedsMechanicalLimits: {
          type: Boolean,
          default: false,
        },
        odometerDiscrepancy: {
          type: Boolean,
          default: false,
        },
      },
    },

    damageDisclosure: {
      status: {
        type: String,
        required: true,
        enum: ['has_been', 'has_not_been'],
      },
    },

    seller: {
      signature: {
        type: String,
        required: true,
        trim: true,
      },
      name: {
        type: String,
        required: true,
        trim: true,
      },
      address: {
        street: {
          type: String,
          required: true,
          trim: true,
        },
        city: {
          type: String,
          required: true,
          trim: true,
        },
        state: {
          type: String,
          required: true,
          trim: true,
        },
        zipCode: {
          type: String,
          required: true,
          trim: true,
        },
      },
      dateOfStatement: {
        type: Date,
        required: true,
      },
    },

    newOwner: {
      signature: {
        type: String,
        required: true,
        trim: true,
      },
      name: {
        type: String,
        required: true,
        trim: true,
      },
      address: {
        street: {
          type: String,
          required: true,
          trim: true,
        },
        city: {
          type: String,
          required: true,
          trim: true,
        },
        state: {
          type: String,
          required: true,
          trim: true,
          uppercase: true,
        },
        zipCode: {
          type: String,
          required: true,
          trim: true,
        },
      },
      dateOfStatement: {
        type: Date,
        required: true,
      },
    },
  },
  {
    timestamps: true,
    collection: 'odometer_damage_disclosures',
  }
);

OdometerDamageDisclosureSchema.index({ 'seller.name': 1 });
OdometerDamageDisclosureSchema.index({ 'newOwner.name': 1 });

module.exports = mongoose.model(
  'OdometerDamageDisclosure',
  OdometerDamageDisclosureSchema
);
