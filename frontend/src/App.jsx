import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ListingDetailPage from "./pages/ListingDetailPage.jsx";
import CreateListingPage from "./pages/CreateListingPage.jsx";
import EditListingPage from "./pages/EditListingPage.jsx";
import MyListingsPage from "./pages/MyListingsPage.jsx";
import WishlistPage from "./pages/WishlistPage.jsx";
import AdminListingsPage from "./pages/AdminListingsPage.jsx";
import AdminUsersPage from "./pages/AdminUsersPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/listings/:id" element={<ListingDetailPage />} />

          <Route
            path="/listings/new"
            element={
              <ProtectedRoute roles={["seller", "admin"]}>
                <CreateListingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/listings/:id/edit"
            element={
              <ProtectedRoute roles={["seller", "admin"]}>
                <EditListingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-listings"
            element={
              <ProtectedRoute roles={["seller", "admin"]}>
                <MyListingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <WishlistPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/listings"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminListingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </>
  );
}
