import { Request, Response, NextFunction } from "express"
import jwt from 'jsonwebtoken';
import Auth, { AuthInterface } from "../models/Auth";

declare global {
    namespace Express {
        interface Request {
            user?: AuthInterface
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const bearer = req.headers.authorization
    if (!bearer) {
        const error = new Error('Unauthorized.')
        return res.status(401).json({error: error.message})
    }
    const [,token] = bearer.split(' ')
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if (typeof decoded === 'object' && decoded.id) {
            const user = await Auth.findById(decoded.id).select('_id name email')
            if (user) {
                req.user = user
                next()
            } else {
                return res.status(500).json({error: 'Invalid user'})
            }
        }
    } catch (error) {
        return res.status(500).json({error: 'Invalid token'})
    }
}