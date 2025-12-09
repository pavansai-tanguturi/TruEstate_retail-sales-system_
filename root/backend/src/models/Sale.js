import mongoose from 'mongoose'

const SaleSchema = new mongoose.Schema(
  {
    transactionId: String,
    date: { type: Date, index: true },
    customerId: String,
    customerName: { type: String, index: true },
    phoneNumber: { type: String, index: true },
    gender: String,
    age: Number,
    customerRegion: String,
    customerType: String,
    productId: String,
    productName: String,
    brand: String,
    productCategory: String,
    tags: [String],
    quantity: Number,
    pricePerUnit: Number,
    discountPercentage: Number,
    totalAmount: Number,
    finalAmount: Number,
    paymentMethod: String,
    orderStatus: String,
    deliveryType: String,
    storeId: String,
    storeLocation: String,
    salespersonId: String,
    employeeName: String,
  },
  { timestamps: false, versionKey: false },
)

SaleSchema.index({ customerName: 'text', phoneNumber: 'text' })

export const Sale = mongoose.model('Sale', SaleSchema)
