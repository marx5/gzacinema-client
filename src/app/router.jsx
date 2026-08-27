// src/app/router.jsx
import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import { Navbar, Footer } from "../components/layouts";
import { ProtectedRoute, RoleRoute } from "../components/modules/auth";
import { LazyLoading } from "../components/base";

const Home = React.lazy(() => import("../pages/home"));
const Login = React.lazy(() => import("../pages/auth/Login"));
const Register = React.lazy(() => import("../pages/auth/Register"));
const MovieDetails = React.lazy(() => import("../pages/movie/MovieDetails"));
const Booking = React.lazy(() => import("../pages/booking"));
const PaymentResult = React.lazy(() => import("../pages/payment/PaymentResult"));
const History = React.lazy(() => import("../pages/history"));
const Profile = React.lazy(() => import("../pages/profile"));

import AdminLayout from "../pages/admin/AdminLayout";
const AdminDashboard = React.lazy(() => import("../pages/admin/AdminDashboard"));
const StaffCheckIn = React.lazy(() => import("../pages/staff/StaffCheckIn"));
const AdminMovies = React.lazy(() => import("../pages/admin/AdminMovies"));
const AdminShowtimes = React.lazy(() => import("../pages/admin/AdminShowtimes"));
const AdminCinemas = React.lazy(() => import("../pages/admin/AdminCinemas"));
const AdminRooms = React.lazy(() => import("../pages/admin/AdminRooms"));
const AdminBookings = React.lazy(() => import("../pages/admin/AdminBookings"));
const AdminMovieShowtimes = React.lazy(() => import("../pages/admin/AdminMovieShowtimes"));

const NotFound = React.lazy(() => import("../pages/not-found"));

const PublicLayout = () => (
    <div className="flex min-h-screen flex-col bg-cinema-bg text-cinema-text">
        <Navbar />
        <main className="flex-1 pb-10">
            <Suspense fallback={<LazyLoading message="Đang tải trang..." />}>
                <Outlet />
            </Suspense>
        </main>
        <Footer />
    </div>
);

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                    {/* Admin Dedicated Area with Sidebar */}
                    <Route element={<RoleRoute allowedRoles={['admin', 'staff']} />}>
                        <Route path="/admin" element={<AdminLayout />}>
                            <Route index element={<AdminDashboard />} />
                            <Route path="movies" element={<AdminMovies />} />
                            <Route path="movies/:id/showtimes" element={<AdminMovieShowtimes />} />
                            <Route path="showtimes" element={<AdminShowtimes />} />
                            <Route path="cinemas" element={<AdminCinemas />} />
                            <Route path="cinemas/:cinemaId/rooms" element={<AdminRooms />} />
                            <Route path="bookings" element={<AdminBookings />} />
                            <Route path="checkin" element={<StaffCheckIn />} />
                        </Route>
                    </Route>

                    {/* Legacy /staff/checkin redirect to /admin/checkin */}
                    <Route path="/staff/checkin" element={<Navigate to="/admin/checkin" replace />} />

                    {/* Public & Customer Routes */}
                    <Route element={<PublicLayout />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/movie/:id" element={<MovieDetails />} />

                        <Route element={<ProtectedRoute />}>
                            <Route path="/booking/:showtimeId" element={<Booking />} />
                            <Route path="/payment/success" element={<PaymentResult />} />
                            <Route path="/history" element={<History />} />
                            <Route path="/profile" element={<Profile />} />
                        </Route>

                        <Route path="*" element={<NotFound />} />
                    </Route>
                </Routes>
        </BrowserRouter>
    );
}