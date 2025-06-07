import React, { useEffect, useState } from "react";
import {
  getUnits,
  createUnit,
  deleteUnit,
  updateUnit,
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
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Edit,
  Delete,
  Save,
  Cancel,
  AddCircleOutline,
} from "@mui/icons-material";

function UnitManager() {
  const [units, setUnits] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await getUnits();
      setUnits(res.data);
    } catch (err) {
      setError("Lỗi tải danh sách đơn vị.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      setError(null);
      setLoading(true);
      await createUnit(name.trim()); // ✅ đã sửa chỗ này
      setName("");
      await fetchUnits();
    } catch (err) {
      setError("Lỗi thêm đơn vị mới.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xoá đơn vị này?")) {
      try {
        setError(null);
        setLoading(true);
        await deleteUnit(id);
        await fetchUnits();
      } catch (err) {
        setError("Lỗi xoá đơn vị.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (unit) => {
    setError(null);
    setEditingId(unit._id);
    setEditingName(unit.name);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingName.trim()) return;
    try {
      setError(null);
      setLoading(true);
      await updateUnit(editingId, editingName.trim()); // ✅ đã sửa chỗ này
      setEditingId(null);
      setEditingName("");
      await fetchUnits();
    } catch (err) {
      setError("Lỗi cập nhật đơn vị.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setError(null);
    setEditingId(null);
    setEditingName("");
  };

  return (
    <Box
      sx={{
        maxWidth: 1200,
        width: "100%",
        p: 5,
        backgroundColor: "background.paper",
        borderRadius: 3,
        boxShadow: 3,
        mt: 8,
        ml: 30,
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ mb: 4, textAlign: "center", fontWeight: "bold", color: "primary.main" }}
      >
        Quản lý Đơn vị tính
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={handleCreate}
        sx={{ display: "flex", gap: 1.5, mb: 4, alignItems: "center" }}
      >
        <TextField
          fullWidth
          label="Tên đơn vị mới"
          value={name}
          onChange={(e) => setName(e.target.value)}
          variant="outlined"
          size="small"
          disabled={loading}
        />
        <Button
          variant="contained"
          color="primary"
          type="submit"
          startIcon={<AddCircleOutline />}
          sx={{ py: "9px", px: 2.5, whiteSpace: "nowrap" }}
          disabled={loading}
        >
          Thêm mới
        </Button>
      </Box>

      <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: "grey.100" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "600", py: 1.5, px: 2 }}>Tên đơn vị</TableCell>
              <TableCell align="right" sx={{ fontWeight: "600", py: 1.5, px: 2 }}>
                Hành động
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={2} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : units.length > 0 ? (
              units.map((unit) => (
                <TableRow
                  key={unit._id}
                  hover
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell sx={{ py: 1, px: 2 }}>
                    {editingId === unit._id ? (
                      <TextField
                        fullWidth
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        size="small"
                        autoFocus
                        variant="standard"
                        sx={{ input: { py: 0.5 } }}
                        disabled={loading}
                      />
                    ) : (
                      unit.name
                    )}
                  </TableCell>
                  <TableCell align="right" sx={{ py: 1, px: 2 }}>
                    {editingId === unit._id ? (
                      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                        <IconButton
                          color="success"
                          onClick={handleUpdate}
                          size="small"
                          title="Lưu"
                          disabled={loading}
                        >
                          <Save fontSize="small" />
                        </IconButton>
                        <IconButton
                          color="inherit"
                          onClick={handleCancelEdit}
                          size="small"
                          title="Huỷ"
                          disabled={loading}
                        >
                          <Cancel fontSize="small" />
                        </IconButton>
                      </Box>
                    ) : (
                      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                        <IconButton
                          color="primary"
                          onClick={() => handleEdit(unit)}
                          size="small"
                          title="Chỉnh sửa"
                          disabled={loading}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(unit._id)}
                          size="small"
                          title="Xoá"
                          disabled={loading}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
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
