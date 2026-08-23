// ============================================================
// دليل الرقاة - Main App with Routing
// ============================================================

import { Routes, Route } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Home from '@/pages/Home';
import Directory from '@/pages/Directory';
import SingleRaqi from '@/pages/SingleRaqi';
import Register from '@/pages/Register';
import Admin from '@/pages/Admin';
import RaqiLogin from '@/pages/RaqiLogin';
import RaqiDashboard from '@/pages/RaqiDashboard';
import AuthCallback from '@/pages/AuthCallback';
import RaqiOnboarding from '@/pages/RaqiOnboarding';
import PricingPlansSection from '@/pages/PricingPlansSection';

function App() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route path="/*" element={<WithNav />} />
      </Routes>
    </div>
  );
}

function WithNav() {
  return (
    <>
      <Navigation />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/roqat" element={<Directory />} />
        <Route path="/roqat/:slug" element={<SingleRaqi />} />
 <Route
          path="/offers"
          element={<PricingPlansSection />}
        />
        <Route path="/register" element={<Register />} />
        <Route path="/raqi-login" element={<RaqiLogin />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/raqi-onboarding" element={<RaqiOnboarding />} />
        <Route path="/raqi-dashboard" element={<RaqiDashboard />} />
      </Routes>
    </>
  );
}

export default App;