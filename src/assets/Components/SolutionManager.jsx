import React, { useEffect, useState } from "react";
import {
  getSolutions,
  createSolution,
  updateSolution,
  deleteSolution,
} from "../api/solutionApi";

import {
  Box,
  Button,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from "@mui/material";
import { Edit, Delete, Save, Cancel } from "@mui/icons-material";

function SolutionManager() {
  const [solutions, setSolutions] = useState([]);
  const [form, setForm] = useState({ name: "" });
  const [editingId, setEditingId] = useState(null);
  const [editingForm, setEditingForm] = useState({});

  useEffect(() => {
    fetchSolutions();
  }, []);

  const fetchSolutions = async () => {
    const res = await getSolutions();
    setSolutions(res.data);
  };

  const handleChange = (e, isEdit = false) => {
    const { name, value } = e.target;
    isEdit
      ? setEditingForm({ ...editingForm, [name]: value })
      : setForm({ ...form, [name]: value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    await createSolution(form);
    setForm({ name: "" });
    fetchSolutions();
  };

  const handleEdit = (solution) => {
    setEditingId(solution._id);
    setEditingForm({ name: solution.name });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingForm.name.trim()) return;
    await updateSolution(editingId, editingForm);
    setEditingId(null);
    setEditingForm({});
    fetchSolutions();
  };

  const handleDelete = async (id) => {
    await deleteSolution(id);
    fetchSolutions();
  };

  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: "auto",
        mt: 5,
        p: 3,
        backgroundColor: "#fff",
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <Typography variant="h5" gutterBottom>
        Quản lý Giải pháp
      </Typography>

      {/* Form thêm */}
      <Box
        component="form"
        onSubmit={handleCreate}
        sx={{ display: "flex", gap: 2, mb: 3 }}
      >
        <TextField
          name="name"
          label="Tên giải pháp"
          value={form.name}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          required
        />
        <Button variant="contained" color="primary" type="submit">
          Thêm
        </Button>
      </Box>

      {/* Bảng danh sách */}
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên giải pháp</TableCell>
              <TableCell align="right">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {solutions.map((s) => (
              <TableRow key={s._id}>
                <TableCell>
                  {editingId === s._id ? (
                    <TextField
                      name="name"
                      value={editingForm.name}
                      onChange={(e) => handleChange(e, true)}
                      size="small"
                      fullWidth
                      required
                    />
                  ) : (
                    s.name
                  )}
                </TableCell>
                <TableCell align="right">
                  {editingId === s._id ? (
                    <>
                      <IconButton color="primary" onClick={handleUpdate}>
                        <Save />
                      </IconButton>
                      <IconButton
                        color="secondary"
                        onClick={() => setEditingId(null)}
                      >
                        <Cancel />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <IconButton color="primary" onClick={() => handleEdit(s)}>
                        <Edit />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(s._id)}>
                        <Delete />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

export default SolutionManager;
