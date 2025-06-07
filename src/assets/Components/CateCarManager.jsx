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

import { Edit, Delete, Save, Cancel, AddCircleOutline } from "@mui/icons-material"; // Added AddCircleOutline

function CateCarManager() {
  const [cateCars, setCateCars] = useState([]);
  const [form, setForm] = useState({ name: "" });
  const [editingId, setEditingId] = useState(null);
  const [editingForm, setEditingForm] = useState({ name: "" }); 
const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCateCars();
  }, []);

  const fetchCateCars = async () => {
  try {
    setLoading(true); // Bắt đầu tải
    const res = await getCateCars();
    setCateCars(res.data);
  } catch (error) {
    console.error("Lỗi lấy danh mục xe:", error);
  } finally {
    setLoading(false); // Dừng tải
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
      setEditingForm({ name: "" }); 
      fetchCateCars();
    } catch (error) {
      console.error("Lỗi cập nhật danh mục xe:", error);
    }
  };

  const handleDelete = async (id) => {
    // Consider adding a confirmation dialog
    try {
      await deleteCateCar(id);
      fetchCateCars();
    } catch (error) {
      console.error("Lỗi xoá danh mục xe:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingForm({ name: "" });
  }

  return (
    <Box sx={{ maxWidth: 1200, width: '100%', p: 5, backgroundColor: 'background.paper', borderRadius: 3, boxShadow: 3, mt: 8, ml: 30 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold', color: 'primary.main' }}>
        Quản lý Danh mục xe
      </Typography>

      <Box
        component="form"
        onSubmit={handleCreate}
        sx={{ display: "flex", gap: 1.5, mb: 4, alignItems: 'center' }}
      >
        <TextField
          name="name"
          label="Tên danh mục xe mới"
          value={form.name}
          onChange={handleChange}
          variant="outlined"
          fullWidth
          required
          size="small"
        />
        <Button variant="contained" color="primary" type="submit" startIcon={<AddCircleOutline />} sx={{ py: '9px', px: 2.5, whiteSpace: 'nowrap' }}>
          Thêm mới
        </Button>
      </Box>

      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: 'grey.100' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: '600', py: 1.5, px: 2 }}>Tên danh mục xe</TableCell>
              <TableCell align="right" sx={{ fontWeight: '600', py: 1.5, px: 2 }}>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cateCars.map((c) => (
              <TableRow key={c._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell sx={{ py: 1, px: 2 }}>
                  {editingId === c._id ? (
                    <TextField
                      name="name"
                      value={editingForm.name}
                      onChange={(e) => handleChange(e, true)}
                      size="small"
                      fullWidth
                      required
                      autoFocus
                      variant="standard"
                      sx={{ input: { py: 0.5 } }}
                    />
                  ) : (
                    c.name
                  )}
                </TableCell>
                <TableCell align="right" sx={{ py: 1, px: 2 }}>
                  {editingId === c._id ? (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5}}>
                      <IconButton color="success" onClick={handleUpdate} size="small" title="Lưu">
                        <Save fontSize="small"/>
                      </IconButton>
                      <IconButton
                        color="inherit"
                        onClick={handleCancelEdit}
                        size="small" 
                        title="Huỷ"
                      >
                        <Cancel fontSize="small"/>
                      </IconButton>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5}}>
                      <IconButton color="primary" onClick={() => handleEdit(c)} size="small" title="Chỉnh sửa">
                        <Edit fontSize="small"/>
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(c._id)} size="small" title="Xoá">
                        <Delete fontSize="small"/>
                      </IconButton>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {loading ? (
  <TableRow>
    <TableCell colSpan={2} align="center" sx={{ py: 3 }}>
      <Typography variant="body2" color="text.secondary">
        Vui lòng đợi một chút, dữ liệu đang được tải...
      </Typography>
    </TableCell>
  </TableRow>
) : cateCars.length === 0 && (
  <TableRow>
    <TableCell colSpan={2} align="center" sx={{ py: 3 }}>
      <Typography variant="body2" color="text.secondary">
        Chưa có danh mục xe nào. Vui lòng thêm mới.
      </Typography>
    </TableCell>
  </TableRow>
)}

          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

export default CateCarManager;
