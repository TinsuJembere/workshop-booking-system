import React, { useEffect, useState, useContext } from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, CircularProgress, Alert, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { AuthContext } from "../utils/AuthContext";
import axios from "axios";

const roleColors = {
  ADMIN: "primary",
  CUSTOMER: "default",
  PENDING_ADMIN: "warning"
};
const statusOptions = ["Active", "PENDING_ADMIN"];
const roleOptions = ["ADMIN", "CUSTOMER"];

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const { getAuthHeader } = useContext(AuthContext);
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", role: "CUSTOMER", status: "Active" });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("/api/users", { headers: { ...getAuthHeader() } });
      setUsers(Array.isArray(res.data) ? res.data : res.data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await axios.put(`/api/users/${id}/approve`, {}, { headers: { ...getAuthHeader() } });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to approve user.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (id) => {
    setActionLoading(id);
    try {
      await axios.put(`/api/users/${id}/decline`, {}, { headers: { ...getAuthHeader() } });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to decline user.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenModal = (mode, user = null) => {
    setModalMode(mode);
    setSelectedUser(user);
    setForm(user ? { name: user.name, email: user.email, role: user.role, status: user.status } : { name: "", email: "", role: "CUSTOMER", status: "Active" });
    setOpenModal(true);
  };
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedUser(null);
  };
  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      if (modalMode === "add") {
        await axios.post("/api/users", form, { headers: { ...getAuthHeader() } });
      } else if (modalMode === "edit" && selectedUser) {
        await axios.put(`/api/users/${selectedUser.id}`, form, { headers: { ...getAuthHeader() } });
      }
      fetchUsers();
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save user.");
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async (id) => {
    setActionLoading(id);
    setError("");
    try {
      await axios.delete(`/api/users/${id}`, { headers: { ...getAuthHeader() } });
      fetchUsers();
      setDeleteId(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to delete user.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={2}>User Management</Typography>
      <Button variant="contained" sx={{ mb: 2 }} onClick={() => handleOpenModal("add")}>Add User</Button>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 4, boxShadow: 2, background: '#fff' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}><CircularProgress /></Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Chip label={u.role} color={roleColors[u.role] || 'default'} size="small" />
                    </TableCell>
                    <TableCell>
                      {u.status === 'PENDING_ADMIN' ? (
                        <Chip label="Pending Admin" color="warning" size="small" />
                      ) : (
                        <Chip label={u.status || 'Active'} color={u.status === 'Active' ? 'success' : 'default'} size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      {u.status === 'PENDING_ADMIN' && (
                        <>
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            sx={{ mr: 1 }}
                            disabled={actionLoading === u.id}
                            onClick={() => handleApprove(u.id)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            disabled={actionLoading === u.id}
                            onClick={() => handleDecline(u.id)}
                          >
                            Decline
                          </Button>
                        </>
                      )}
                      <IconButton size="small" color="primary" onClick={() => handleOpenModal("edit", u)}><EditIcon /></IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteId(u.id)}><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      {/* Add/Edit User Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="xs" fullWidth>
        <DialogTitle>{modalMode === "add" ? "Add User" : "Edit User"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            name="name"
            value={form.name}
            onChange={handleFormChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email"
            name="email"
            value={form.email}
            onChange={handleFormChange}
            fullWidth
            margin="normal"
            type="email"
          />
          <TextField
            select
            label="Role"
            name="role"
            value={form.role}
            onChange={handleFormChange}
            fullWidth
            margin="normal"
          >
            {roleOptions.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </TextField>
          <TextField
            select
            label="Status"
            name="status"
            value={form.status}
            onChange={handleFormChange}
            fullWidth
            margin="normal"
          >
            {statusOptions.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
        </DialogActions>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>Are you sure you want to delete this user?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} disabled={actionLoading}>Cancel</Button>
          <Button onClick={() => handleDelete(deleteId)} color="error" variant="contained" disabled={actionLoading}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users; 