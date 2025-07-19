import React, { useEffect, useState, useContext } from "react";
import {
  Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, TextField, MenuItem, Tooltip, CircularProgress, Alert, Grid, InputAdornment, Pagination
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import axios from "axios";
import { AuthContext } from "../utils/AuthContext";

const statusColors = {
  Confirmed: "success",
  Pending: "warning",
  Cancelled: "error",
  Completed: "primary"
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
  const limit = 6;
  const { getAuthHeader } = useContext(AuthContext);

  // Fetch workshops for filter
  useEffect(() => {
    axios.get("/api/workshops").then(res => {
      setWorkshops(Array.isArray(res.data.workshops) ? res.data.workshops : []);
    });
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
        setError("Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [search, filterWorkshop, filterStatus, page, dateRange]);

  // Stats (mocked for now)
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

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={2}>Bookings Overview</Typography>
      <Grid container columns={12} spacing={2} mb={3}>
        <Grid gridColumn={{ xs: 'span 12', sm: 'span 6', md: 'span 3' }}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">{totalBookings.toLocaleString()}</Typography>
            <Typography color="text.secondary" fontSize={14}>Total Bookings</Typography>
            <Typography color="text.secondary" fontSize={12}>+5% from last month</Typography>
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
            <Typography color="text.secondary" fontSize={12}>+10% from last month</Typography>
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
          <Button startIcon={<AddIcon />} size="small" variant="contained">Add new</Button>
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
                    <TableCell>{b.timeSlot ? `${b.timeSlot.date || ''} ${b.timeSlot.startTime}` : '-'}</TableCell>
                    <TableCell>${b.workshop?.price ? b.workshop.price.toLocaleString() : '0.00'}</TableCell>
                    <TableCell>
                      <Chip label={b.status ? b.status.charAt(0) + b.status.slice(1).toLowerCase() : ''} color={statusColors[b.status?.charAt(0).toUpperCase() + b.status?.slice(1).toLowerCase()] || 'default'} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <IconButton><MoreVertIcon /></IconButton>
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
    </Box>
  );
};

export default Bookings; 