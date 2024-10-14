import type { Request, Response} from 'express'
import Note from '../models/Note'
import { Types } from 'mongoose'

type NoteParams = {
    noteId: Types.ObjectId
}

export class NoteController {
    static postCreateNote = async (req: Request, res: Response) => {
        const {content} = req.body
        const note = new Note()
        note.content = content
        note.task = req.task.id
        note.createdBy = req.user.id 

        req.task.notes.push(note.id)

        try {
            await Promise.allSettled([note.save(), req.task.save()])
            res.status(201).send('Note created succesfully.')
        } catch (error) {
            res.status(500).json({error: 'Internal Server Error.'})
        }
    }

    static getTaskNotes = async (req: Request, res: Response) => {
        try {
            const notes = await Note.find({task: req.task.id})
            res.status(200).json(notes)
        } catch (error) {
            res.status(500).json({error: 'Internal Server Error.'})
        }
    }

    static deleteNote = async (req: Request<NoteParams>, res: Response) => {
        const {noteId} = req.params
        const notes = await Note.findById(noteId)
        if (!notes) {
            const error = new Error('Note not found.')
            return res.status(404).json({error: error.message})
        }

        if (notes.createdBy.toString() !== req.user.id.toString()) {
            const error = new Error('Invalid action.')
            return res.status(401).json({error: error.message})
        }
        req.task.notes = req.task.notes.filter(note => note.toString() !== noteId.toString())
        try {
            await Promise.allSettled([req.task.save(),notes.deleteOne()]) 
            res.status(200).send('Note removed.')
        } catch (error) {
            res.status(500).json({error: 'Internal Server Error.'})
        }
    }
}