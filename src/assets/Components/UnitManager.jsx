import React, { useEffect, useState } from "react";
import {
  getUnits,
  createUnit,
  deleteUnit,
  updateUnit
} from "../api/unitApi";

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
  Grid
} from "@mui/material";
import { Edit, Delete, Save, Cancel, AddCircleOutline } from "@mui/icons-material"; // Added AddCircleOutline

function UnitManager() {
  const [units, setUnits] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    const res = await getUnits();
    setUnits(res.data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createUnit({ name: name.trim() }); // Pass as object
    setName("");
    fetchUnits();
  };

  const handleDelete = async (id) => {
    // Consider adding a confirmation dialog here for better UX
    await deleteUnit(id);
    fetchUnits();
  };

  const handleEdit = (unit) => {
    setEditingId(unit._id);
    setEditingName(unit.name);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingName.trim()) return;
    await updateUnit(editingId, { name: editingName.trim() }); // Pass as object
    setEditingId(null);
    setEditingName("");
    fetchUnits();
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  }

  return (
    <Box sx={{ maxWidth: 1200, width: '100%', p: 5, backgroundColor: 'background.paper', borderRadius: 3, boxShadow: 3, mt: 8, ml: 30 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold', color: 'primary.main' }}>
        Quản lý Đơn vị tính
      </Typography>

      <Box component="form" onSubmit={handleCreate} sx={{ display: "flex", gap: 1.5, mb: 4, alignItems: 'center' }}>
        <TextField
          fullWidth
          label="Tên đơn vị mới"
          value={name}
          onChange={(e) => setName(e.target.value)}
          variant="outlined"
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
              <TableCell sx={{ fontWeight: '600', py: 1.5, px: 2 }}>Tên đơn vị</TableCell>
              <TableCell align="right" sx={{ fontWeight: '600', py: 1.5, px: 2 }}>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {units.map((unit) => (
              <TableRow key={unit._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell sx={{ py: 1, px: 2 }}>
                  {editingId === unit._id ? (
                    <TextField
                      fullWidth
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      size="small"
                      autoFocus
                      variant="standard" // Use standard variant for inline editing
                      sx={{ input: { py: 0.5 } }} // Adjust padding for standard variant
                    />
                  ) : (
                    unit.name
                  )}
                </TableCell>
                <TableCell align="right" sx={{ py: 1, px: 2 }}>
                  {editingId === unit._id ? (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                      <IconButton color="success" onClick={handleUpdate} size="small" title="Lưu">
                        <Save fontSize="small" />
                      </IconButton>
                      <IconButton color="inherit" onClick={handleCancelEdit} size="small" title="Huỷ">
                        <Cancel fontSize="small" />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                      <IconButton color="primary" onClick={() => handleEdit(unit)} size="small" title="Chỉnh sửa">
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(unit._id)} size="small" title="Xoá">
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {units.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Chưa có đơn vị nào. Vui lòng thêm mới.
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

export default UnitManager;
