import React, { useState, useContext } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Avatar,
} from "@mui/material";
import {
  AdminPanelSettings as AdminIcon,
  Login as LoginIcon,
  LockReset as ResetIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { AdminContext } from "../context/AdminContext";

const Login = () => {
  const [email, setEmail] = useState("priyanka@maildrop.cc");
  const [password, setPassword] = useState("Priyanka@123");
  const { login, error: contextError, loading } = useContext(AdminContext);
  const [localError, setLocalError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    const success = await login(email, password);
    if (!success) {
      setLocalError("Invalid credentials or not an admin");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg,#667eea 0%,#764ba2 100%)",
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 400, width: "100%", borderRadius: 3, boxShadow: 5 }}>
        <CardContent sx={{ p: 4 }}>
          <Box textAlign="center" mb={3}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mx: "auto",
                mb: 2,
                bgcolor: "primary.main",
              }}
            >
              <AdminIcon sx={{ fontSize: 40 }} />
            </Avatar>

            <Typography variant="h5" fontWeight={600} gutterBottom>
              Admin Login
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Enter your credentials to continue
            </Typography>
          </Box>

          {(contextError || localError) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {contextError || localError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              disabled={loading}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<LoginIcon />}
              sx={{ mt: 2, py: 1.5, fontWeight: 600 }}
              disabled={loading}
            >
              {loading ? "Signing In..." : "Login"}
            </Button>

            {/* 🔥 Forgot Password Button */}
            <Button
              fullWidth
              onClick={() => navigate("/forgot-password")}
              startIcon={<ResetIcon />}
              sx={{
                mt: 2,
                textTransform: "none",
                fontWeight: 500,
                color: "primary.main",
              }}
            >
              Forgot Password?
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
