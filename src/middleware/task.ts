import type { Request, Response, NextFunction } from "express";
import Task,{ TaskInterface } from "../models/Task";

declare global {
    namespace Express {
        interface Request {
            task: TaskInterface
        }
    }
}

export async function taskExist(req: Request, res: Response, next: NextFunction) {
    try {
        const {taskId} = req.params
        const task = await Task.findById(taskId)
        if (!task) {
            const error = new Error('Task not found.')
            return res.status(404).json({error: error.message})
        }
        req.task = task
        next()
    } catch (error) {
        res.status(500).json({error: 'Internal Server Error'})
    }
}

export function taskBelongToProject(req: Request, res: Response, next: NextFunction) {
    if (req.task.project.toString() !== req.project.id.toString()) {
        const error = new Error('Invalid action!')
        return res.status(400).json({ error: error.message })
    }
    next()
}

export function hasAuthorization(req: Request, res: Response, next: NextFunction) {
    if (req.user.id.toString() !== req.project.manager.toString()) {
        const error = new Error('Forbiden action!')
        return res.status(401).json({ error: error.message })
    }
    next()
}