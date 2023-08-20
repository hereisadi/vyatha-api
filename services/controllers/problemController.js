import Problem from "../models/problem.js";

const createProblem = async (req, res) => {
  const { scholarId, description, category, images, videos } = req.body;

  try {
    const newProblem = new Problem({
      scholarId,
      description,
      category,
      images,
      videos,
    });

    await newProblem.save();

    res.status(201).json({ message: "Problem created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateProblem = async (req, res) => {
  const { problemId } = req.params;
  const updateFields = req.body;

  try {
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    // Update only the fields that have been passed in the request body
    for (const field in updateFields) {
      if (Object.prototype.hasOwnProperty.call(updateFields, field)) {
        problem[field] = updateFields[field];
      }
    }

    await problem.save();

    res.status(200).json({ message: "Problem updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getProblemsByUser = async (req, res) => {
  const { scholarId } = req.params;

  try {
    const problems = await Problem.find({ scholarId });
    res.status(200).json(problems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getProblemsByAssignedTo = async (req, res) => {
  const { assignedTo } = req.params;

  try {
    const problems = await Problem.find({ assignedTo });
    res.status(200).json(problems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export {
  createProblem,
  updateProblem,
  getProblemsByUser,
  getProblemsByAssignedTo,
};
