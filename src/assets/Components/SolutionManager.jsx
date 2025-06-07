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
  Alert,
  CircularProgress,
} from "@mui/material";
import { Edit, Delete, Save, Cancel, AddCircleOutline, Search } from "@mui/icons-material";

function SolutionManager() {
  const [solutions, setSolutions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingForm, setEditingForm] = useState({ name: "" });
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false); // Loading khi fetch data
  const [loadingSubmit, setLoadingSubmit] = useState(false); // Loading khi submit (thêm, sửa, xoá)

  useEffect(() => {
    fetchSolutions();
  }, []);

  const fetchSolutions = async () => {
    setLoading(true);
    try {
      const res = await getSolutions();
      setSolutions(res.data);
    } catch (err) {
      console.error("Lỗi tải giải pháp:", err);
      setFeedback({ type: "error", message: "Không thể tải danh sách giải pháp." });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const trimmedName = newName.trim();
    if (!trimmedName) {
      setFeedback({ type: "warning", message: "Tên giải pháp không được để trống." });
      return;
    }

    const exists = solutions.some(
      (s) => s.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (exists) {
      setFeedback({ type: "error", message: "Giải pháp đã tồn tại!" });
      return;
    }

    setLoadingSubmit(true);
    try {
      await createSolution({ name: trimmedName });
      setNewName("");
      await fetchSolutions();
      setFeedback({ type: "success", message: "Thêm giải pháp thành công!" });
    } catch (err) {
      console.error("Lỗi tạo giải pháp:", err);
      setFeedback({ type: "error", message: "Lỗi khi thêm giải pháp." });
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleEdit = (solution) => {
    setEditingId(solution._id);
    setEditingForm({ name: solution.name });
    setFeedback({ type: "", message: "" });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const trimmedName = editingForm.name.trim();
    if (!trimmedName) {
      setFeedback({ type: "warning", message: "Tên giải pháp không được để trống." });
      return;
    }

    setLoadingSubmit(true);
    try {
      await updateSolution(editingId, { name: trimmedName });
      setEditingId(null);
      setEditingForm({ name: "" });
      await fetchSolutions();
      setFeedback({ type: "success", message: "Cập nhật giải pháp thành công!" });
    } catch (err) {
      console.error("Lỗi cập nhật giải pháp:", err);
      setFeedback({ type: "error", message: "Lỗi khi cập nhật giải pháp." });
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleDelete = async (id) => {
    // Có thể thêm confirm dialog nếu muốn
    setLoadingSubmit(true);
    try {
      await deleteSolution(id);
      await fetchSolutions();
      setFeedback({ type: "success", message: "Xoá giải pháp thành công!" });
    } catch (err) {
      console.error("Lỗi xoá giải pháp:", err);
      setFeedback({ type: "error", message: "Lỗi khi xoá giải pháp." });
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingForm({ name: "" });
    setFeedback({ type: "", message: "" });
  };

  const filteredSolutions = solutions.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        position: "relative",
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ mb: 4, textAlign: "center", fontWeight: "bold", color: "primary.main" }}
      >
        Quản lý Giải pháp
      </Typography>

      {feedback.message && (
        <Alert
          severity={feedback.type}
          sx={{ mb: 2 }}
          onClose={() => setFeedback({ type: "", message: "" })}
        >
          {feedback.message}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={handleCreate}
        sx={{ display: "flex", gap: 1.5, mb: 2, alignItems: "center" }}
      >
        <TextField
          label="Tên giải pháp mới"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          variant="outlined"
          fullWidth
          size="small"
          disabled={loadingSubmit}
        />
        <Button
          variant="contained"
          color="primary"
          type="submit"
          startIcon={loadingSubmit ? <CircularProgress size={20} color="inherit" /> : <AddCircleOutline />}
          sx={{ py: "9px", px: 2.5, whiteSpace: "nowrap" }}
          disabled={loadingSubmit}
        >
          Thêm mới
        </Button>
      </Box>

      <TextField
        label="Tìm kiếm giải pháp"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        variant="outlined"
        fullWidth
        size="small"
        sx={{ mb: 4 }}
        disabled={loadingSubmit || loading}
        InputProps={{
          startAdornment: <Search color="action" sx={{ mr: 1 }} />,
        }}
      />

      <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden", position: "relative" }}>
        {loading && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              bgcolor: "rgba(255,255,255,0.7)",
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress />
          </Box>
        )}

        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: "grey.100" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "600", py: 1.5, px: 2 }}>Tên giải pháp</TableCell>
              <TableCell align="right" sx={{ fontWeight: "600", py: 1.5, px: 2 }}>
                Hành động
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSolutions.map((s) => (
              <TableRow
                key={s._id}
                hover
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell sx={{ py: 1, px: 2 }}>
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
                      autoFocus
                      variant="standard"
                      sx={{ input: { py: 0.5 } }}
                      disabled={loadingSubmit}
                    />
                  ) : (
                    s.name
                  )}
                </TableCell>
                <TableCell align="right" sx={{ py: 1, px: 2 }}>
                  {editingId === s._id ? (
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                      <IconButton
                        color="success"
                        onClick={handleUpdate}
                        size="small"
                        title="Lưu"
                        disabled={loadingSubmit}
                      >
                        {loadingSubmit ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <Save fontSize="small" />
                        )}
                      </IconButton>
                      <IconButton
                        color="inherit"
                        onClick={handleCancelEdit}
                        size="small"
                        title="Huỷ"
                        disabled={loadingSubmit}
                      >
                        <Cancel fontSize="small" />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                      <IconButton
                        color="primary"
                        onClick={() => handleEdit(s)}
                        size="small"
                        title="Chỉnh sửa"
                        disabled={loadingSubmit}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(s._id)}
                        size="small"
                        title="Xoá"
                        disabled={loadingSubmit}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filteredSolutions.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    {solutions.length > 0
                      ? "Không tìm thấy giải pháp phù hợp."
                      : "Chưa có giải pháp nào. Vui lòng thêm mới."}
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

export default SolutionManager;
