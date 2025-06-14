import React, { useEffect, useState } from "react";
import {
  getStatuses,
  createStatus,
  deleteStatus,
  updateStatus,
} from "../api/statusApi";
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
} from "@mui/material";
import {
  Edit,
  Delete,
  Save,
  Cancel,
  AddCircleOutline,
} from "@mui/icons-material";

export default function StatusManager() {
  const [statuses, setStatuses] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchStatuses = async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await getStatuses();
      setStatuses(res.data);
    } catch (err) {
      setError("Lỗi tải danh sách trạng thái.");
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
      await createStatus(name.trim());
      setName("");
      await fetchStatuses();
    } catch (err) {
      setError("Lỗi thêm trạng thái mới.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xoá trạng thái này?")) {
      try {
        setError(null);
        setLoading(true);
        await deleteStatus(id);
        await fetchStatuses();
      } catch (err) {
        setError("Lỗi xoá trạng thái.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (status) => {
    setError(null);
    setEditingId(status._id);
    setEditingName(status.name);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingName.trim()) return;
    try {
      setError(null);
      setLoading(true);
      await updateStatus(editingId, editingName.trim());
      setEditingId(null);
      setEditingName("");
      await fetchStatuses();
    } catch (err) {
      setError("Lỗi cập nhật trạng thái.");
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
        ml: { xs: 0, md: '400px' },
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
        Quản lý Trạng thái
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
            label="Tên trạng thái mới"
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
      ) : statuses.length === 0 ? (
        <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
          Chưa có trạng thái nào.
        </Typography>
      ) : isMobile ? (
        <Stack spacing={2}>
          {statuses.map((status) => (
            <Card key={status._id} variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent sx={{ pb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Trạng thái
                </Typography>
                {editingId === status._id ? (
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
                  <TextField
                    fullWidth
                    value={status.name}
                    variant="standard"
                    sx={{
                      mt: 1,
                      '& .MuiInput-input': {
                        fontWeight: 500,
                        cursor: 'default',
                      },
                    }}
                    InputProps={{
                      readOnly: true,
                      disableUnderline: true,
                    }}
                  />
                )}
              </CardContent>
              <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
                <Stack direction="row" spacing={1}>
                  {editingId === status._id ? (
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
                      <IconButton size="small" onClick={() => handleEdit(status)} disabled={loading}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(status._id)} disabled={loading}>
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
                <TableCell sx={{ fontWeight: 600 }}>Tên trạng thái</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {statuses.map((status) => (
                <TableRow key={status._id} hover>
                  <TableCell>
                    {editingId === status._id ? (
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
                      <TextField
                        fullWidth
                        value={status.name}
                        variant="standard"
                        InputProps={{
                          readOnly: true,
                          disableUnderline: true,
                        }}
                        sx={{
                          '& .MuiInput-input': {
                            fontWeight: 500,
                            cursor: 'default',
                          },
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      {editingId === status._id ? (
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
                          <IconButton size="small" onClick={() => handleEdit(status)} disabled={loading}>
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDelete(status._id)} disabled={loading}>
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

