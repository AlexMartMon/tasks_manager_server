import type {Request, Response} from 'express'
import Project from '../models/Project'

export class ProjectController {
    
    static getAllProjects = async (req: Request, res: Response) => {
        try {
            const projects = await Project.find({
                $or: [
                    {manager: {$in: req.user.id}},
                    {team: {$in: req.user.id}}
                ]
            })
            res.status(200).json(projects)
        } catch (error) {
            res.status(500).json({error: 'Internal Server Error'})
        }
    }

    static getProjectById = async (req: Request, res: Response) => {
        const {id} = req.params
        try {
            const project = await Project.findById(id).populate('tasks')
            if (!project) {
                const error = new Error('Project not found.')
                return res.status(404).json({error: error.message})
            }
            if (project.manager.toString() !== req.user.id && !project.team.includes(req.user.id)) {
                const error = new Error('Unauthorized.')
                return res.status(401).json({error: error.message})
            }
            res.status(200).json(project)
        } catch (error) {
            res.status(500).json({error: 'Internal Server Error'})
        }
    }

    static postCreateProject = async (req: Request, res: Response) => {
        const project = new Project(req.body)
        project.manager = req.user.id
        try {
            await project.save()
            res.status(201).send('Project created succesfully.')
        } catch (error) {
            res.status(500).json({error: 'Internal Server Error'})
        }
    }

    static putUpdateProject = async (req: Request, res: Response) => {
        
        try {
            req.project.clientName = req.body.clientName
            req.project.projectName = req.body.projectName
            req.project.description = req.body.description
            await req.project.save()
            res.status(200).send('Project updated succesfully.')
        } catch (error) {
            res.status(500).json({error: 'Internal Server Error'})
        }
    }

    static deleteProject = async (req: Request, res: Response) => {
        try {
            await req.project.deleteOne()
            res.status(200).send('Project deleted succesfully.')
        } catch (error) {
            res.status(500).json({error: 'Internal Server Error'})
        }
    }

}