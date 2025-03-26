import { Router } from 'express'
import Student from '../models/student'
import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../middleware/error'
import Team from '../models/team'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
  try {
    const students = await Student.find()
    res.json(students)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students' })
  }
})

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const student = await Student.findById(req.params.id).lean()
    if (!student) {
      return next(new AppError('Student not found', 404))
    }
    res.status(200).json(student)
  } catch (error) {
    next(new AppError('Error fetching student', 500))
  }
})

router.post('/', async (req: Request, res: Response) => {
  try {
    console.log('Creating student with data:', req.body);
    
    // Check if student with email or githubId already exists
    const { email, githubId } = req.body;
    
    // First check if email exists
    const existingEmail = await Student.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ 
        message: 'A student with this email already exists',
        error: 'duplicate_key',
        field: 'email'
      });
    }
    
    // Then check if githubId exists
    const existingGithubId = await Student.findOne({ githubId });
    if (existingGithubId) {
      return res.status(400).json({ 
        message: 'A student with this GitHub ID already exists',
        error: 'duplicate_key',
        field: 'githubId'
      });
    }
    
    // If we get here, we can create the student
    const student = new Student(req.body);
    const savedStudent = await student.save();
    console.log('Student saved successfully:', savedStudent);
    res.status(201).json(savedStudent);
  } catch (error: any) {
    console.error('Error creating student:', error);
    
    // Handle MongoDB duplicate key error (code 11000)
    if (error.name === 'MongoServerError' && error.code === 11000) {
      const keyPattern = error.keyPattern || {};
      const duplicateKey = Object.keys(keyPattern)[0];
      
      let message = 'Student already exists';
      let field = 'unknown';
      
      if (duplicateKey === 'email') {
        message = 'A student with this email already exists';
        field = 'email';
      } else if (duplicateKey === 'githubId') {
        message = 'A student with this GitHub ID already exists';
        field = 'githubId';
      }
      
      return res.status(400).json({ 
        message,
        error: 'duplicate_key',
        field
      });
    }
    
    res.status(400).json({ message: error.message || 'Error creating student' });
  }
})

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    if (!student) {
      return res.status(404).json({ message: 'Student not found' })
    }
    res.json(student)
  } catch (error) {
    res.status(400).json({ message: 'Error updating student' })
  }
})

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id)
    if (!student) {
      return res.status(404).json({ message: 'Student not found' })
    }
    res.json({ message: 'Student deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Error deleting student' })
  }
})

// Search students  
router.post('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query } = req.body
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ message: 'Search query is required' })
    }
    
    const searchRegex = new RegExp(query, 'i')
    const students = await Student.find({
      $or: [
        { name: searchRegex },
        { email: searchRegex }
      ]
    }).limit(10).lean()
    
    res.status(200).json({ students })
  } catch (error) {
    next(new AppError('Error searching students', 500))
  }
})

// Get teams for a student by GitHub ID
router.get('/teams/:githubId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { githubId } = req.params;
    
    if (!githubId) {
      return next(new AppError('GitHub ID is required', 400));
    }

    // Find student with the given GitHub ID
    const student = await Student.findOne({ githubId });
    
    if (!student) {
      return res.json([]);
    }
    
    // Find all teams that the student is a member of
    const teams = await Team.find({ 'members.userId': student._id });
    
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams for student with GitHub ID:', error);
    next(new AppError('Failed to fetch teams for student', 500));
  }
});

export default router 