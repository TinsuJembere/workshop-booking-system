import React, { useEffect, useState, useContext } from "react";
import {
  Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Tooltip, CircularProgress, Alert, Grid
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import axios from "axios";
import { AuthContext } from "../utils/AuthContext";

const statusColors = {
  Active: "primary",
  Completed: "success",
  Draft: "warning"
};

const statusLabels = {
  Active: "Active",
  Completed: "Completed",
  Draft: "Draft"
};

const API_BASE = 'https://workshop-booking-system-1.onrender.com';

const Workshops = () => {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [form, setForm] = useState({ 
    title: "", 
    description: "", 
    instructor: "", 
    date: "", 
    maxCapacity: 1, 
    status: "Active",
    category: "",
    price: 0,
    image: ""
  });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const { getAuthHeader } = useContext(AuthContext);

  // Fetch workshops
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${API_BASE}/api/workshops`, { 
          headers: { 
            ...getAuthHeader(),
            'x-admin-panel': 'true'
          } 
        });
        setWorkshops(Array.isArray(res.data.workshops) ? res.data.workshops : []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load workshops.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Stats
  const totalWorkshops = Array.isArray(workshops) ? workshops.length : 0;
  const activeWorkshops = Array.isArray(workshops) ? workshops.filter(w => w.status === "Active").length : 0;
  const draftWorkshops = Array.isArray(workshops) ? workshops.filter(w => w.status === "Draft").length : 0;
  const timeSlotsAssigned = Array.isArray(workshops) ? workshops.reduce((sum, w) => sum + (w.timeSlots?.length || 0), 0) : 0;

  // Handlers
  const handleOpenModal = (mode, workshop = null) => {
    setModalMode(mode);
    setSelectedWorkshop(workshop);
    setForm(
      workshop
        ? { 
            ...workshop, 
            date: workshop.date ? workshop.date.split("T")[0] : "",
            description: workshop.description || "",
            instructor: workshop.instructor || "",
            category: workshop.category || "",
            price: workshop.price || 0,
            image: workshop.image || ""
          }
        : { 
            title: "", 
            description: "", 
            instructor: "", 
            date: "", 
            maxCapacity: 1, 
            status: "Active",
            category: "",
            price: 0,
            image: ""
          }
    );
    setImageFile(null);
    setOpenModal(true);
  };
  
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedWorkshop(null);
  };
  
  const handleFormChange = e => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setImageFile(files[0]);
      // Optionally, update form.image for preview
      setForm({ ...form, image: URL.createObjectURL(files[0]) });
    } else {
      setForm({ ...form, [name]: name === 'maxCapacity' || name === 'price' ? Number(value) : value });
    }
  };
  
  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'image') return; // handled by file
        formData.append(key, value);
      });
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (form.image && typeof form.image === 'string' && form.image.startsWith('/uploads/')) {
        formData.append('image', form.image);
      }
      if (modalMode === "add") {
        await axios.post(`${API_BASE}/api/workshops`, formData, { headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' } });
      } else if (modalMode === "edit" && selectedWorkshop) {
        await axios.put(`${API_BASE}/api/workshops/${selectedWorkshop.id}`, formData, { headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' } });
      }
      // Refresh
      const res = await axios.get(`${API_BASE}/api/workshops`, { 
        headers: { 
          ...getAuthHeader(),
          'x-admin-panel': 'true'
        } 
      });
      setWorkshops(Array.isArray(res.data.workshops) ? res.data.workshops : []);
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save workshop.");
    } finally {
      setSaving(false);
    }
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this workshop?")) return;
    setError("");
    try {
      await axios.delete(`${API_BASE}/api/workshops/${id}`, { headers: { ...getAuthHeader() } });
      // Refresh
      const res = await axios.get(`${API_BASE}/api/workshops`, { 
        headers: { 
          ...getAuthHeader(),
          'x-admin-panel': 'true'
        } 
      });
      setWorkshops(Array.isArray(res.data.workshops) ? res.data.workshops : []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to delete workshop.");
    }
  };
  
  const handleManageTime = (id) => {
    window.location.href = `/timeslots?workshopId=${id}`;
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={2}>Workshop Management</Typography>
      <Grid container columns={12} spacing={2} mb={3}>
        <Grid gridColumn={{ xs: 'span 12', sm: 'span 6', md: 'span 3' }}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">{totalWorkshops}</Typography>
            <Typography color="text.secondary" fontSize={14}>Total Workshops</Typography>
            <Typography color="text.secondary" fontSize={12}>Overall number of workshops</Typography>
          </Paper>
        </Grid>
        <Grid gridColumn={{ xs: 'span 12', sm: 'span 6', md: 'span 3' }}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">{activeWorkshops}</Typography>
            <Typography color="text.secondary" fontSize={14}>Active Workshops</Typography>
            <Typography color="text.secondary" fontSize={12}>Currently running or upcoming</Typography>
          </Paper>
        </Grid>
        <Grid gridColumn={{ xs: 'span 12', sm: 'span 6', md: 'span 3' }}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">{draftWorkshops}</Typography>
            <Typography color="text.secondary" fontSize={14}>Draft Workshops</Typography>
            <Typography color="text.secondary" fontSize={12}>Workshops awaiting publication</Typography>
          </Paper>
        </Grid>
        <Grid gridColumn={{ xs: 'span 12', sm: 'span 6', md: 'span 3' }}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">{timeSlotsAssigned}</Typography>
            <Typography color="text.secondary" fontSize={14}>Time Slots Assigned</Typography>
            <Typography color="text.secondary" fontSize={12}>Workshops with defined schedules</Typography>
          </Paper>
        </Grid>
      </Grid>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal("add")}>Add New Workshop</Button>
      </Box>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 4, boxShadow: 2, background: '#fff' }}>
        <Typography variant="h6" fontWeight={700} mb={2}>Existing Workshops</Typography>
        <Typography color="text.secondary" fontSize={14} mb={2}>Manage and overview all workshops.</Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}><CircularProgress /></Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Image</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Instructor</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Capacity</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Time Slots</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(workshops) && workshops.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell>
                      {w.image ? <img src={w.image} alt={w.title} style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 4 }} /> : '-'}
                    </TableCell>
                    <TableCell>{w.title}</TableCell>
                    <TableCell>{w.description || '-'}</TableCell>
                    <TableCell>{w.instructor || '-'}</TableCell>
                    <TableCell>{w.date ? new Date(w.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</TableCell>
                    <TableCell>{w.maxCapacity}</TableCell>
                    <TableCell>${w.price || 0}</TableCell>
                    <TableCell>{w.timeSlots?.length || 0}</TableCell>
                    <TableCell>
                      <Chip label={statusLabels[w.status] || w.status} color={statusColors[w.status] || 'default'} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Manage Time">
                        <IconButton onClick={() => handleManageTime(w.id)}><AccessTimeIcon /></IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleOpenModal("edit", w)}><EditIcon /></IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleDelete(w.id)}><DeleteIcon /></IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      {/* Add/Edit Workshop Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>{modalMode === "add" ? "Add New Workshop" : "Edit Workshop"}</DialogTitle>
        <DialogContent>
          <TextField label="Title" name="title" value={form.title} onChange={handleFormChange} fullWidth margin="normal" required />
          <TextField label="Description" name="description" value={form.description} onChange={handleFormChange} fullWidth margin="normal" multiline rows={3} />
          <TextField label="Instructor" name="instructor" value={form.instructor} onChange={handleFormChange} fullWidth margin="normal" />
          <TextField label="Category" name="category" value={form.category} onChange={handleFormChange} fullWidth margin="normal" />
          <TextField label="Date" name="date" type="date" value={form.date} onChange={handleFormChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} required />
          <TextField label="Capacity" name="maxCapacity" type="number" value={form.maxCapacity} onChange={handleFormChange} fullWidth margin="normal" required inputProps={{ min: 1 }} />
          <TextField label="Price" name="price" type="number" value={form.price} onChange={handleFormChange} fullWidth margin="normal" inputProps={{ min: 0, step: 0.01 }} />
          <TextField select label="Status" name="status" value={form.status} onChange={handleFormChange} fullWidth margin="normal">
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Draft">Draft</MenuItem>
          </TextField>
          <Box mt={2} mb={2}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="workshop-image-upload"
              type="file"
              name="image"
              onChange={handleFormChange}
            />
            <label htmlFor="workshop-image-upload">
              <Button variant="outlined" component="span">
                {imageFile ? 'Change Image' : 'Upload Image'}
              </Button>
            </label>
            {(form.image && (typeof form.image === 'string')) && (
              <Box mt={1}>
                <img src={form.image} alt="Workshop" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 4 }} />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Workshops; 