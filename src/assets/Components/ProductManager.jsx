import React, { useEffect, useState } from "react";
import {
  TextField, Button, Dialog, DialogActions, DialogContent,
  DialogTitle, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Select, MenuItem, Typography
} from "@mui/material";
import { Edit, Delete, RemoveCircleOutline } from "@mui/icons-material";
import {
  getProducts, createProduct, deleteProduct, updateProduct
} from "../api/productApi";
import { getUnits } from "../api/unitApi";

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [units, setUnits] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [form, setForm] = useState({
    code: "",
    brand: "",
    origin: "",
    specs: [""], // mỗi thông số là 1 input
    unit: "",
    price: "",
    tax: ""
  });

  useEffect(() => {
    fetchProducts();
    fetchUnits();
  }, []);

  const fetchProducts = async () => {
    const res = await getProducts();
    setProducts(res.data);
  };

  const fetchUnits = async () => {
    const res = await getUnits();
    setUnits(res.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
    setForm({ ...form, specs: newSpecs });
  };

  const handleSubmit = async () => {
    const productData = {
      ...form,
      specs: form.specs.filter((s) => s.trim() !== ""),
      price: parseFloat(form.price),
      tax: parseFloat(form.tax)
    };

    if (editingProduct) {
      await updateProduct(editingProduct._id, productData);
    } else {
      await createProduct(productData);
    }

    handleClose();
    fetchProducts();
  };

  const handleDelete = async (id) => {
    await deleteProduct(id);
    fetchProducts();
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setForm({
      code: product.code,
      brand: product.brand || "",
      origin: product.origin || "",
      specs: product.specs || [""],
      unit: product.unit?._id || "",
      price: product.price,
      tax: product.tax
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingProduct(null);
    setForm({
      code: "",
      brand: "",
      origin: "",
      specs: [""],
      unit: "",
      price: "",
      tax: ""
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Quản lý Sản phẩm</h2>
      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        Thêm sản phẩm
      </Button>

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã</TableCell>
              <TableCell>Thương hiệu</TableCell>
              <TableCell>Xuất xứ</TableCell>
              <TableCell>Thông số</TableCell>
              <TableCell>Đơn vị</TableCell>
              <TableCell>Giá</TableCell>
              <TableCell>Thuế (%)</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p._id}>
                <TableCell>{p.code}</TableCell>
                <TableCell>{p.brand}</TableCell>
                <TableCell>{p.origin}</TableCell>
                <TableCell>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {p.specs.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell>{p.unit?.name}</TableCell>
                <TableCell>{p.price.toLocaleString()}₫</TableCell>
                <TableCell>{p.tax}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleEdit(p)}>
                    <Edit />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(p._id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField label="Mã hàng" name="code" value={form.code} onChange={handleChange} required />
          <TextField label="Thương hiệu" name="brand" value={form.brand} onChange={handleChange} />
          <TextField label="Xuất xứ" name="origin" value={form.origin} onChange={handleChange} />
          
          <Typography variant="subtitle2" sx={{ mt: 1 }}>Thông số kỹ thuật</Typography>
          {form.specs.map((spec, index) => (
            <div key={index} style={{ display: "flex", gap: 8 }}>
              <TextField
                fullWidth
                label={`Thông số #${index + 1}`}
                value={spec}
                onChange={(e) => handleChangeSpec(index, e.target.value)}
              />
              {form.specs.length > 1 && (
                <IconButton onClick={() => handleRemoveSpecField(index)} color="error">
                  <RemoveCircleOutline />
                </IconButton>
              )}
            </div>
          ))}
          <Button onClick={handleAddSpecField} variant="outlined" size="small">
            Thêm thông số
          </Button>

          <Select name="unit" value={form.unit} onChange={handleChange} displayEmpty>
            <MenuItem value=""><em>Chọn đơn vị</em></MenuItem>
            {units.map((u) => (
              <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>
            ))}
          </Select>
          <TextField label="Giá" name="price" type="number" value={form.price} onChange={handleChange} required />
          <TextField label="Thuế (%)" name="tax" type="number" value={form.tax} onChange={handleChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Huỷ</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingProduct ? "Lưu" : "Thêm"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProductManager;
