import React, { useEffect, useState } from "react";
import {
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import {
  getStatuses,
  createStatus,
  updateStatus,
  deleteStatus,
} from "../api/statusApi";

const StatusManager = () => {
  const [statuses, setStatuses] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");

  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchStatuses = async () => {
    try {
      const res = await getStatuses();
      setStatuses(res.data);
    } catch (err) {
      console.error("Lỗi khi load status:", err);
    }
  };

  const handleOpen = (status = null) => {
    if (status) {
      setEditId(status._id);
      setName(status.name);
    } else {
      setEditId(null);
      setName("");
    }
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setEditId(null);
    setName("");
  };

  const handleSubmit = async () => {
    try {
      if (editId) {
        await updateStatus(editId, { name });
      } else {
        await createStatus({ name });
      }
      await fetchStatuses();
      handleClose();
    } catch (err) {
      console.error("Lỗi khi thêm/sửa status:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa status này không?")) {
      try {
        await deleteStatus(id);
        await fetchStatuses();
      } catch (err) {
        console.error("Lỗi khi xóa status:", err);
      }
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Quản lý Status</h2>
      <Button variant="contained" color="primary" onClick={() => handleOpen()}>
        Thêm Status
      </Button>

      <TableContainer component={Paper} style={{ marginTop: 20 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {statuses.map((status) => (
              <TableRow key={status._id}>
                <TableCell>{status.name}</TableCell>
                <TableCell>{new Date(status.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(status)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(status._id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {statuses.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  Không có status nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleClose}>
        <DialogTitle>{editId ? "Chỉnh sửa trạng thái" : "Thêm trạng thái"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tên Status"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editId ? "Cập nhật" : "Thêm"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default StatusManager;
