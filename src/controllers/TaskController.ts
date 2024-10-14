import type { Request, Response } from 'express'
import Task from '../models/Task'

export class TaskController {

    static postCreateTask = async (req: Request, res: Response) => {
        try {
            const task = new Task(req.body)
            task.project = req.project.id
            req.project.tasks.push(task.id)
            await Promise.allSettled([task.save(), req.project.save()])
            res.status(201).send('Task created succesfully')
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' })
        }
    }

    static getProjectTasks = async (req: Request, res: Response) => {
        try {
            const tasks = await Task.find({ project: req.project.id }).populate('project')
            res.status(200).json(tasks)
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' })
        }
    }

    static getTaskById = async (req: Request, res: Response) => {
        try { 
            const task = await Task.findById(req.task.id).populate({
                path: 'completedBy.user', select: 'id name email'
            }).populate({
                path: 'notes', populate: {path: 'createdBy', select: 'id name email'}
            })
            res.status(200).json(task)
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' })
        }
    }

    static putUpdateTask = async (req: Request, res: Response) => {
        try {
            req.task.name = req.body.name
            req.task.description = req.body.description
            await req.task.save()
            res.status(200).send('Task updated succesfully!')
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' })
        }
    }

    static deleteTaskById = async (req: Request, res: Response) => {
        try {
            req.project.tasks = req.project.tasks.filter(item => item.toString() !== req.task.id.toString())
            await Promise.allSettled([req.task.deleteOne(), req.project.save()])
            res.status(200).send('Task deleted succesfully!')
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' })
        }
    }

    static postUpdateStatus = async (req: Request, res: Response) => {
        try {
            const { status } = req.body
            req.task.status = status
            const data = {
                user: req.user.id,
                status
            }
            req.task.completedBy.push(data)
            await req.task.save()
            res.status(200).send('Task updated succesfully!')
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' })
        }
    }
}