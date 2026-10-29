import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import HowItWorks from './pages/HowItWorks';
import Mission from './pages/Mission';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PatientForm from './pages/PatientForm';
import PatientDetail from './pages/PatientDetail';
import Vaccinations from './pages/Vaccinations';
import VaccinationForm from './pages/VaccinationForm';
import Diseases from './pages/Diseases';
import Followups from './pages/Followups';
import Reports from './pages/Reports';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/mission" element={<Mission />} />
          <Route path="/login" element={<Login />} />

          {/* Protected staff pages */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/patients/new" element={<PatientForm />} />
          <Route path="/patients/:id" element={<PatientDetail />} />
          <Route path="/patients/:id/edit" element={<PatientForm />} />
          <Route path="/vaccinations" element={<Vaccinations />} />
          <Route path="/vaccinations/new" element={<VaccinationForm />} />
          <Route path="/vaccinations/:id/edit" element={<VaccinationForm />} />
          <Route path="/diseases" element={<Diseases />} />
          <Route path="/followups" element={<Followups />} />
          <Route path="/reports" element={<Reports />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
