import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { SearchPage } from '@/pages/SearchPage';
import { TracePage } from '@/pages/TracePage';
import { CertificatePage } from '@/pages/CertificatePage';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/search" replace />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/trace/:id" element={<TracePage />} />
          <Route path="/certificate/:id" element={<CertificatePage />} />
          <Route path="*" element={<Navigate to="/search" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
