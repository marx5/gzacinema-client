import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Navbar from "../components/Navbar";
import ProtectedRoute from "../components/ProtectedRoute";
import MovieDetails from "../pages/MovieDetails";
import Booking from "../pages/Booking";
import PaymentResult from "../pages/PaymentResult";
import History from "../pages/History";
import AdminDashboard from "../pages/admin/AdminDashboard";
import StaffCheckIn from "../pages/staff/StaffCheckIn";
import AdminMovies from "../pages/admin/AdminMovies";
import AdminShowtimes from "../pages/admin/AdminShowtimes";
import AdminCinemas from "../pages/admin/AdminCinemas";
import AdminRooms from "../pages/admin/AdminRooms";


export default function AppRouter() {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/movie/:id" element={<MovieDetails />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="/booking/:showtimeId" element={<Booking />} />
                    <Route path="/payment/success" element={<PaymentResult />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/staff/checkin" element={<StaffCheckIn />} />
                    <Route path="/admin/movies" element={<AdminMovies />} />
                    <Route path="/admin/showtimes" element={<AdminShowtimes />} />
                    <Route path="/admin/cinemas" element={<AdminCinemas />} />
                    <Route path="/admin/cinemas/:cinemaId/rooms" element={<AdminRooms />} />

                </Route>
            </Routes>
        </BrowserRouter>
    );
}