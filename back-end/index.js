import express from 'express';
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken';
import cors from 'cors';
import dotenv from 'dotenv';
import responseTime from 'response-time';
import compression from 'compression';

import { MongoClient, ServerApiVersion } from "mongodb";





// Load environment variables
dotenv.config();

// Initialize app
const app = express();
app.use(cors());
app.use(express.json());

app.use(responseTime());
app.use(compression());
// MongoDB Connection


const uri = "mongodb+srv://dinesh7733:Qh2TTvECk0v89CWZ@notesapp.gfkyn.mongodb.net/?retryWrites=true&w=majority&appName=notesapp";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);


// Models
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model('User', UserSchema);

const NoteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});
const Note = mongoose.model('Note', NoteSchema);



app.get('/',(req,res)=>{
  res.send('<h1>hello , Welcome to my</h1>')
})
// Routes
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const hashedPassword = await bcryptjs.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ message: 'Email already exists' });
    } else {
      res.status(500).json({ message: 'Registration failed', error: err.message });
    }
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Use the JWT_SECRET or fallback value
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('Authorization Header:', authHeader); // Log the authorization header
  
  const token = authHeader?.split(' ')[1];
  if (!token) {
    console.error('Token missing or improperly formatted');
    return res.status(401).json({ message: 'Token missing or improperly formatted' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'default_secret', (err, user) => {
    if (err) {
      console.error('Token verification error:', err.message);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user; // Attach user data to request
    next();
  });
};

app.get('/notes', authenticate, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.userId }).lean(); // Use `lean` for faster queries
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notes', error: err.message });
  }
});

app.post('/notes', authenticate, async (req, res) => {
  try {
    const note = new Note({
      ...req.body,
      userId: req.user.userId,
    });
    const savedNote = await note.save();
    res.status(201).json(savedNote);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create note', error: err.message });
  }
});

app.put('/notes/:id', authenticate, async (req, res) => {
  try {
    const updatedNote = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true }
    );
    if (!updatedNote) return res.status(404).json({ message: 'Note not found' });
    res.json(updatedNote);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update note', error: err.message });
  }
});

app.delete('/notes/:id', authenticate, async (req, res) => {
  try {
    const deletedNote = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!deletedNote) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete note', error: err.message });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));



















