import { Navigate, Route, Routes } from 'react-router-dom'

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<h1>Home Page</h1>} />
      <Route path="/login" element={<h1>Login Page</h1>} />
      <Route path="/signup" element={<h1>Signup Page</h1>} />
      <Route path="/verify-otp" element={<h1>Verify OTP Page</h1>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes
