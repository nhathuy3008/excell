import React, { useEffect, useState } from "react";
import {
  TextField, Button, Dialog, DialogActions, DialogContent,
  DialogTitle, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Select, MenuItem, Typography,
  Box, Grid, Alert, CircularProgress
} from "@mui/material";
import { Edit, Delete, RemoveCircleOutline, AddCircleOutline, Clear } from "@mui/icons-material";
import {
  getProducts, createProduct, deleteProduct, updateProduct
} from "../api/productApi";
import { getUnits } from "../api/unitApi";

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [units, setUnits] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);         // Load danh sách sản phẩm
  const [loadingSubmit, setLoadingSubmit] = useState(false); // Load submit form

  const initialFormState = {
    code: "",
    brand: "",
    origin: "",
    specs: [""],
    unit: "",
    price: "",
    tax: ""
  };

  const [form, setForm] = useState(initialFormState);

  useEffect(() => {
    fetchProducts();
    fetchUnits();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setFeedback({ type: 'error', message: 'Không thể tải danh sách sản phẩm.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchUnits = async () => {
    try {
      const res = await getUnits();
      setUnits(res.data);
    } catch (error) {
      console.error("Error fetching units:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleChangeSpec = (index, value) => {
    const newSpecs = [...form.specs];
    newSpecs[index] = value;
    setForm({ ...form, specs: newSpecs });
  };

  const handleAddSpecField = () => {
    setForm({ ...form, specs: [...form.specs, ""] });
  };

  const handleRemoveSpecField = (index) => {
    const newSpecs = form.specs.filter((_, i) => i !== index);
    setForm({ ...form, specs: newSpecs.length > 0 ? newSpecs : [""] });
  };

  const handleSubmit = async () => {
    setFeedback({ type: '', message: '' });
    if (!form.code || !form.price) {
      setFeedback({ type: 'warning', message: 'Mã hàng và Giá là bắt buộc.' });
      return;
    }

    const productData = {
      ...form,
      specs: form.specs.filter((s) => s && s.trim() !== ""),
      price: parseFloat(form.price) || 0,
      tax: parseFloat(form.tax) || 0
    };

    setLoadingSubmit(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, productData);
        setFeedback({ type: 'success', message: 'Cập nhật sản phẩm thành công!' });
      } else {
        await createProduct(productData);
        setFeedback({ type: 'success', message: 'Thêm sản phẩm thành công!' });
      }
      handleClose();
      fetchProducts();
    } catch (error) {
      console.error("Error submitting product:", error);
      setFeedback({ type: 'error', message: editingProduct ? 'Lỗi khi cập nhật sản phẩm.' : 'Lỗi khi thêm sản phẩm.' });
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      fetchProducts();
      setFeedback({ type: 'success', message: 'Xoá sản phẩm thành công!' });
    } catch (error) {
      console.error("Error deleting product:", error);
      setFeedback({ type: 'error', message: 'Lỗi khi xoá sản phẩm.' });
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setForm({
      code: product.code,
      brand: product.brand || "",
      origin: product.origin || "",
      specs: product.specs && product.specs.length > 0 ? product.specs : [""],
      unit: product.unit?._id || "",
      price: product.price !== undefined ? product.price : "",
      tax: product.tax !== undefined ? product.tax : ""
    });
    setOpen(true);
    setFeedback({ type: '', message: '' });
  };

  const handleOpenAddDialog = () => {
    setEditingProduct(null);
    setForm(initialFormState);
    setOpen(true);
    setFeedback({ type: '', message: '' });
  };

  const handleClose = () => {
    if (loadingSubmit) return; // Không cho đóng dialog khi đang submit
    setOpen(false);
    setEditingProduct(null);
    setForm(initialFormState);
  };

  const filteredProducts = products.filter(product =>
    product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 3.5, mt: 8, backgroundColor: 'background.paper', borderRadius: 3 }}>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Grid item>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Quản lý Sản phẩm
          </Typography>
        </Grid>
        <Grid item>
          <Button variant="contained" color="primary" onClick={handleOpenAddDialog} startIcon={<AddCircleOutline />} sx={{ py: 1.2, px: 2.5 }}>
            Thêm sản phẩm
          </Button>
        </Grid>
      </Grid>

      {feedback.message && !open && (
        <Alert severity={feedback.type} sx={{ mb: 2 }} onClose={() => setFeedback({ type: '', message: '' })}>{feedback.message}</Alert>
      )}

      <TextField
        fullWidth
        label="Tìm kiếm theo mã sản phẩm"
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        size="small"
      />

      <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table sx={{ minWidth: 750 }}>
          <TableHead sx={{ backgroundColor: 'grey.100' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: '600', py: 1.5, px: 2 }}>Mã</TableCell>
              <TableCell sx={{ fontWeight: '600', py: 1.5, px: 2 }}>Thương hiệu</TableCell>
              <TableCell sx={{ fontWeight: '600', py: 1.5, px: 2 }}>Xuất xứ</TableCell>
              <TableCell sx={{ fontWeight: '600', py: 1.5, px: 2 }}>Thông số</TableCell>
              <TableCell sx={{ fontWeight: '600', py: 1.5, px: 2 }}>Đơn vị</TableCell>
              <TableCell sx={{ fontWeight: '600', py: 1.5, px: 2 }} align="right">Giá</TableCell>
              <TableCell sx={{ fontWeight: '600', py: 1.5, px: 2 }} align="center">Thuế (%)</TableCell>
              <TableCell sx={{ fontWeight: '600', py: 1.5, px: 2 }} align="center">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    {searchTerm ? "Không tìm thấy sản phẩm nào khớp với mã bạn nhập." : "Chưa có sản phẩm nào. Vui lòng thêm mới."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((p) => (
                <TableRow key={p._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ py: 1, px: 2 }}>{p.code}</TableCell>
                  <TableCell sx={{ py: 1, px: 2 }}>{p.brand || '-'}</TableCell>
                  <TableCell sx={{ py: 1, px: 2 }}>{p.origin || '-'}</TableCell>
                  <TableCell sx={{ py: 1, px: 2 }}>
                    {p.specs && p.specs.length > 0 ? (
                      <ul style={{ margin: 0, paddingLeft: 16, listStyleType: 'disc' }}>
                        {p.specs.map((s, i) => (
                          <li key={i} style={{ whiteSpace: 'wrap' }}>{s}</li>
                        ))}
                      </ul>
                    ) : (
                      <em>-</em>
                    )}
                  </TableCell>
                  <TableCell sx={{ py: 1, px: 2 }}>{p.unit?.name || '-'}</TableCell>
                  <TableCell align="right" sx={{ py: 1, px: 2 }}>{p.price.toLocaleString()}₫</TableCell>
                  <TableCell align="center" sx={{ py: 1, px: 2 }}>{p.tax ?? 0}</TableCell>
                  <TableCell align="center" sx={{ py: 1, px: 2 }}>
                    <IconButton size="small" color="primary" onClick={() => handleEdit(p)} title="Sửa">
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(p._id)} title="Xóa">
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm"}</DialogTitle>
        <DialogContent dividers>
          {feedback.message && (
            <Alert severity={feedback.type} sx={{ mb: 2 }}>
              {feedback.message}
            </Alert>
          )}

          <TextField
            label="Mã sản phẩm *"
            name="code"
            fullWidth
            margin="normal"
            size="small"
            value={form.code}
            onChange={handleChange}
            disabled={loadingSubmit}
          />
          <TextField
            label="Thương hiệu"
            name="brand"
            fullWidth
            margin="normal"
            size="small"
            value={form.brand}
            onChange={handleChange}
            disabled={loadingSubmit}
          />
          <TextField
            label="Xuất xứ"
            name="origin"
            fullWidth
            margin="normal"
            size="small"
            value={form.origin}
            onChange={handleChange}
            disabled={loadingSubmit}
          />

          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Thông số kỹ thuật
          </Typography>
          {form.specs.map((spec, idx) => (
            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TextField
                size="small"
                fullWidth
                value={spec}
                onChange={(e) => handleChangeSpec(idx, e.target.value)}
                disabled={loadingSubmit}
                placeholder="Thông số"
              />
              <IconButton
                size="small"
                color="error"
                onClick={() => handleRemoveSpecField(idx)}
                disabled={loadingSubmit || form.specs.length === 1}
                sx={{ ml: 1 }}
              >
                <RemoveCircleOutline fontSize="small" />
              </IconButton>
            </Box>
          ))}
          <Button
            size="small"
            startIcon={<AddCircleOutline />}
            onClick={handleAddSpecField}
            disabled={loadingSubmit}
            sx={{ mb: 2 }}
          >
            Thêm thông số
          </Button>

          <Select
            fullWidth
            size="small"
            name="unit"
            value={form.unit}
            onChange={handleChange}
            displayEmpty
            disabled={loadingSubmit}
            sx={{ mb: 2 }}
          >
            <MenuItem value="">
              <em>Chọn đơn vị</em>
            </MenuItem>
            {units.map((unit) => (
              <MenuItem key={unit._id} value={unit._id}>
                {unit.name}
              </MenuItem>
            ))}
          </Select>

          <TextField
            label="Giá"
            name="price"
            fullWidth
            margin="normal"
            size="small"
            type="number"
            value={form.price}
            onChange={handleChange}
            disabled={loadingSubmit}
          />
          <TextField
            label="Thuế (%)"
            name="tax"
            fullWidth
            margin="normal"
            size="small"
            type="number"
            value={form.tax}
            onChange={handleChange}
            disabled={loadingSubmit}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loadingSubmit}>Đóng</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loadingSubmit}
            startIcon={loadingSubmit ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {editingProduct ? "Cập nhật" : "Thêm"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductManager;
