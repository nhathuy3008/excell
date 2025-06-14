import React, { useEffect, useState, useCallback } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api/productApi";
import { getUnits } from "../api/unitApi";
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
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  CardActions,
  Stack,
  Container,
  Grid,
  InputAdornment,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Edit,
  Delete,
  Save,
  Cancel,
  AddCircleOutline,
  Search,
  RemoveCircleOutline,
} from "@mui/icons-material";

const initialProductState = {
  code: "",
  brand: "",
  origin: "",
  specs: [""],
  unit: "",
  price: "",
  tax: "",
};

export default function ProductManager() {
  const [products, setProducts] = useState([]);
  const [units, setUnits] = useState([]);
  const [formData, setFormData] = useState(initialProductState);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsRes, unitsRes] = await Promise.all([getProducts(), getUnits()]);
      setProducts(productsRes.data);
      setUnits(unitsRes.data);
    } catch (err) {
      setError("Lỗi tải dữ liệu.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSpecChange = (index, value) => {
    setFormData((prev) => {
      const newSpecs = [...prev.specs];
      newSpecs[index] = value;
      return { ...prev, specs: newSpecs };
    });
  };

  const handleAddSpec = () => {
    setFormData((prev) => ({ ...prev, specs: [...prev.specs, ""] }));
  };

  const handleRemoveSpec = (index) => {
    setFormData((prev) => ({
      ...prev,
      specs: prev.specs.length > 1 ? prev.specs.filter((_, i) => i !== index) : [""],
    }));
  };

  const handleEdit = (product) => {
    setIsEditMode(true);
    setFormData({ ...product, unit: product.unit?._id || "" });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setFormData(initialProductState);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.price) {
      setError("Mã sản phẩm và Giá là bắt buộc.");
      return;
    }
    setLoading(true);
    try {
      if (isEditMode) {
        await updateProduct(formData._id, formData);
      } else {
        await createProduct(formData);
      }
      handleCancelEdit();
      await fetchAllData();
    } catch (err) {
      setError(isEditMode ? "Lỗi cập nhật sản phẩm." : "Lỗi thêm sản phẩm mới.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xoá sản phẩm này?")) {
      setLoading(true);
      try {
        await deleteProduct(id);
        if (isEditMode && formData._id === id) {
          handleCancelEdit();
        }
        await fetchAllData();
      } catch (err) {
        setError("Lỗi xoá sản phẩm.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const renderProductForm = () => (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 2, mb: 4, border: (theme) => `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {isEditMode ? "Chỉnh sửa Sản phẩm" : "Thêm Sản phẩm mới"}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <TextField fullWidth label="Mã sản phẩm *" name="code" value={formData.code} onChange={handleFormChange} size="small" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField fullWidth label="Thương hiệu" name="brand" value={formData.brand} onChange={handleFormChange} size="small" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField fullWidth label="Xuất xứ" name="origin" value={formData.origin} onChange={handleFormChange} size="small" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField fullWidth label="Giá *" name="price" type="number" value={formData.price} onChange={handleFormChange} size="small" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField fullWidth label="Thuế (%)" name="tax" type="number" value={formData.tax} onChange={handleFormChange} size="small" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Select fullWidth label="Đơn vị" name="unit" value={formData.unit} onChange={handleFormChange} size="small" displayEmpty>
            <MenuItem value=""><em>Chọn đơn vị</em></MenuItem>
            {units.map((u) => (<MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>))}
          </Select>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Thông số kỹ thuật</Typography>
          {formData.specs.map((spec, index) => (
            <Stack direction="row" spacing={1} key={index} sx={{ mb: 1 }}>
              <TextField fullWidth value={spec} onChange={(e) => handleSpecChange(index, e.target.value)} size="small" placeholder={`Thông số ${index + 1}`} />
              <IconButton onClick={() => handleRemoveSpec(index)} size="small"><RemoveCircleOutline /></IconButton>
            </Stack>
          ))}
          <Button onClick={handleAddSpec} size="small">Thêm thông số</Button>
        </Grid>
        <Grid item xs={12}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button type="submit" variant="contained" startIcon={isEditMode ? <Save /> : <AddCircleOutline />}>
              {isEditMode ? "Lưu" : "Thêm mới"}
            </Button>
            {isEditMode && <Button onClick={handleCancelEdit} variant="outlined">Huỷ</Button>}
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );

  const renderReadOnlyCard = (product) => (
    <Card key={product._id} variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent sx={{ pb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{product.code}</Typography>
            <Typography variant="body2" color="text.secondary">{product.brand || '-'}</Typography>
          </Box>
          <Typography variant="h6" color="primary.main">{product.price?.toLocaleString()}₫</Typography>
        </Stack>
        <Grid container spacing={1} sx={{ mt: 2 }}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">Xuất xứ</Typography>
            <Typography variant="body2">{product.origin || '-'}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">Đơn vị</Typography>
            <Typography variant="body2">{product.unit?.name || '-'}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary">Thuế</Typography>
            <Typography variant="body2">{product.tax ?? 0}%</Typography>
          </Grid>
          {product.specs && product.specs.length > 0 && product.specs.some(s => s.trim() !== '') && (
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">Thông số</Typography>
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                {product.specs.map((spec, i) => (
                  spec && <Typography component="li" variant="body2" key={i}>{spec}</Typography>
                ))}
              </Box>
            </Grid>
          )}
        </Grid>
      </CardContent>
      <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 2 }}>
        <IconButton size="small" onClick={() => handleEdit(product)}><Edit fontSize="small" /></IconButton>
        <IconButton size="small" color="error" onClick={() => handleDelete(product._id)}><Delete fontSize="small" /></IconButton>
      </CardActions>
    </Card>
  );

  const renderReadOnlyRow = (product) => (
    <TableRow key={product._id} hover>
      <TableCell>{product.code}</TableCell>
      <TableCell>{product.brand}</TableCell>
      <TableCell>{product.origin}</TableCell>
      <TableCell>{product.unit?.name}</TableCell>
      <TableCell>{product.price?.toLocaleString()}</TableCell>
      <TableCell>
        {product.specs && product.specs.length > 0 && product.specs.some(s => s.trim() !== '') ? (
          <Box component="ul" sx={{ m: 0, p: 0, pl: 2, listStylePosition: 'inside' }}>
            {product.specs.map((spec, i) => (
              spec && <Typography component="li" variant="body2" key={i} sx={{ display: 'list-item' }}>{spec}</Typography>
            ))}
          </Box>
        ) : '-'}
      </TableCell>
      <TableCell align="right">
        <IconButton onClick={() => handleEdit(product)}><Edit fontSize="small" /></IconButton>
        <IconButton onClick={() => handleDelete(product._id)}><Delete fontSize="small" /></IconButton>
      </TableCell>
    </TableRow>
  );

  return (
    <Container maxWidth="1300px" sx={{ mt: 10, mb: 4, ml: { xs: 0, md: 0 }, width: { xs: '100%', md: '100%' } }}>
      <Typography variant="h5" align="center" sx={{ fontWeight: "bold", color: "primary.main", mb: 3 }}>
        Quản lý Sản phẩm
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Tìm kiếm sản phẩm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} size="small" InputProps={{ startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>) }}/>
        </Grid>
      </Grid>

      {renderProductForm()}

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
      ) : filteredProducts.length === 0 ? (
        <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
          {products.length > 0 ? "Không tìm thấy sản phẩm." : "Chưa có sản phẩm nào."}
        </Typography>
      ) : isMobile ? (
        <Stack spacing={2}>
          {filteredProducts.map((p) => renderReadOnlyCard(p))}
        </Stack>
      ) : (
        <Paper elevation={2} sx={{ overflowX: "auto", borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ backgroundColor: 'grey.50' }}>
              <TableRow>
                <TableCell>Mã</TableCell>
                <TableCell>Thương hiệu</TableCell>
                <TableCell>Xuất xứ</TableCell>
                <TableCell>Đơn vị</TableCell>
                <TableCell>Giá</TableCell>
                <TableCell>Thông số</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map((p) => renderReadOnlyRow(p))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Container>
  );
}
