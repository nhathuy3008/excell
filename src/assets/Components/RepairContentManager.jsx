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
  TableContainer, // Added for consistency
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip, // Added for better UX
  Alert, // Added for feedback
  Dialog, // Using Dialog for editing for consistency
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material"; // Removed Save, Cancel as we'll use Dialog

function RepairContentManager() {
  const [repairContents, setRepairContents] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // For search functionality
  const [newItemName, setNewItemName] = useState(""); // For adding new item

  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // Stores the whole item being edited
  const [editFormName, setEditFormName] = useState("");

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchRepairContents();
  }, []);

  const fetchRepairContents = async () => {
    try {
      setError(null);
      const res = await getRepairContents();
      setRepairContents(res.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách nội dung sửa chữa:", error);
      setError("Không thể tải danh sách nội dung sửa chữa.");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const trimmedInput = newItemName.trim();
    if (!trimmedInput) {
      setError("Tên nội dung không được để trống.");
      return;
    }

    const existed = repairContents.some(
      (item) => item.name.toLowerCase() === trimmedInput.toLowerCase()
    );
    if (existed) {
      setError("Nội dung sửa chữa đã tồn tại!");
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      await createRepairContent({ name: trimmedInput });
      setNewItemName("");
      fetchRepairContents();
      setSuccess("Thêm nội dung sửa chữa thành công!");
    } catch (error) {
      console.error("Lỗi tạo nội dung sửa chữa:", error);
      setError("Lỗi khi tạo nội dung sửa chữa.");
    }
  };

  const handleOpenEditDialog = (item) => {
    setError(null);
    setSuccess(null);
    setEditingItem(item);
    setEditFormName(item.name);
    setOpenDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
    setEditFormName("");
    setError(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editFormName.trim()) {
      setError("Tên nội dung không được để trống.");
      return;
    }
    if (!editingItem) return;

    try {
      setError(null);
      setSuccess(null);
      await updateRepairContent(editingItem._id, { name: editFormName });
      fetchRepairContents();
      handleCloseEditDialog();
      setSuccess("Cập nhật nội dung sửa chữa thành công!");
    } catch (error) {
      console.error("Lỗi cập nhật nội dung sửa chữa:", error);
      setError("Lỗi khi cập nhật nội dung sửa chữa.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nội dung này không?")) {
      try {
        setError(null);
        setSuccess(null);
        await deleteRepairContent(id);
        fetchRepairContents();
        setSuccess("Xóa nội dung sửa chữa thành công!");
      } catch (error) {
        console.error("Lỗi xoá nội dung sửa chữa:", error);
        setError("Lỗi khi xóa nội dung sửa chữa.");
      }
    }
  };

  const filteredContents = repairContents.filter((content) =>
    content.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ maxWidth: 1200, width: '100%', p: 5, backgroundColor: 'background.paper', borderRadius: 3, boxShadow: 3, mt: 8, ml: 30 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, textAlign: 'center', color: 'primary.main' }}>
        Quản lý Nội dung Sửa chữa
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Box component="form" onSubmit={handleCreate} sx={{ display: "flex", gap: 2, mb: 3, alignItems: 'center' }}>
        <TextField
          label="Thêm nội dung sửa chữa mới"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          variant="outlined"
          fullWidth
          size="small"
        />
        <Button variant="contained" color="primary" type="submit" startIcon={<Add />}>
          Thêm
        </Button>
      </Box>

      <TextField
        label="Tìm kiếm nội dung"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        variant="outlined"
        fullWidth
        size="small"
        sx={{ mb: 3 }}
      />

      <TableContainer component={Paper} elevation={3}>
        <Table sx={{ minWidth: 650 }} aria-label="repair content table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Tên nội dung sửa chữa</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredContents.length > 0 ? (
              filteredContents.map((item) => (
                <TableRow 
                  key={item._id} 
                  sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: 'action.hover' } }}
                >
                  <TableCell component="th" scope="row">
                    {item.name}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Chỉnh sửa">
                      <IconButton onClick={() => handleOpenEditDialog(item)} color="primary" size="small">
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton onClick={() => handleDelete(item._id)} color="error" size="small">
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} align="center" sx={{ py: 3 }}>
                  <Typography variant="subtitle1">
                    {searchTerm ? "Không tìm thấy nội dung phù hợp." : "Chưa có nội dung sửa chữa nào."}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseEditDialog} PaperProps={{ elevation: 5, sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'common.white' }}>Chỉnh sửa Nội dung Sửa chữa</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>} 
          <TextField
            autoFocus
            margin="dense"
            label="Tên Nội dung Sửa chữa"
            fullWidth
            variant="outlined"
            value={editFormName}
            onChange={(e) => setEditFormName(e.target.value)}
            error={!!error} // Highlight field if there's an error related to it
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseEditDialog} color="secondary">Hủy</Button>
          <Button onClick={handleUpdate} variant="contained" color="primary">Cập nhật</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default RepairContentManager;
