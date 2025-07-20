import React, { useEffect, useState, useContext } from "react";
import {
  Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, TextField, MenuItem, Tooltip, CircularProgress, Alert, Grid, InputAdornment, Pagination, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import axios from "axios";
import { AuthContext } from "../utils/AuthContext";

const statusColors = {
  CONFIRMED: "success",
  PENDING: "warning",
  CANCELED: "error",
  COMPLETED: "primary"
};

const statusLabels = {
  CONFIRMED: "Confirmed",
  PENDING: "Pending",
  CANCELED: "Canceled",
  COMPLETED: "Completed"
};

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterWorkshop, setFilterWorkshop] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [workshops, setWorkshops] = useState([]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState("edit");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [form, setForm] = useState({ status: "", attendeeName: "", attendeeEmail: "" });
  const [saving, setSaving] = useState(false);
  const limit = 6;
  const { getAuthHeader } = useContext(AuthContext);

  // Fetch workshops for filter
  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const res = await axios.get("/api/workshops", { 
          headers: { 
            ...getAuthHeader(),
            'x-admin-panel': 'true'
          } 
        });
        setWorkshops(Array.isArray(res.data.workshops) ? res.data.workshops : []);
      } catch (err) {
        console.error('Error fetching workshops:', err);
      }
    };
    fetchWorkshops();
  }, []);

  // Fetch bookings
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const params = {
          page,
          limit,
          search,
          status: filterStatus,
          workshopId: filterWorkshop,
          startDate: dateRange.start,
          endDate: dateRange.end
        };
        const res = await axios.get("/api/bookings", {
          params,
          headers: {
            ...getAuthHeader(),
          },
        });
        setBookings(Array.isArray(res.data.bookings) ? res.data.bookings : []);
        setTotal(res.data.total || 0);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [search, filterWorkshop, filterStatus, page, dateRange]);

  // Stats
  const totalBookings = total;
  const pendingApprovals = bookings.filter(b => b.status === "PENDING").length;
  const revenueGenerated = bookings.reduce((sum, b) => sum + (b.workshop?.price || 0), 0);
  const activeCustomers = new Set(bookings.map(b => b.attendeeEmail)).size;

  // Handlers
  const handleClearFilters = () => {
    setSearch("");
    setFilterWorkshop("");
    setFilterStatus("");
    setDateRange({ start: "", end: "" });
    setPage(1);
  };

  const handleOpenModal = (mode, booking = null) => {
    setModalMode(mode);
    setSelectedBooking(booking);
    setForm(
      booking
        ? { 
            status: booking.status || "",
            attendeeName: booking.attendeeName || "",
            attendeeEmail: booking.attendeeEmail || ""
          }
        : { 
            status: "", 
            attendeeName: "", 
            attendeeEmail: "" 
          }
    );
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedBooking(null);
  };

  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!selectedBooking) return;
    
    setSaving(true);
    setError("");
    try {
      await axios.put(`/api/bookings/${selectedBooking.id}`, form, { 
        headers: { ...getAuthHeader() } 
      });
      
      // Refresh bookings
      const params = {
        page,
        limit,
        search,
        status: filterStatus,
        workshopId: filterWorkshop,
        startDate: dateRange.start,
        endDate: dateRange.end
      };
      const res = await axios.get("/api/bookings", {
        params,
        headers: { ...getAuthHeader() },
      });
      setBookings(Array.isArray(res.data.bookings) ? res.data.bookings : []);
      setTotal(res.data.total || 0);
      
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to update booking.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    setError("");
    try {
      console.log('Attempting to delete booking with ID:', id);
      const response = await axios.delete(`/api/bookings/${id}`, { headers: { ...getAuthHeader() } });
      console.log('Delete response:', response.data);
      
      // Refresh bookings
      const params = {
        page,
        limit,
        search,
        status: filterStatus,
        workshopId: filterWorkshop,
        startDate: dateRange.start,
        endDate: dateRange.end
      };
      const res = await axios.get("/api/bookings", {
        params,
        headers: { ...getAuthHeader() },
      });
      setBookings(Array.isArray(res.data.bookings) ? res.data.bookings : []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error('Delete error:', err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Failed to cancel booking."
      );
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={2}>Bookings Overview</Typography>
      <Grid container columns={12} spacing={2} mb={3}>
        <Grid gridColumn={{ xs: 'span 12', sm: 'span 6', md: 'span 3' }}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">{totalBookings.toLocaleString()}</Typography>
            <Typography color="text.secondary" fontSize={14}>Total Bookings</Typography>
            <Typography color="text.secondary" fontSize={12}>All time bookings</Typography>
          </Paper>
        </Grid>
        <Grid gridColumn={{ xs: 'span 12', sm: 'span 6', md: 'span 3' }}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">{pendingApprovals}</Typography>
            <Typography color="text.secondary" fontSize={14}>Pending Approvals</Typography>
            <Typography color="text.secondary" fontSize={12}>Requires immediate attention</Typography>
          </Paper>
        </Grid>
        <Grid gridColumn={{ xs: 'span 12', sm: 'span 6', md: 'span 3' }}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">${revenueGenerated.toLocaleString()}</Typography>
            <Typography color="text.secondary" fontSize={14}>Revenue Generated</Typography>
            <Typography color="text.secondary" fontSize={12}>Total revenue from bookings</Typography>
          </Paper>
        </Grid>
        <Grid gridColumn={{ xs: 'span 12', sm: 'span 6', md: 'span 3' }}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">{activeCustomers}</Typography>
            <Typography color="text.secondary" fontSize={14}>Active Customers</Typography>
            <Typography color="text.secondary" fontSize={12}>Currently enrolled in workshops</Typography>
          </Paper>
        </Grid>
      </Grid>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 4, boxShadow: 2, background: '#fff' }}>
        <Box display="flex" gap={2} mb={2} flexWrap="wrap" alignItems="center">
          <TextField
            placeholder="Search bookings by customer, workshop..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            size="small"
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
            sx={{ minWidth: 220 }}
          />
          <TextField
            select
            label="Status"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            size="small"
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="CONFIRMED">Confirmed</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="CANCELED">Canceled</MenuItem>
            <MenuItem value="COMPLETED">Completed</MenuItem>
          </TextField>
          <TextField
            select
            label="Workshop"
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
            label="Date Range"
            type="date"
            value={dateRange.start}
            onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
            size="small"
            sx={{ minWidth: 140 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="to"
            type="date"
            value={dateRange.end}
            onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
            size="small"
            sx={{ minWidth: 140 }}
            InputLabelProps={{ shrink: true }}
          />
          <Button onClick={handleClearFilters} size="small" variant="outlined">Clear filters</Button>
          <Button startIcon={<DownloadIcon />} size="small" variant="outlined">Download</Button>
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
                  <TableCell>Customer</TableCell>
                  <TableCell>Workshop</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Amount Paid</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <Box display="flex" flexDirection="column">
                        <Typography fontWeight={600}>{b.attendeeName}</Typography>
                        <Typography variant="body2" color="text.secondary">{b.attendeeEmail}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{b.workshop?.title || '-'}</TableCell>
                    <TableCell>
                      {b.timeSlot ? (
                        <Box>
                          <Typography variant="body2">{b.timeSlot.startTime} - {b.timeSlot.endTime}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(b.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      ) : '-'}
                    </TableCell>
                    <TableCell>${b.workshop?.price ? b.workshop.price.toLocaleString() : '0.00'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={statusLabels[b.status] || b.status} 
                        color={statusColors[b.status] || 'default'} 
                        size="small" 
                        variant="outlined" 
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleOpenModal("edit", b)}><EditIcon /></IconButton>
                      </Tooltip>
                      <Tooltip title="Cancel">
                        <span>
                          <IconButton
                            onClick={() => handleDelete(b.id)}
                            disabled={b.status === "CANCELED"}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
          <Typography variant="body2">Showing {bookings.length ? ((page - 1) * limit + 1) : 0} to {Math.min(page * limit, total)} of {total} results</Typography>
          <Pagination
            count={Math.ceil(total / limit)}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Box>
      </Paper>

      {/* Edit Booking Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Booking</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Status"
            name="status"
            value={form.status}
            onChange={handleFormChange}
            fullWidth
            margin="normal"
          >
            <MenuItem value="CONFIRMED">Confirmed</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="CANCELED">Canceled</MenuItem>
            <MenuItem value="COMPLETED">Completed</MenuItem>
          </TextField>
          <TextField
            label="Attendee Name"
            name="attendeeName"
            value={form.attendeeName}
            onChange={handleFormChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Attendee Email"
            name="attendeeEmail"
            value={form.attendeeEmail}
            onChange={handleFormChange}
            fullWidth
            margin="normal"
            type="email"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Bookings; 