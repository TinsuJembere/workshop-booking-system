import React, { useEffect, useState, useContext } from "react";
import { Grid, Paper, Typography, Box, Avatar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, CircularProgress, Alert } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LabelList } from "recharts";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import EventNoteIcon from "@mui/icons-material/EventNote";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import { AuthContext } from "../utils/AuthContext";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c", "#d0ed57"];

const BAR_COLORS = ["#6366f1", "#f59e42"];
const PIE_COLORS = ["#6366f1", "#34d399", "#f59e42", "#f87171", "#fbbf24", "#a78bfa"];

const Dashboard = () => {
  const [overview, setOverview] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [popularity, setPopularity] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getAuthHeader } = useContext(AuthContext);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch("/api/stats/overview", { headers: { ...getAuthHeader() } })
        .then(async r => {
          if (!r.ok) throw new Error('Failed to load overview');
          return r.json();
        }),
      fetch("/api/stats/monthly", { headers: { ...getAuthHeader() } })
        .then(async r => {
          if (!r.ok) throw new Error('Failed to load monthly stats');
          return r.json();
        }),
      fetch("/api/stats/popularity", { headers: { ...getAuthHeader() } })
        .then(async r => {
          if (!r.ok) throw new Error('Failed to load popularity stats');
          return r.json();
        }),
      fetch("/api/stats/recent-bookings", { headers: { ...getAuthHeader() } })
        .then(async r => {
          if (!r.ok) throw new Error('Failed to load recent bookings');
          return r.json();
        })
    ]).then(([overview, monthly, popularity, recentBookings]) => {
      setOverview(overview);
      setMonthly(monthly);
      setPopularity(popularity);
      setRecentBookings(recentBookings);
      setLoading(false);
    }).catch(e => {
      setError(e.message || "Failed to load dashboard data");
      setLoading(false);
    });
  }, []);

  const statCards = overview ? [
    { label: "Total Bookings", value: overview.totalBookings ?? 0, icon: <TrendingUpIcon color="primary" />, sub: "Processed in last 6 months" },
    { label: "Active Workshops", value: overview.activeWorkshops ?? 0, icon: <EventNoteIcon color="primary" />, sub: "Currently open for booking" },
    { label: "Available Slots", value: overview.availableSlots ?? 0, icon: <AccessTimeIcon color="primary" />, sub: "Remaining in all workshops" },
    { label: "Revenue Generated", value: (typeof overview.revenue === 'number' ? overview.revenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '$0'), icon: <MonetizationOnIcon color="primary" />, sub: "Last 6 months" },
  ] : [];

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!overview) return <Alert severity="error">Failed to load dashboard data. Please try again later.</Alert>;

  return (
    <Box maxWidth="xl" mx="auto" px={{ xs: 0.5, sm: 1, md: 2 }} pt={{ xs: 1, sm: 2, md: 2 }}>
      <Typography variant="h5" fontWeight={600} mb={2}>Dashboard Overview</Typography>
      <Typography color="text.secondary" mb={3}>Key insights and recent activities for your workshop booking system.</Typography>
      <Grid container spacing={2} mb={2}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <Paper elevation={2} sx={{ p: 2, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <Box display="flex" alignItems="center" mb={1}>
                {card.icon}
                <Typography variant="h6" ml={1}>{card.value}</Typography>
              </Box>
              <Typography variant="subtitle2" color="text.secondary">{card.label}</Typography>
              <Typography variant="caption" color="text.secondary">{card.sub}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, height: 360, borderRadius: 4, boxShadow: 3, background: '#f9fafb' }}>
            <Typography variant="h6" fontWeight={700} mb={2} color="primary.main">Monthly Bookings Overview</Typography>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthly} barCategoryGap={24} margin={{ top: 16, right: 24, left: 0, bottom: 24 }}>
                <XAxis dataKey="month" tick={{ fontSize: 14 }} axisLine={false} tickLine={false} label={{ value: 'Month', position: 'insideBottom', offset: -10, fontSize: 14 }} />
                <YAxis tick={{ fontSize: 14 }} axisLine={false} tickLine={false} label={{ value: 'Count', angle: -90, position: 'insideLeft', offset: 10, fontSize: 14 }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 14 }} />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 14 }} />
                <Bar dataKey="bookings" name="Bookings" fill={BAR_COLORS[0]} radius={[8, 8, 0, 0]}>
                  <LabelList dataKey="bookings" position="top" fontSize={13} fill="#6366f1" />
                </Bar>
                <Bar dataKey="cancellations" name="Cancellations" fill={BAR_COLORS[1]} radius={[8, 8, 0, 0]}>
                  <LabelList dataKey="cancellations" position="top" fontSize={13} fill="#f59e42" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, height: 360, borderRadius: 4, boxShadow: 3, background: '#f9fafb', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h6" fontWeight={700} mb={2} color="primary.main">Workshop Popularity</Typography>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={popularity}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={38}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                  isAnimationActive={true}
                >
                  {popularity.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  layout="horizontal"
                  wrapperStyle={{ fontSize: 14, marginTop: 12 }}
                  payload={popularity
                    .filter(item => item.name && item.name !== 'value')
                    .map((item, idx) => ({
                      id: item.name,
                      type: "circle",
                      value: `${item.name}`,
                      color: PIE_COLORS[idx % PIE_COLORS.length],
                    }))}
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
      {/* Recent Bookings Section - full width at the bottom */}
      <Paper elevation={2} sx={{ p: 3, mt: 3, borderRadius: 4, boxShadow: 2, background: '#fff' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={700}>Recent Bookings</Typography>
          <Button size="small" variant="text" href="/bookings" sx={{ textTransform: 'none', fontWeight: 500 }}>View All Bookings</Button>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Booking ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Workshop</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentBookings.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.customer}</TableCell>
                  <TableCell>{row.workshop}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>{row.time}</TableCell>
                  <TableCell>
                    <Typography color={row.status === 'CONFIRMED' ? "success.main" : "error.main"} fontWeight={600}>{row.status.charAt(0) + row.status.slice(1).toLowerCase()}</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default Dashboard;