import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { connectDB } from './config/db'
import projectRoutes from './routes/projectRoutes'
import authRoutes from './routes/authRoutes'
import { corsConfig } from './config/cors'

dotenv.config()

connectDB()

const app = express()
app.use(cors(corsConfig))
app.use(express.json())

//Routes
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)


export default app