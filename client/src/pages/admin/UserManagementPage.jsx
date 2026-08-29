import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Edit, 
  Key, 
  Power, 
  Trash2, 
  ShieldCheck,
  Building2,
  Lock
} from 'lucide-react';

export default function UserManagementPage() {
  const { success, error: toastError } = useToast();

  const [users, setUsers] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [facultyFilter, setFacultyFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userForm, setUserForm] = useState({
    student_code: '',
    email: '',
    password: '',
    full_name: '',
    role: 'STUDENT',
    faculty_id: '',
    class_name: '',
    academic_year: ''
  });

  // Reset Password Modal
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetUserId, setResetUserId] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchFaculties();
  }, [roleFilter, facultyFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let url = '/users';
      const params = new URLSearchParams();
      if (roleFilter) params.append('role', roleFilter);
      if (facultyFilter) params.append('facultyId', facultyFilter);
      if (search) params.append('search', search);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await api.get(url);
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (e) {
      toastError('Không thể tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculties = async () => {
    try {
      const res = await api.get('/users/faculties');
      if (res.data.success) {
        setFaculties(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleOpenCreateModal = () => {
    setEditingUserId(null);
    setUserForm({
      student_code: '',
      email: '',
      password: '',
      full_name: '',
      role: 'STUDENT',
      faculty_id: '',
      class_name: '',
      academic_year: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (u) => {
    setEditingUserId(u.id);
    setUserForm({
      student_code: u.student_code || '',
      email: u.email,
      password: '',
      full_name: u.full_name,
      role: u.role,
      faculty_id: u.faculty_id || '',
      class_name: u.class_name || '',
      academic_year: u.academic_year || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      if (editingUserId) {
        const res = await api.put(`/users/${editingUserId}`, userForm);
        if (res.data.success) {
          success('Cập nhật tài khoản thành công!');
        }
      } else {
        const res = await api.post('/users', userForm);
        if (res.data.success) {
          success('Tạo mới tài khoản thành công!');
        }
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      toastError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu tài khoản.');
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const res = await api.patch(`/users/${userId}/toggle-status`);
      if (res.data.success) {
        success(res.data.message);
        fetchUsers();
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Không thể đổi trạng thái tài khoản.');
    }
  };

  const handleOpenResetModal = (userId) => {
    setResetUserId(userId);
    setNewPassword('');
    setIsResetModalOpen(true);
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toastError('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }
    try {
      const res = await api.patch(`/users/${resetUserId}/reset-password`, { newPassword });
      if (res.data.success) {
        success(res.data.message);
        setIsResetModalOpen(false);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Không thể đặt lại mật khẩu.');
    }
  };

  const handleDeleteUser = async (userId, email) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${email}" không?`)) return;
    try {
      const res = await api.delete(`/users/${userId}`);
      if (res.data.success) {
        success(res.data.message);
        fetchUsers();
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Không thể xóa tài khoản.');
    }
  };

  return (
    <DashboardLayout
      title="QUẢN LÝ NGƯỜI DÙNG & PHÂN QUYỀN HỆ THỐNG"
      subtitle="Quản lý danh sách tài khoản Sinh viên, Cán bộ khảo sát và Quản trị viên trong hệ sinh thái DLU"
      actionButton={
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-dlu-primary text-white text-xs font-bold hover:bg-dlu-hover shadow-md transition"
        >
          <UserPlus className="w-4 h-4 text-dlu-accent" />
          <span>Thêm người dùng mới</span>
        </button>
      }
    >
      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="w-full md:w-80 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email, MSSV..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-dlu-primary transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl text-xs py-2 px-3 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-dlu-primary"
          >
            <option value="">Tất cả vai trò</option>
            <option value="STUDENT">Sinh viên</option>
            <option value="STAFF">Cán bộ khảo sát</option>
            <option value="ADMIN">Quản trị viên</option>
          </select>

          <select
            value={facultyFilter}
            onChange={(e) => setFacultyFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl text-xs py-2 px-3 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-dlu-primary"
          >
            <option value="">Tất cả khoa</option>
            {faculties.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-dlu-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 mt-3 font-semibold">Đang tải danh sách người dùng...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <h3 className="text-base font-bold text-slate-700">Không tìm thấy tài khoản nào</h3>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                  <th className="py-4 px-6">Họ và tên / Email</th>
                  <th className="py-4 px-4">Mã SV / Lớp</th>
                  <th className="py-4 px-4">Vai trò</th>
                  <th className="py-4 px-4">Khoa / Đơn vị</th>
                  <th className="py-4 px-4">Trạng thái</th>
                  <th className="py-4 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 text-sm">{u.full_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                    </td>
                    <td className="py-4 px-4">
                      {u.student_code ? (
                        <div>
                          <span className="font-mono font-bold text-slate-700">{u.student_code}</span>
                          <span className="text-[11px] text-slate-400 block">{u.class_name} - {u.academic_year}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <Badge status={u.role} type="role" />
                    </td>
                    <td className="py-4 px-4 text-slate-600 font-medium">
                      {u.faculty_name || 'Toàn trường'}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {u.is_active ? 'Hoạt động' : 'Tạm khóa'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(u)}
                          title="Chỉnh sửa thông tin"
                          className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenResetModal(u.id)}
                          title="Đặt lại mật khẩu"
                          className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u.id)}
                          title={u.is_active ? 'Khóa tài khoản' : 'Mở khóa'}
                          className={`p-2 rounded-lg border ${
                            u.is_active ? 'bg-slate-50 hover:bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id, u.email)}
                          title="Xóa tài khoản"
                          className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Create / Edit User */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUserId ? 'Chỉnh sửa Tài khoản' : 'Thêm Người dùng Mới'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Họ và tên <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={userForm.full_name}
                onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                placeholder="VD: Trần Văn An"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-dlu-primary font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email (@dlu.edu.vn) <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                placeholder="2111234@dlu.edu.vn"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-dlu-primary font-medium"
              />
            </div>
          </div>

          {!editingUserId && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mật khẩu ban đầu <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                placeholder="Tối thiểu 6 ký tự"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-dlu-primary font-medium"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Vai trò (Role)
              </label>
              <select
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dlu-primary font-bold text-slate-700"
              >
                <option value="STUDENT">Sinh viên (STUDENT)</option>
                <option value="STAFF">Cán bộ khảo sát (STAFF)</option>
                <option value="ADMIN">Quản trị viên (ADMIN)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Khoa / Phòng ban
              </label>
              <select
                value={userForm.faculty_id}
                onChange={(e) => setUserForm({ ...userForm, faculty_id: e.target.value ? Number(e.target.value) : '' })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-dlu-primary font-medium"
              >
                <option value="">Toàn trường / Chưa chọn</option>
                {faculties.map((f) => (
                  <option key={f.id} value={f.id}>{f.name} ({f.code})</option>
                ))}
              </select>
            </div>
          </div>

          {userForm.role === 'STUDENT' && (
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Mã SV</label>
                <input
                  type="text"
                  value={userForm.student_code}
                  onChange={(e) => setUserForm({ ...userForm, student_code: e.target.value })}
                  placeholder="2111234"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Lớp</label>
                <input
                  type="text"
                  value={userForm.class_name}
                  onChange={(e) => setUserForm({ ...userForm, class_name: e.target.value })}
                  placeholder="CTK45"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Khóa</label>
                <input
                  type="text"
                  value={userForm.academic_year}
                  onChange={(e) => setUserForm({ ...userForm, academic_year: e.target.value })}
                  placeholder="K45"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-dlu-primary hover:bg-dlu-hover rounded-xl shadow"
            >
              {editingUserId ? 'Cập nhật' : 'Tạo tài khoản'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Reset Password */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Đặt lại Mật khẩu Người dùng"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Mật khẩu mới <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nhập tối thiểu 6 ký tự"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-dlu-primary font-medium"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsResetModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow"
            >
              Đặt lại mật khẩu
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
