const mongoose = require('mongoose');

const OdometerDamageDisclosureSchema = new mongoose.Schema(
  {
    leaseReturnId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LeaseReturns',
    },
    vehicleInfo: {
      vehicleYear: {
        type: String,
      },
      make: {
        type: String,
      },
      model: {
        type: String,
      },
      bodyType: {
        type: String,
      },
      vin: {
        type: String,
      },
    },

    odometerInfo: {
      odometerReading: {
        type: String,
      },
      odometerDigits: {
        type: String,
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
        enum: ['has_been', 'has_not_been'],
      },
    },
    seller: {
      signature: {
        type: String,
      },
      proofPhoto: {
        type: String,
      },
      name: {
        type: String,
      },
      address: {
        street: {
          type: String,
        },
        city: {
          type: String,
        },
        state: {
          type: String,
        },
        zipCode: {
          type: String,
        },
      },
      dateOfStatement: {
        type: Date,
      },
    },

    newOwner: {
      signature: {
        type: String,
      },
      name: {
        type: String,
      },
      address: {
        street: {
          type: String,
        },
        city: {
          type: String,
        },
        state: {
          type: String,
          uppercase: true,
        },
        zipCode: {
          type: String,
        },
      },
      dateOfStatement: {
        type: Date,
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
