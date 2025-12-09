import mongoose from 'mongoose'

const defaultOptions = {
  maxPoolSize: 10,
}

export const connectDb = async (uri) => {
  if (!uri) throw new Error('MONGO_URI is required')
  await mongoose.connect(uri, defaultOptions)
  return mongoose.connection
}
