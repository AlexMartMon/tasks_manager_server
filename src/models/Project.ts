import mongoose, { Schema, Document, PopulatedDoc, Types} from "mongoose";
import Task, { TaskInterface } from "./Task";
import { AuthInterface } from "./Auth";
import Note from "./Note";

export interface ProjectInterface extends Document  {
    projectName: string,
    clientName: string,
    description: string,
    tasks: PopulatedDoc<TaskInterface & Document>[],
    manager: PopulatedDoc<AuthInterface & Document>,
    team: PopulatedDoc<AuthInterface & Document>[]
}

const ProjectSchema: Schema = new Schema({
    projectName: {
        type: String,
        required: true,
        trim: true
    },
    clientName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    tasks: [
        {
            type: Types.ObjectId,
            ref: 'Task'
        }
    ],
    manager: {
        type: Types.ObjectId,
        ref: 'Auth'
    },
    team: [
        {
            type: Types.ObjectId,
            ref: 'Auth'
        }
    ]
}, {timestamps: true})

//middleware
ProjectSchema.pre('deleteOne', {document: true, query: false}, async function() {
    const projectId = this._id
    if (!projectId) return
    const tasks = await Task.find({project: projectId})
    for (const task of tasks) {
        await Note.deleteMany({task: task.id})
    }
    await Task.deleteMany({project: projectId})
})

const Project = mongoose.model<ProjectInterface>('Project', ProjectSchema)
export default Project