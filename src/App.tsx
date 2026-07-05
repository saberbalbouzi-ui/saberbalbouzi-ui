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

function App() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<WithNav />} />
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
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  );
}

export default App;
