import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ROUTES } from "./constants/routes.constant";
import Dashboard from "./pages/dashboard";
import DashboardHome from "./pages/dashboard/home";
import UserDetailsTable from "./pages/user";
import ProductsTable from "./pages/product";
import LocalProductsTable from "./pages/lcoalProduct";
import ContactPage from "./pages/contact";
import LoginPage from "./pages/auth/login";
import RegisterPage from "./pages/auth/register";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AdminOnlyRoute, UserAndAdminRoute, UserOnlyRoute } from "./components/auth/RoleProtectedRoute";
import { AuthProvider } from "./components/auth/AuthProvider";
import { Toaster } from "sonner";


function App() {
  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Dashboard>
                    <Routes>
                      <Route path={ROUTES.HOME} element={<DashboardHome />} />
                      <Route path={ROUTES.DASHBOARD} element={<DashboardHome />} />
                      <Route 
                        path={ROUTES.PRODUCTS} 
                        element={
                          <UserAndAdminRoute>
                            <ProductsTable />
                          </UserAndAdminRoute>
                        } 
                      />
                      <Route 
                        path={ROUTES.LOCAL_PRODUCTS} 
                        element={
                          <UserAndAdminRoute>
                            <LocalProductsTable />
                          </UserAndAdminRoute>
                        } 
                      />
                      <Route 
                        path={ROUTES.USER} 
                        element={
                          <AdminOnlyRoute>
                            <UserDetailsTable />
                          </AdminOnlyRoute>
                        } 
                      />
                      <Route 
                        path={ROUTES.CONTACT} 
                        element={
                          <UserOnlyRoute>
                            <ContactPage />
                          </UserOnlyRoute>
                        } 
                      />
                    </Routes>
                  </Dashboard>
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster richColors position="top-center" />
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;