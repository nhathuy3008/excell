import React, { useEffect, useState } from "react";
import {
  getRepairContents,
  createRepairContent,
  updateRepairContent,
  deleteRepairContent,
} from "../api/repairContentApi";

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

function RepairContentManager() {
  const [repairContents, setRepairContents] = useState([]);
  const [form, setForm] = useState({ name: "" });
  const [editingId, setEditingId] = useState(null);
  const [editingForm, setEditingForm] = useState({});

  useEffect(() => {
    fetchRepairContents();
  }, []);

  const fetchRepairContents = async () => {
    try {
      const res = await getRepairContents();
      setRepairContents(res.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách nội dung sửa chữa:", error);
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
      await createRepairContent(form);
      setForm({ name: "" });
      fetchRepairContents();
    } catch (error) {
      console.error("Lỗi tạo nội dung sửa chữa:", error);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setEditingForm({ name: item.name });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingForm.name.trim()) return;
    try {
      await updateRepairContent(editingId, editingForm);
      setEditingId(null);
      setEditingForm({});
      fetchRepairContents();
    } catch (error) {
      console.error("Lỗi cập nhật nội dung sửa chữa:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteRepairContent(id);
      fetchRepairContents();
    } catch (error) {
      console.error("Lỗi xoá nội dung sửa chữa:", error);
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
        Quản lý Nội dung sửa chữa
      </Typography>

      {/* Form thêm */}
      <Box
        component="form"
        onSubmit={handleCreate}
        sx={{ display: "flex", gap: 2, mb: 3 }}
      >
        <TextField
          name="name"
          label="Tên nội dung sửa chữa"
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
              <TableCell>Tên nội dung sửa chữa</TableCell>
              <TableCell align="right">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {repairContents.map((item) => (
              <TableRow key={item._id}>
                <TableCell>
                  {editingId === item._id ? (
                    <TextField
                      name="name"
                      value={editingForm.name}
                      onChange={(e) => handleChange(e, true)}
                      size="small"
                      fullWidth
                      required
                    />
                  ) : (
                    item.name
                  )}
                </TableCell>
                <TableCell align="right">
                  {editingId === item._id ? (
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
                      <IconButton color="primary" onClick={() => handleEdit(item)}>
                        <Edit />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(item._id)}>
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

export default RepairContentManager;
