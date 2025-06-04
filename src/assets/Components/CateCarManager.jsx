import React, { useEffect, useState } from "react";
import {
  getCateCars,
  createCateCar,
  updateCateCar,
  deleteCateCar,
} from "../api/cateCarApi";

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

function CateCarManager() {
  const [cateCars, setCateCars] = useState([]);
  const [form, setForm] = useState({ name: "" });
  const [editingId, setEditingId] = useState(null);
  const [editingForm, setEditingForm] = useState({});

  useEffect(() => {
    fetchCateCars();
  }, []);

  const fetchCateCars = async () => {
    try {
      const res = await getCateCars();
      setCateCars(res.data);
    } catch (error) {
      console.error("Lỗi lấy danh mục xe:", error);
    }
  };

  const handleChange = (e, isEdit = false) => {
    const { name, value } = e.target;
    if (isEdit) {
      setEditingForm({ ...editingForm, [name]: value });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      await createCateCar(form);
      setForm({ name: "" });
      fetchCateCars();
    } catch (error) {
      console.error("Lỗi tạo danh mục xe:", error);
    }
  };

  const handleEdit = (cateCar) => {
    setEditingId(cateCar._id);
    setEditingForm({ name: cateCar.name });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingForm.name.trim()) return;
    try {
      await updateCateCar(editingId, editingForm);
      setEditingId(null);
      setEditingForm({});
      fetchCateCars();
    } catch (error) {
      console.error("Lỗi cập nhật danh mục xe:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCateCar(id);
      fetchCateCars();
    } catch (error) {
      console.error("Lỗi xoá danh mục xe:", error);
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
        Quản lý Danh mục xe
      </Typography>

      {/* Form thêm */}
      <Box
        component="form"
        onSubmit={handleCreate}
        sx={{ display: "flex", gap: 2, mb: 3 }}
      >
        <TextField
          name="name"
          label="Tên danh mục xe"
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
              <TableCell>Tên danh mục xe</TableCell>
              <TableCell align="right">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cateCars.map((c) => (
              <TableRow key={c._id}>
                <TableCell>
                  {editingId === c._id ? (
                    <TextField
                      name="name"
                      value={editingForm.name}
                      onChange={(e) => handleChange(e, true)}
                      size="small"
                      fullWidth
                      required
                    />
                  ) : (
                    c.name
                  )}
                </TableCell>
                <TableCell align="right">
                  {editingId === c._id ? (
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
                      <IconButton color="primary" onClick={() => handleEdit(c)}>
                        <Edit />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(c._id)}>
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

export default CateCarManager;
