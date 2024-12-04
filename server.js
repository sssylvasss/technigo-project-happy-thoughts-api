import cors from 'cors';
import mongoose from 'mongoose';
import express from 'express';

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/project-happy-thoughts-api";
mongoose.connect(mongoUrl);
mongoose.Promise = Promise;

const Thought = mongoose.model('Thought', {
  message: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 140
  },
  hearts: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.once("open", () => {
  console.log("Successfully connected to MongoDB");
});


const port = process.env.PORT || 8080;
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {

res.send(`
   <html>
     <head>
      <title>>Welcome to the Happy Thoughts API</title>
    </head>
    <body>
  <p>Available endpoints:</p>
  <ul>
    <li>GET /thoughts - Get the latest thoughts</li>
    <li>POST /thoughts - Post a new thought</li>
    <li>POST /thoughts/:thoughtId/like - Like a thought</li>
  </ul>
   </body>
  </html>
`);
});

app.get("/thoughts", async (req, res) => {
  const thoughts = await Thought.find().sort({ createdAt: 'desc' }).limit(20).exec();
  res.json(thoughts);
});

app.post("/thoughts", async (req, res) => {
  const message= req.body.message;
  const thought = new Thought({message});
  try{
    const savedThought = await thought.save();
    res.status(201).json(savedThought);
  } catch (err){
    res.status(400).json({message: "Could not save thought", error: err.errors});
  }
})

app.post("/thoughts/:thoughtId/like", async (req, res) => {
  const {thoughtId} = req.params;
  try{
    const updatedThought = await Thought.findOneAndUpdate({ _id: thoughtId }, {$inc: {hearts: 1}}, {new: true});
    res.status(201).json(updatedThought);
  } catch (err){
    res.status(400).json({message: "Could not like thought", error: err.errors});
  }});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
