const express = require("express");
const TGroupSchema = require("../modules/TGroupSchema");
const Task = require("../modules/TaskSchema");
const LevelsRoutes = require("./RoleLevels");
const bodyParser = require("body-parser");

const app = express.Router();
const customBodyParserMiddleware = bodyParser.json({ limit: "100mb" });

// Add a new Task Group
app.post("/TGroups", customBodyParserMiddleware, async (req, res) => {
  try {
    let { groupName, deptHead, projectLead, members, profilePic } = req.body;

    // Ensure deptHead and projectLead are single values
    deptHead = Array.isArray(deptHead) && deptHead.length > 0 ? deptHead[0] : deptHead;
    projectLead = Array.isArray(projectLead) && projectLead.length > 0 ? projectLead[0] : projectLead;

    const newTaskGroup = new TGroupSchema({
      groupName,
      deptHead,
      projectLead,
      members,
      profilePic,
      createdAt: new Date(),
    });

    const savedTaskGroup = await newTaskGroup.save();
    const allTaskGroups = await TGroupSchema.find();
    res.status(201).json({ savedTaskGroup, allTaskGroups });
  } catch (error) {
    console.error("Error adding new Task Group:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all Task Groups
app.get("/tgroups", async (req, res) => {
  try {
    const taskGroups = await TGroupSchema.find().sort({ createdAt: -1 });
    res.json(taskGroups);
  } catch (error) {
    console.error("Error fetching task groups:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get tasks by Task Group ID
app.get("/tasks/:taskGroupId", async (req, res) => {
  try {
    const taskGroupId = req.params.taskGroupId;
    const tasks = await Task.find({ "taskGroup.id": taskGroupId });
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks by Task Group ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update Task Group by ID
app.put("/TGroup/:TGroupId", async (req, res) => {
  const TGroupId = req.params.TGroupId;
  const { groupName, members, profilePic, deptHead, projectLead } = req.body;

  try {
    const existingTGroup = await TGroupSchema.findById(TGroupId);

    if (!existingTGroup) {
      return res.status(404).json({ message: "Task Group not found" });
    }

    const updatedDeptHeads = existingTGroup.deptHead.concat(deptHead || []);
    const updatedProjectLeads = existingTGroup.projectLead.concat(projectLead || []);
    const updatedMembers = existingTGroup.members.concat(members || []);

    const updatedTGroup = await TGroupSchema.findByIdAndUpdate(
      TGroupId,
      { groupName, members: updatedMembers, profilePic, projectLead: updatedProjectLeads, deptHead: updatedDeptHeads },
      { new: true }
    );

    res.json(updatedTGroup);
  } catch (error) {
    console.error("Error updating Task Group:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get members by Task Group ID
app.get("/members/:TGroupId", async (req, res) => {
  const TGroupId = req.params.TGroupId;

  try {
    const tgroup = await TGroupSchema.findOne({ _id: TGroupId }).populate({
      path: "members deptHead projectLead"
    });

    if (!tgroup) {
      return res.status(404).json({ message: "Task Group not found for the specified ID" });
    }

    const members = tgroup.members;
    const deptHead = tgroup.deptHead;
    const projectLead = tgroup.projectLead;

    res.json({ members, deptHead, projectLead });
  } catch (error) {
    console.error("Error fetching members by Task Group ID:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete Task Group by ID
app.delete("/delete/:TGroupId", LevelsRoutes, async (req, res) => {
  const TGroupId = req.params.TGroupId;

  try {
    const deletedTask = await TGroupSchema.findOneAndDelete({ _id: TGroupId });

    if (deletedTask) {
      res.status(200).json({ message: "Task Group deleted successfully" });
    } else {
      res.status(404).json({ message: "Task Group not found" });
    }
  } catch (error) {
    console.error("Error deleting Task Group:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = app;
