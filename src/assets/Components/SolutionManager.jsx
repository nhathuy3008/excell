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
  const [input, setInput] = useState(""); // Gộp input tìm kiếm + thêm
  const [editingId, setEditingId] = useState(null);
  const [editingForm, setEditingForm] = useState({});

  useEffect(() => {
    fetchSolutions();
  }, []);

  const fetchSolutions = async () => {
    try {
      const res = await getSolutions();
      setSolutions(res.data);
    } catch (err) {
      console.error("Lỗi tải giải pháp:", err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const exists = solutions.some(
      (s) => s.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      alert("Giải pháp đã tồn tại!");
      return;
    }

    try {
      await createSolution({ name: trimmed });
      setInput("");
      fetchSolutions();
    } catch (err) {
      console.error("Lỗi tạo giải pháp:", err);
    }
  };

  const handleEdit = (solution) => {
    setEditingId(solution._id);
    setEditingForm({ name: solution.name });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const trimmed = editingForm.name.trim();
    if (!trimmed) return;

    try {
      await updateSolution(editingId, { name: trimmed });
      setEditingId(null);
      setEditingForm({});
      fetchSolutions();
    } catch (err) {
      console.error("Lỗi cập nhật giải pháp:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteSolution(id);
      fetchSolutions();
    } catch (err) {
      console.error("Lỗi xoá giải pháp:", err);
    }
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

      {/* Gộp ô tìm kiếm + thêm */}
      <Box
        component="form"
        onSubmit={handleCreate}
        sx={{ display: "flex", gap: 2, mb: 3 }}
      >
        <TextField
          label="Tìm kiếm hoặc thêm giải pháp"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          variant="outlined"
          fullWidth
        />
        <Button variant="contained" color="primary" type="submit">
          Thêm
        </Button>
      </Box>

      {/* Bảng danh sách lọc theo input */}
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên giải pháp</TableCell>
              <TableCell align="right">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {solutions
              .filter((s) =>
                s.name.toLowerCase().includes(input.toLowerCase())
              )
              .map((s) => (
                <TableRow key={s._id}>
                  <TableCell>
                    {editingId === s._id ? (
                      <TextField
                        name="name"
                        value={editingForm.name}
                        onChange={(e) =>
                          setEditingForm({ ...editingForm, name: e.target.value })
                        }
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
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(s._id)}
                        >
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
