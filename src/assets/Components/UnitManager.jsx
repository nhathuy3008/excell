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
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  CardActions,
  Switch,
  Stack,
  Container,
  Grid,
} from "@mui/material";
import {
  Edit,
  Delete,
  Save,
  Cancel,
  AddCircleOutline,
} from "@mui/icons-material";

export default function UnitManager() {
  const [units, setUnits] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
      await createUnit(name.trim());
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
      await updateUnit(editingId, editingName.trim());
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
    <Container 
      maxWidth="lg" 
      sx={{ 
        mt: 10, 
        mb: 4,
        ml: { xs: 0, md: '370px' },
        width: { xs: '100%', md: '100%' }
      }}
    >
      <Typography
        variant="h5"
        align="center"
        sx={{ 
          fontWeight: "bold", 
          color: "primary.main", 
          mb: { xs: 2, sm: 3 },
          fontSize: { xs: '1.25rem', sm: '1.5rem' }
        }}
      >
        Quản lý Đơn vị tính
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Grid container spacing={2} component="form" onSubmit={handleCreate} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={8}>
          <TextField
            fullWidth
            label="Tên đơn vị mới"
            value={name}
            onChange={(e) => setName(e.target.value)}
            size="small"
            disabled={loading}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                height: { xs: '40px', sm: '48px' }
              }
            }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            type="submit"
            variant="contained"
            startIcon={<AddCircleOutline />}
            disabled={loading}
            fullWidth
            sx={{ 
              height: { xs: '40px', sm: '48px' },
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            Thêm mới
          </Button>
        </Grid>
      </Grid>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={4}>
          <CircularProgress />
        </Box>
      ) : units.length === 0 ? (
        <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
          Chưa có đơn vị nào.
        </Typography>
      ) : isMobile ? (
        <Stack spacing={2}>
          {units.map((unit) => (
            <Card key={unit._id} variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent sx={{ pb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Đơn vị tính
                </Typography>
                {editingId === unit._id ? (
                  <TextField
                    fullWidth
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    size="small"
                    autoFocus
                    disabled={loading}
                    sx={{ mt: 1 }}
                  />
                ) : (
                  <Typography variant="body1" sx={{ mt: 1, fontWeight: 500 }}>
                    {unit.name}
                  </Typography>
                )}
              </CardContent>
              <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
                <Stack direction="row" spacing={1}>
                  {editingId === unit._id ? (
                    <>
                      <IconButton size="small" color="success" onClick={handleUpdate} disabled={loading}>
                        <Save fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={handleCancelEdit} disabled={loading}>
                        <Cancel fontSize="small" />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <IconButton size="small" onClick={() => handleEdit(unit)} disabled={loading}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(unit._id)} disabled={loading}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </>
                  )}
                </Stack>
              </CardActions>
            </Card>
          ))}
        </Stack>
      ) : (
        <Paper 
          elevation={2} 
          sx={{ 
            overflowX: "auto",
            borderRadius: 2,
            '& .MuiTableCell-root': {
              py: { xs: 1, sm: 1.5 }
            }
          }}
        >
          <Table>
            <TableHead sx={{ backgroundColor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Tên đơn vị</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {units.map((unit) => (
                <TableRow key={unit._id} hover>
                  <TableCell>
                    {editingId === unit._id ? (
                      <TextField
                        fullWidth
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        size="small"
                        autoFocus
                        disabled={loading}
                        variant="standard"
                      />
                    ) : (
                      <Typography sx={{ fontWeight: 500 }}>{unit.name}</Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      {editingId === unit._id ? (
                        <>
                          <IconButton size="small" color="success" onClick={handleUpdate} disabled={loading}>
                            <Save fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={handleCancelEdit} disabled={loading}>
                            <Cancel fontSize="small" />
                          </IconButton>
                        </>
                      ) : (
                        <>
                          <IconButton size="small" onClick={() => handleEdit(unit)} disabled={loading}>
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDelete(unit._id)} disabled={loading}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Container>
  );
}
