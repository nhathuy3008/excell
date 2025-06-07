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
  Typography,
  Box,
  Tooltip,
  Alert,
  CircularProgress, // import spinner
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
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false); // loading state

  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchStatuses = async () => {
    try {
      setLoading(true); // bật loading khi fetch
      setError(null);
      const res = await getStatuses();
      setStatuses(res.data);
    } catch (err) {
      console.error("Lỗi khi load status:", err);
      setError("Không thể tải danh sách trạng thái.");
    } finally {
      setLoading(false); // tắt loading sau khi fetch xong
    }
  };

  const handleOpen = (status = null) => {
    setError(null);
    setSuccess(null);
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
    setError(null);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true); // bật loading khi gửi request
      setError(null);
      setSuccess(null);
      if (!name.trim()) {
        setError("Tên trạng thái không được để trống.");
        setLoading(false);
        return;
      }
      if (editId) {
        await updateStatus(editId, { name });
        setSuccess("Cập nhật trạng thái thành công!");
      } else {
        await createStatus({ name });
        setSuccess("Thêm trạng thái thành công!");
      }
      await fetchStatuses();
      handleClose();
    } catch (err) {
      console.error("Lỗi khi thêm/sửa status:", err);
      setError(editId ? "Lỗi khi cập nhật trạng thái." : "Lỗi khi thêm trạng thái.");
    } finally {
      setLoading(false); // tắt loading khi request xong
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa status này không?")) {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);
        await deleteStatus(id);
        setSuccess("Xóa trạng thái thành công!");
        await fetchStatuses();
      } catch (err) {
        console.error("Lỗi khi xóa status:", err);
        setError("Lỗi khi xóa trạng thái.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, width: "100%", p: 5, backgroundColor: "background.paper", borderRadius: 3, boxShadow: 3, mt: 8, ml: 30 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, textAlign: "center", color: "primary.main" }}>
        Quản lý Trạng thái
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Button variant="contained" onClick={() => handleOpen()} sx={{ mb: 3 }} disabled={loading}>
        Thêm Trạng thái mới {loading && <CircularProgress size={20} sx={{ ml: 1, color: 'white' }} />}
      </Button>

      <TableContainer component={Paper} elevation={3}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead sx={{ backgroundColor: "grey.100" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Tên Trạng thái</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Ngày tạo</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : statuses.length > 0 ? (
              statuses.map((status) => (
                <TableRow
                  key={status._id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 }, "&:hover": { backgroundColor: "action.hover" } }}
                >
                  <TableCell component="th" scope="row">
                    {status.name}
                  </TableCell>
                  <TableCell>{new Date(status.createdAt).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Chỉnh sửa">
                      <IconButton onClick={() => handleOpen(status)} color="primary" size="small" disabled={loading}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton onClick={() => handleDelete(status._id)} color="error" size="small" disabled={loading}>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                  <Typography variant="subtitle1">Không có trạng thái nào.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleClose} PaperProps={{ elevation: 5, sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ backgroundColor: "primary.main", color: "common.white" }}>
          {editId ? "Chỉnh sửa Trạng thái" : "Thêm Trạng thái mới"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            label="Tên Trạng thái"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!error}
            disabled={loading} // disable input khi loading
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} color="secondary" disabled={loading}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary" disabled={loading}>
            {loading && <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />}
            {editId ? "Cập nhật" : "Thêm"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StatusManager;
