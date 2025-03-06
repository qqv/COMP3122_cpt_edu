import { Router } from 'express'
import Team from '../models/team'
import type { Request, Response } from 'express'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
  try {
    const teams = await Team.find().populate('members.userId')
    res.json(teams)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teams' })
  }
})

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const team = await Team.findById(req.params.id).populate('members.userId')
    if (!team) {
      return res.status(404).json({ message: 'Team not found' })
    }
    res.json(team)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching team' })
  }
})

router.post('/', async (req: Request, res: Response) => {
  try {
    const team = new Team(req.body)
    await team.save()
    res.status(201).json(team)
  } catch (error) {
    res.status(400).json({ message: 'Error creating team' })
  }
})

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!team) {
      return res.status(404).json({ message: 'Team not found' })
    }
    res.json(team)
  } catch (error) {
    res.status(400).json({ message: 'Error updating team' })
  }
})

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id)
    if (!team) {
      return res.status(404).json({ message: 'Team not found' })
    }
    res.json({ message: 'Team deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Error deleting team' })
  }
})

export default router 