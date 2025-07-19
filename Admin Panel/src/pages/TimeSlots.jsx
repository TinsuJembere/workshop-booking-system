import React, { useEffect, useState, useContext } from "react";
import {
  Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Tooltip, CircularProgress, Alert, Grid, InputAdornment
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import axios from "axios";
import { AuthContext } from "../utils/AuthContext";

const statusColors = {
  Available: "success",
  Booked: "primary"
};

const TimeSlots = () => {
  const [slots, setSlots] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [form, setForm] = useState({ workshopId: "", startTime: "", endTime: "", availableSpots: 1 });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterWorkshop, setFilterWorkshop] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const { getAuthHeader } = useContext(AuthContext);

  // Fetch workshops and slots
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [wsRes, tsRes] = await Promise.all([
          axios.get("/api/workshops", { headers: { ...getAuthHeader() } }),
          axios.get("/api/timeslots", { headers: { ...getAuthHeader() } })
        ]);
        setWorkshops(Array.isArray(wsRes.data.workshops) ? wsRes.data.workshops : []);
        setSlots(Array.isArray(tsRes.data) ? tsRes.data : []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load time slots.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtered slots
  const filteredSlots = slots.filter(slot => {
    const matchesSearch =
      !search ||
      (slot.workshop?.title || "").toLowerCase().includes(search.toLowerCase()) ||
      slot.startTime.toLowerCase().includes(search.toLowerCase()) ||
      slot.endTime.toLowerCase().includes(search.toLowerCase());
    const matchesWorkshop = !filterWorkshop || slot.workshopId === filterWorkshop;
    const matchesStatus =
      !filterStatus ||
      (filterStatus === "Available" && slot.availableSpots > 0) ||
      (filterStatus === "Booked" && slot.availableSpots === 0);
    const matchesDate = !selectedDate || slot.createdAt.slice(0, 10) === selectedDate;
    return matchesSearch && matchesWorkshop && matchesStatus && matchesDate;
  });

  // Summary
  const totalSlots = slots.length;
  const availableSlots = slots.filter(s => s.availableSpots > 0).length;
  const bookedSlots = slots.filter(s => s.availableSpots === 0).length;
  const upcomingSlots = slots.filter(s => new Date(s.startTime) > new Date()).length;

  // Handlers
  const handleOpenModal = (mode, slot = null) => {
    setModalMode(mode);
    setSelectedSlot(slot);
    setForm(
      slot
        ? { ...slot, workshopId: slot.workshopId }
        : { workshopId: "", startTime: "", endTime: "", availableSpots: 1 }
    );
    setOpenModal(true);
  };
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedSlot(null);
  };
  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      if (modalMode === "add") {
        await axios.post("/api/timeslots", form, { headers: { ...getAuthHeader() } });
      } else if (modalMode === "edit" && selectedSlot) {
        await axios.put(`/api/timeslots/${selectedSlot.id}`, form, { headers: { ...getAuthHeader() } });
      }
      // Refresh
      const tsRes = await axios.get("/api/timeslots", { headers: { ...getAuthHeader() } });
      setSlots(Array.isArray(tsRes.data) ? tsRes.data : []);
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save time slot.");
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this time slot?")) return;
    setError("");
    try {
      await axios.delete(`/api/timeslots/${id}`, { headers: { ...getAuthHeader() } });
      // Refresh
      const tsRes = await axios.get("/api/timeslots", { headers: { ...getAuthHeader() } });
      setSlots(Array.isArray(tsRes.data) ? tsRes.data : []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to delete time slot.");
    }
  };

  // Calendar helpers
  const today = new Date();
  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const calendarYear = selectedDate ? Number(selectedDate.split("-")[0]) : today.getFullYear();
  const calendarMonth = selectedDate ? Number(selectedDate.split("-")[1]) - 1 : today.getMonth();
  const days = Array.from({ length: daysInMonth(calendarYear, calendarMonth) }, (_, i) => i + 1);
  const slotDates = new Set(slots.map(s => s.createdAt.slice(0, 10)));

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={700}>Manage Time Slots</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal("add")}>Add New Time Slot</Button>
      </Box>
      <Grid container spacing={2}>
        {/* Main Table and Filters */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 4, boxShadow: 2, background: '#fff' }}>
            <Box display="flex" gap={2} mb={2} flexWrap="wrap">
              <TextField
                placeholder="Search time slots..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                size="small"
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
                sx={{ minWidth: 180 }}
              />
              <TextField
                select
                label="Filter by Workshop"
                value={filterWorkshop}
                onChange={e => setFilterWorkshop(e.target.value)}
                size="small"
                sx={{ minWidth: 180 }}
              >
                <MenuItem value="">All Workshops</MenuItem>
                {workshops.map(w => (
                  <MenuItem key={w.id} value={w.id}>{w.title}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Filter by Status"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                size="small"
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="Available">Available</MenuItem>
                <MenuItem value="Booked">Booked</MenuItem>
              </TextField>
            </Box>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}><CircularProgress /></Box>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Workshop Name</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Capacity</TableCell>
                      <TableCell>Booked</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredSlots.map((slot) => (
                      <TableRow key={slot.id}>
                        <TableCell>{slot.workshop?.title || '-'}</TableCell>
                        <TableCell>{slot.createdAt.slice(0, 10)}</TableCell>
                        <TableCell>{slot.startTime} - {slot.endTime}</TableCell>
                        <TableCell>{slot.availableSpots}</TableCell>
                        <TableCell>{slot.bookings ? slot.bookings.length : 0}</TableCell>
                        <TableCell>
                          <Chip label={slot.availableSpots > 0 ? "Available" : "Booked"} color={slot.availableSpots > 0 ? "success" : "primary"} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Edit">
                            <IconButton onClick={() => handleOpenModal("edit", slot)}><EditIcon /></IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton onClick={() => handleDelete(slot.id)}><DeleteIcon /></IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
        {/* Calendar and Summary */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, mb: 2, borderRadius: 4, boxShadow: 2, background: '#fff' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <CalendarTodayIcon color="primary" />
              <Typography fontWeight={600}>Calendar</Typography>
            </Box>
            <Box display="flex" justifyContent="center" mb={2}>
              <Box>
                <Box display="flex" justifyContent="center" mb={1}>
                  <Button size="small" onClick={() => setSelectedDate(prev => {
                    const d = new Date(calendarYear, calendarMonth - 1, 1);
                    d.setMonth(d.getMonth() - 1);
                    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
                  })}>{'<'}</Button>
                  <Typography mx={2} fontWeight={600}>{today.toLocaleString('default', { month: 'long' })} {calendarYear}</Typography>
                  <Button size="small" onClick={() => setSelectedDate(prev => {
                    const d = new Date(calendarYear, calendarMonth - 1, 1);
                    d.setMonth(d.getMonth() + 1);
                    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
                  })}>{'>'}</Button>
                </Box>
                <Box display="flex" flexWrap="wrap" justifyContent="center" gap={0.5}>
                  {days.map(day => {
                    const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const hasSlot = slotDates.has(dateStr);
                    return (
                      <Button
                        key={day}
                        size="small"
                        variant={selectedDate === dateStr ? "contained" : hasSlot ? "outlined" : "text"}
                        color={hasSlot ? "primary" : "inherit"}
                        sx={{ minWidth: 32, height: 32, m: 0.25, fontWeight: 600, fontSize: 14, borderRadius: 2 }}
                        onClick={() => setSelectedDate(dateStr)}
                      >
                        {day}
                      </Button>
                    );
                  })}
                </Box>
              </Box>
            </Box>
          </Paper>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 4, boxShadow: 2, background: '#fff' }}>
            <Typography fontWeight={600} mb={2}>Time Slot Summary</Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Box display="flex" justifyContent="space-between"><span>Total Slots:</span><span>{totalSlots}</span></Box>
              <Box display="flex" justifyContent="space-between"><span>Available Slots:</span><span>{availableSlots}</span></Box>
              <Box display="flex" justifyContent="space-between"><span>Booked Slots:</span><span>{bookedSlots}</span></Box>
              <Box display="flex" justifyContent="space-between"><span>Upcoming Slots:</span><span>{upcomingSlots}</span></Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      {/* Add/Edit Time Slot Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>{modalMode === "add" ? "Add New Time Slot" : "Edit Time Slot"}</DialogTitle>
        <DialogContent>
          <TextField select label="Workshop" name="workshopId" value={form.workshopId} onChange={handleFormChange} fullWidth margin="normal" required>
            <MenuItem value="">Select Workshop</MenuItem>
            {workshops.map(w => (
              <MenuItem key={w.id} value={w.id}>{w.title}</MenuItem>
            ))}
          </TextField>
          <TextField label="Start Time" name="startTime" value={form.startTime} onChange={handleFormChange} fullWidth margin="normal" required placeholder="e.g. 09:00 AM" />
          <TextField label="End Time" name="endTime" value={form.endTime} onChange={handleFormChange} fullWidth margin="normal" required placeholder="e.g. 11:00 AM" />
          <TextField label="Available Spots" name="availableSpots" type="number" value={form.availableSpots} onChange={handleFormChange} fullWidth margin="normal" required inputProps={{ min: 0 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TimeSlots; 