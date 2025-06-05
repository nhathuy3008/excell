import React, { useEffect, useState } from "react";
import {
  TextField, Button, Dialog, DialogActions, DialogContent,
  DialogTitle, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Select, MenuItem, Typography,
  Box, Grid, Alert // Added Alert
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
  const [searchTerm, setSearchTerm] = useState(""); // Thêm state cho tìm kiếm

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
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setFeedback({ type: 'error', message: 'Không thể tải danh sách sản phẩm.' });
    }
  };

  const fetchUnits = async () => {
    try {
      const res = await getUnits();
      setUnits(res.data);
    } catch (error) {
      console.error("Error fetching units:", error);
      // Potentially set feedback for units loading failure as well
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
    setFeedback({ type: '', message: '' }); // Clear previous feedback
    if (!form.code || !form.price) {
        setFeedback({ type: 'warning', message: 'Mã hàng và Giá là bắt buộc.'});
        return;
    }
    const productData = {
      ...form,
      specs: form.specs.filter((s) => s && s.trim() !== ""),
      price: parseFloat(form.price) || 0, 
      tax: parseFloat(form.tax) || 0 
    };

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
    }
  };

  const handleDelete = async (id) => {
    // Consider adding a confirmation dialog (e.g., using a separate state for confirmation dialog)
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
    setOpen(false);
    setEditingProduct(null);
    setForm(initialFormState);
    // Do not clear global feedback on close, user might want to see it
  };

  // Lọc sản phẩm dựa trên searchTerm
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
        <Alert severity={feedback.type} sx={{ mb: 2 }} onClose={() => setFeedback({ type: '', message: ''})}>{feedback.message}</Alert>
      )}

      {/* Thêm trường tìm kiếm */}
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
            {filteredProducts.map((p) => ( // Sử dụng filteredProducts thay vì products
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
                <TableCell align="center" sx={{ py: 1, px: 2 }}>{p.tax}%</TableCell>
                <TableCell align="center" sx={{ py: 1, px: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5}}>
                    <IconButton color="primary" onClick={() => handleEdit(p)} size="small" title="Chỉnh sửa">
                      <Edit fontSize="small"/>
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(p._id)} size="small" title="Xoá">
                      <Delete fontSize="small"/>
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
             {filteredProducts.length === 0 && ( // Sử dụng filteredProducts ở đây
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    {searchTerm ? "Không tìm thấy sản phẩm nào khớp với mã bạn nhập." : "Chưa có sản phẩm nào. Vui lòng thêm mới."}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ pb: 2, pt: 2.5, fontWeight: 'bold', borderBottom: '1px solid', borderColor: 'divider' }}>
            {editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
            <IconButton
                aria-label="close"
                onClick={handleClose}
                sx={{
                    position: 'absolute',
                    right: 12,
                    top: 12,
                    color: (theme) => theme.palette.grey[500],
                }}
            >
                <Clear />
            </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: '20px !important', pb: 1 }}> 
          {feedback.message && open && (
             <Alert severity={feedback.type} sx={{ mb: 2 }} onClose={() => setFeedback({ type: '', message: ''})}>{feedback.message}</Alert>
          )}
          <Grid container spacing={2.5} sx={{mt: 0}}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField fullWidth label="Mã hàng *" name="code" value={form.code} onChange={handleChange} required size="small" />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField fullWidth label="Thương hiệu" name="brand" value={form.brand} onChange={handleChange} size="small" />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField fullWidth label="Xuất xứ" name="origin" value={form.origin} onChange={handleChange} size="small" />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Select fullWidth name="unit" value={form.unit} onChange={handleChange} displayEmpty size="small" required>
                <MenuItem value=""><em>Chọn đơn vị *</em></MenuItem>
                {units.map((u) => (
                  <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField fullWidth label="Giá *" name="price" type="number" value={form.price} onChange={handleChange} required size="small" InputProps={{ inputProps: { min: 0 } }} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField fullWidth label="Thuế (%)" name="tax" type="number" value={form.tax} onChange={handleChange} size="small" InputProps={{ inputProps: { min: 0, max: 100 } }} />
            </Grid>
            
            <Grid item xs={12}>
              {form.specs.map((spec, index) => (
                <Box key={index} sx={{ display: "flex", gap: 1, mb: 1.5, alignItems: 'center' }}> 
                  <TextField
                    fullWidth
                    label={`Thông số #${index + 1}`}
                    value={spec}
                    onChange={(e) => handleChangeSpec(index, e.target.value)}
                    size="small"
                  />
                  {form.specs.length > 1 ? (
                    <IconButton onClick={() => handleRemoveSpecField(index)} color="error" size="small" title="Xoá thông số">
                      <RemoveCircleOutline />
                    </IconButton>
                  ) : (
                    <IconButton size="small" disabled sx={{ visibility: 'hidden' }}><RemoveCircleOutline /></IconButton> // Placeholder for alignment
                  )}
                </Box>
              ))}
              <Button onClick={handleAddSpecField} variant="outlined" size="small" startIcon={<AddCircleOutline />} sx={{ textTransform: 'none' }}>
                Thêm thông số
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px:3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}> 
          <Button onClick={handleClose} color="inherit" variant="outlined" sx={{ textTransform: 'none' }}>Huỷ</Button> 
          <Button onClick={handleSubmit} variant="contained" color="primary" sx={{ textTransform: 'none' }}>
            {editingProduct ? "Lưu thay đổi" : "Thêm sản phẩm"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductManager;
