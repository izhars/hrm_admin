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
import MailLockIcon from "@mui/icons-material/MailLock";
import { AdminContext } from "../context/AdminContext";

const ForgotPassword = () => {
  const { forgotPassword } = useContext(AdminContext);

  const [email, setEmail] = useState("");
  const [resp, setResp] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleForgot = async (e) => {
    e.preventDefault();
    setResp(null);
    setLoading(true);

    const data = await forgotPassword(email);
    setResp(data);
    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
        p: 2,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 4,
          boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
          backdropFilter: "blur(10px)",
        }}
      >
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
              <MailLockIcon sx={{ fontSize: 40 }} />
            </Avatar>

            <Typography variant="h5" fontWeight={700} gutterBottom>
              Forgot Password
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Don't panic—just enter your email and we'll shoot you a reset link.
            </Typography>
          </Box>

          {/* Alerts */}
          {resp && (
            <Alert
              severity={resp.success ? "success" : "error"}
              sx={{ mb: 2, fontWeight: 500 }}
            >
              {resp.message}
            </Alert>
          )}

          <Box component="form" onSubmit={handleForgot}>
            <TextField
              fullWidth
              label="Enter Email"
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              disabled={loading}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 600,
              }}
              disabled={loading || !email}
            >
              {loading ? "Sending Reset Link..." : "Send Reset Link"}
            </Button>

            <Button
              fullWidth
              href="/login"  // Changed to link instead of window.history.back()
              sx={{
                mt: 2,
                textTransform: "none",
                fontWeight: 500,
                color: "primary.main",
              }}
              disabled={loading}
            >
              Back to Login
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ForgotPassword;