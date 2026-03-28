// src/app/router.jsx
import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer"; // <-- THÊM IMPORT NÀY
import ProtectedRoute from "../components/ProtectedRoute";
import RoleRoute from "../components/RoleRoute";

const Home = React.lazy(() => import("../pages/Home"));
const Login = React.lazy(() => import("../pages/Login"));
const Register = React.lazy(() => import("../pages/Register"));
const MovieDetails = React.lazy(() => import("../pages/MovieDetails"));
const Booking = React.lazy(() => import("../pages/booking"));
const PaymentResult = React.lazy(() => import("../pages/PaymentResult"));
const History = React.lazy(() => import("../pages/History"));
const AdminDashboard = React.lazy(() => import("../pages/admin/AdminDashboard"));
const StaffCheckIn = React.lazy(() => import("../pages/staff/StaffCheckIn"));
const AdminMovies = React.lazy(() => import("../pages/admin/AdminMovies"));
const AdminShowtimes = React.lazy(() => import("../pages/admin/AdminShowtimes"));
const AdminCinemas = React.lazy(() => import("../pages/admin/AdminCinemas"));
const AdminRooms = React.lazy(() => import("../pages/admin/AdminRooms"));
const Profile = React.lazy(() => import("../pages/Profile"));
const AdminBookings = React.lazy(() => import("../pages/admin/AdminBookings"));
const AdminMovieShowtimes = React.lazy(() => import("../pages/admin/AdminMovieShowtimes"));

const NotFound = React.lazy(() => import("../pages/NotFound"));

const Loader = () => (
    <div className="flex items-center justify-center p-10 min-h-[50vh]">
        <div className="text-center">
            <div className="inline-block">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-[#ddcbb6] border-t-brand-500 rounded-full"></div>
                <p className="mt-3 text-sm font-bold text-[#7b6446]">Đang tải...</p>
            </div>
        </div>
    </div>
);

export default function AppRouter() {
    return (
        <BrowserRouter>
            <div className="flex min-h-screen flex-col">
                <Navbar />

                <main className="flex-1 pb-10">
                    <Suspense fallback={<Loader />}>
                        <Routes>
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

                            <Route element={<RoleRoute allowedRoles={['admin', 'staff']} />}>
                                <Route path="/staff/checkin" element={<StaffCheckIn />} />
                            </Route>

                            <Route element={<RoleRoute allowedRoles={['admin']} />}>
                                <Route path="/admin" element={<AdminDashboard />} />
                                <Route path="/admin/movies" element={<AdminMovies />} />
                                <Route path="/admin/showtimes" element={<AdminShowtimes />} />
                                <Route path="/admin/cinemas" element={<AdminCinemas />} />
                                <Route path="/admin/cinemas/:cinemaId/rooms" element={<AdminRooms />} />
                                <Route path="/admin/bookings" element={<AdminBookings />} />
                                <Route path="/admin/movies/:id/showtimes" element={<AdminMovieShowtimes />} />
                            </Route>

                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Suspense>
                </main>

                <Footer />
            </div>
        </BrowserRouter>
    );
}