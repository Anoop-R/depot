import { cookies } from 'next/headers';
import { verify } from '@/lib/auth';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
export default function AdminPage() {
  const token = cookies().get('depot_admin')?.value;
  const valid = verify(token) === 'admin';
  return valid ? <AdminDashboard /> : <AdminLogin />;
}
