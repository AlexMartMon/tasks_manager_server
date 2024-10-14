import type { Request, Response } from 'express';
import Auth from '../models/Auth';


export class TeamController {
    static postFindMemberById = async(req: Request, res: Response) =>{
        const {email} = req.body

        const user = await Auth.findOne({email}).select('id email name')
        if (!user) {
            const error = new Error('User does not exists.')
            return res.status(404).json({error: error.message})
        }

        res.status(200).json(user)
    }

    static getMembers = async(req: Request, res: Response) =>{
        const { team } = await req.project.populate('team', 'id name email')
        res.status(200).json(team)
    }

    static postAddMember = async(req: Request, res: Response) =>{
        const {id} = req.body

        const user = await Auth.findById(id).select('id')
        if (!user) {
            const error = new Error('User does not exists.')
            return res.status(404).json({error: error.message})
        }

        if (req.project.team.some(team => team.toString() === user.id.toString())) {
            const error = new Error('User is already part of the team.')
            return res.status(409).json({error: error.message})
        }
        req.project.team.push(user)
        await req.project.save()
        res.status(200).send('User add to project team succesfully.')
    }

    static deleteMember = async(req: Request, res: Response) =>{
        const {userId} = req.params

        if (!req.project.team.some(team => team.toString() === userId)) {
            const error = new Error('This user Id is not assigned to this project team.')
            return res.status(409).json({error: error.message})
        }

        req.project.team = req.project.team.filter(member => member.toString() !== userId)
        await req.project.save()
        res.status(200).send('User removed from project team succesfully.')
    }
}