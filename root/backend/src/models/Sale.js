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

// Compound indexes for common query patterns
SaleSchema.index({ customerName: 'text', phoneNumber: 'text' })
SaleSchema.index({ customerRegion: 1, date: -1 })
SaleSchema.index({ productCategory: 1, date: -1 })
SaleSchema.index({ paymentMethod: 1, date: -1 })
SaleSchema.index({ gender: 1, age: 1 })
SaleSchema.index({ tags: 1, date: -1 })
SaleSchema.index({ date: -1, totalAmount: -1 })

export const Sale = mongoose.model('Sale', SaleSchema)
