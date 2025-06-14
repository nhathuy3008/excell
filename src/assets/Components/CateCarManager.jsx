import React, { useEffect, useState, useCallback } from "react";
import { getCateCars, createCateCar, updateCateCar, deleteCateCar } from "../api/cateCarApi";
import {
  Box,
  Button,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Container,
  Grid,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Stack,
  Card,
  CardContent,
  CardActions,
  InputAdornment,
} from "@mui/material";
import { Edit, Delete, Save, AddCircleOutline, Search } from "@mui/icons-material";

const initialFormState = { name: "" };

function CateCarManager() {
  const [cateCars, setCateCars] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const fetchCateCars = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCateCars();
      setCateCars(res.data);
    } catch (err) {
      setError("Lỗi tải danh mục xe.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCateCars();
  }, [fetchCateCars]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (cateCar) => {
    setIsEditMode(true);
    setFormData(cateCar);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setFormData(initialFormState);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      setError("Tên danh mục là bắt buộc.");
      return;
    }
    setLoading(true);
    try {
      if (isEditMode) {
        await updateCateCar(formData._id, formData);
      } else {
        await createCateCar(formData);
      }
      handleCancelEdit();
      await fetchCateCars();
    } catch (err) {
      setError(isEditMode ? "Lỗi cập nhật danh mục." : "Lỗi thêm danh mục mới.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xoá danh mục này?")) {
      setLoading(true);
      try {
        await deleteCateCar(id);
        if (isEditMode && formData._id === id) {
          handleCancelEdit();
        }
        await fetchCateCars();
      } catch (err) {
        setError("Lỗi xoá danh mục.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredCateCars = cateCars.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderForm = () => (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 2, mb: 4, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {isEditMode ? "Chỉnh sửa Danh mục" : "Thêm Danh mục mới"}
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm>
          <TextField fullWidth label="Tên danh mục *" name="name" value={formData.name} onChange={handleFormChange} size="small" />
        </Grid>
        <Grid item xs={12} sm="auto">
          <Stack direction="row" spacing={2}>
            <Button type="submit" variant="contained" startIcon={isEditMode ? <Save /> : <AddCircleOutline />}>
              {isEditMode ? "Lưu" : "Thêm"}
            </Button>
            {isEditMode && <Button onClick={handleCancelEdit} variant="outlined">Huỷ</Button>}
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );

  const renderReadOnlyCard = (cateCar) => (
    <Card key={cateCar._id} variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent>
        <Typography variant="h6">{cateCar.name}</Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: "flex-end" }}>
        <IconButton size="small" onClick={() => handleEdit(cateCar)}><Edit fontSize="small" /></IconButton>
        <IconButton size="small" color="error" onClick={() => handleDelete(cateCar._id)}><Delete fontSize="small" /></IconButton>
      </CardActions>
    </Card>
  );

  const renderReadOnlyRow = (cateCar) => (
    <TableRow key={cateCar._id} hover>
      <TableCell>{cateCar.name}</TableCell>
      <TableCell align="right">
        <IconButton onClick={() => handleEdit(cateCar)}><Edit fontSize="small" /></IconButton>
        <IconButton onClick={() => handleDelete(cateCar._id)}><Delete fontSize="small" /></IconButton>
      </TableCell>
    </TableRow>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 8, mb: 4, ml: { xs: 0, md: '370px' }, width: { xs: '100%', md: '100%' } }}>
      <Typography variant="h5" align="center" sx={{ fontWeight: "bold", color: "primary.main", mb: 3 }}>
        Quản lý Danh mục xe
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Tìm kiếm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} size="small" InputProps={{ startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>) }}/>
        </Grid>
      </Grid>

      {renderForm()}

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
      ) : filteredCateCars.length === 0 ? (
        <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
          {cateCars.length > 0 ? "Không tìm thấy danh mục." : "Chưa có danh mục nào."}
        </Typography>
      ) : isMobile ? (
        <Stack spacing={2}>
          {filteredCateCars.map(renderReadOnlyCard)}
        </Stack>
      ) : (
        <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ backgroundColor: 'grey.50' }}>
              <TableRow>
                <TableCell>Tên danh mục</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCateCars.map(renderReadOnlyRow)}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}

export default CateCarManager;
