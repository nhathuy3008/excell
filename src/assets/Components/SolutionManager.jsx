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
} from "@mui/material";
import {
  Edit,
  Delete,
  Save,
  Cancel,
  AddCircleOutline,
  Search,
} from "@mui/icons-material";

export default function SolutionManager() {
  const [solutions, setSolutions] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    fetchSolutions();
  }, []);

  const fetchSolutions = async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await getSolutions();
      setSolutions(res.data);
    } catch (err) {
      setError("Lỗi tải danh sách giải pháp.");
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
      await createSolution({ name: name.trim() });
      setName("");
      await fetchSolutions();
    } catch (err) {
      setError("Lỗi thêm giải pháp mới.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xoá giải pháp này?")) {
      try {
        setError(null);
        setLoading(true);
        await deleteSolution(id);
        await fetchSolutions();
      } catch (err) {
        setError("Lỗi xoá giải pháp.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (solution) => {
    setError(null);
    setEditingId(solution._id);
    setEditingName(solution.name);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingName.trim()) return;
    try {
      setError(null);
      setLoading(true);
      await updateSolution(editingId, { name: editingName.trim() });
      setEditingId(null);
      setEditingName("");
      await fetchSolutions();
    } catch (err) {
      setError("Lỗi cập nhật giải pháp.");
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

  const filteredSolutions = solutions.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container
      maxWidth="lg"
      sx={{
        mt: 10,
        mb: 4,
        ml: { xs: 0, md: "350px" },
        width: { xs: "100%", md: "100%" },
      }}
    >
      <Typography
        variant="h5"
        align="center"
        sx={{
          fontWeight: "bold",
          color: "primary.main",
          mb: { xs: 2, sm: 3 },
          fontSize: { xs: "1.25rem", sm: "1.5rem" },
        }}
      >
        Quản lý Giải pháp
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Tìm kiếm giải pháp"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} component="form" onSubmit={handleCreate} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={8}>
          <TextField
            fullWidth
            label="Tên giải pháp mới"
            value={name}
            onChange={(e) => setName(e.target.value)}
            size="small"
            disabled={loading}
            sx={{
              "& .MuiOutlinedInput-root": {
                height: { xs: "40px", sm: "48px" },
              },
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
              height: { xs: "40px", sm: "48px" },
              fontSize: { xs: "0.875rem", sm: "1rem" },
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
      ) : filteredSolutions.length === 0 ? (
        <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
          {solutions.length > 0
            ? "Không tìm thấy giải pháp phù hợp."
            : "Chưa có giải pháp nào."}
        </Typography>
      ) : isMobile ? (
        <Stack spacing={2}>
          {filteredSolutions.map((solution) => (
            <Card key={solution._id} variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent sx={{ pb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Giải pháp
                </Typography>
                {editingId === solution._id ? (
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
                    value={solution.name}
                    variant="standard"
                    sx={{
                      mt: 1,
                      "& .MuiInput-input": {
                        fontWeight: 500,
                        cursor: "default",
                      },
                    }}
                    InputProps={{
                      readOnly: true,
                      disableUnderline: true,
                    }}
                  />
                )}
              </CardContent>
              <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 2 }}>
                <Stack direction="row" spacing={1}>
                  {editingId === solution._id ? (
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
                      <IconButton size="small" onClick={() => handleEdit(solution)} disabled={loading}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(solution._id)} disabled={loading}>
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
            "& .MuiTableCell-root": {
              py: { xs: 1, sm: 1.5 },
            },
          }}
        >
          <Table>
            <TableHead sx={{ backgroundColor: "grey.50" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Tên giải pháp</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Hành động
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSolutions.map((solution) => (
                <TableRow key={solution._id} hover>
                  <TableCell>
                    {editingId === solution._id ? (
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
                        value={solution.name}
                        variant="standard"
                        InputProps={{
                          readOnly: true,
                          disableUnderline: true,
                        }}
                        sx={{
                          "& .MuiInput-input": {
                            fontWeight: 500,
                            cursor: "default",
                          },
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      {editingId === solution._id ? (
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
                          <IconButton size="small" onClick={() => handleEdit(solution)} disabled={loading}>
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDelete(solution._id)} disabled={loading}>
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
