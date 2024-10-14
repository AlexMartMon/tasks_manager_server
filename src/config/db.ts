import mongoose from "mongoose";
import colors from 'colors'
import { exit } from 'node:process';

export const connectDB = async () => {
    try {
       const {connection} = await mongoose.connect(process.env.DATABASE_URL) 
       const url = `${connection.host}:${connection.port}`
    } catch (error) {
        console.log(colors.bgRed('Error connecting to MongoDB'))
        exit(1)
    }
}