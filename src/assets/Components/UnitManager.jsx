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
  IconButton
} from "@mui/material";
import { Edit, Delete, Save, Cancel } from "@mui/icons-material";

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
    await createUnit(name);
    setName("");
    fetchUnits();
  };

  const handleDelete = async (id) => {
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
    await updateUnit(editingId, editingName);
    setEditingId(null);
    setEditingName("");
    fetchUnits();
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 5, p: 3, backgroundColor: "#fff", borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h5" gutterBottom>
        Quản lý Đơn vị
      </Typography>

      {/* Form thêm mới */}
      <Box component="form" onSubmit={handleCreate} sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          fullWidth
          label="Tên đơn vị"
          value={name}
          onChange={(e) => setName(e.target.value)}
          variant="outlined"
        />
        <Button variant="contained" color="primary" type="submit">
          Thêm
        </Button>
      </Box>

      {/* Bảng danh sách đơn vị */}
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên đơn vị</TableCell>
              <TableCell align="right">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {units.map((unit) => (
              <TableRow key={unit._id}>
                <TableCell>
                  {editingId === unit._id ? (
                    <TextField
                      fullWidth
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      size="small"
                    />
                  ) : (
                    unit.name
                  )}
                </TableCell>
                <TableCell align="right">
                  {editingId === unit._id ? (
                    <>
                      <IconButton color="primary" onClick={handleUpdate}>
                        <Save />
                      </IconButton>
                      <IconButton color="secondary" onClick={() => setEditingId(null)}>
                        <Cancel />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <IconButton color="primary" onClick={() => handleEdit(unit)}>
                        <Edit />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(unit._id)}>
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

export default UnitManager;
