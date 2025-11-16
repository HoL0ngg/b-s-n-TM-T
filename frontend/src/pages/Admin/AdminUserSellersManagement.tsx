import React, { useState, useEffect } from "react";
import {
    FiUserPlus,
    FiEdit,
    FiLock,
    FiFilter,
} from 'react-icons/fi';
import type { UserAdminType } from "../../types/admin/UserTypeAdmin";
import { fetchSellerByStatusAdmin } from "../../api/admin/usersAdmin";

const AdminUserManagement: React.FC = () => {

    const [users, setUsers] = useState<UserAdminType[]>([]);
    const [search, setSearch] = useState("");
    const [modalType, setModalType] = useState<"add" | "edit">("add");
    const [selectedUser, setSelectedUser] = useState<UserAdminType | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        role: "customer",
    });
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const itemsPerPage = 5;
    useEffect(() => {
        loadUsers();
    }, []);


    const filtered = users.filter(
        (u) =>
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
    );

    const openAddUserModal = () => {

        setModalType("add");
        setFormData({
            name: "",
            email: "",
            phone: "",
            role: "customer",
        });
    }

    const openEditUserModal = (user: UserAdminType) => {
        setModalType("edit");
        setSelectedUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
        });
    }
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
        window.scrollTo({
            top: 0,
            behavior: "smooth", // cuộn mượt
        });
    }
    const loadUsers = async () => {
        try {
            const res = await fetchSellerByStatusAdmin(statusFilter, currentPage, itemsPerPage, search);
            setUsers(res.users);
            setTotalPages(res.totalPages);
            console.log("Danh sách người dùng đã tải:", res.users);
        } catch (error) {
            console.error("Lỗi khi tải danh sách người dùng:", error);
        }
    }
    return (
        <div>
            <h1 className="mb-4">Quản lý Người dùng</h1>


            <div className="card shadow-sm">
                <div className="card-body">
                    <div className="d-flex justify-content-end align-items-center mb-3">
                        <button className="btn btn-primary d-flex align-items-center gap-2"
                            onClick={openAddUserModal}
                            data-bs-toggle="modal"
                            data-bs-target="#userModal">
                            <FiUserPlus size={16} />
                            Thêm người dùng mới
                        </button>
                    </div>


                    <div className="mb-3 d-flex gap-3 justify-content-between align-items-end">
                        <div className="col-md-4">
                            <label htmlFor="search" className="form-label">Tìm kiếm</label>
                            <input
                                type="text"
                                className="form-control"
                                id="search"
                                placeholder="Tìm kiếm theo tên hoặc email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="col-md-4">
                            <label htmlFor="statusFilter" className="form-label">Lọc theo trạng thái</label>
                            <div className="input-group">
                                <span className="input-group-text"><FiFilter /></span>
                                <select
                                    className="form-select"
                                    id="statusFilter"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="all">Tất cả</option>
                                    <option value="1">Đã duyệt</option>
                                    {/* <option value="0">Chờ duyệt</option> */}
                                    <option value="-1">Bị cấm</option>
                                </select>
                            </div>
                        </div>
                    </div>


                    <table className="table table-bordered table-hover">
                        <thead className="table-light text-center">
                            <tr>
                                <th>Tên</th>
                                <th>Email</th>
                                <th>Điện thoại</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="text-center">
                            {filtered.map((user) => (
                                <tr key={user.phone}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.phone}</td>
                                    {/* <td className="text-capitalize">{user.role}</td> */}
                                    <td>
                                        {user.status === 1 && (
                                            <span className="badge bg-success">Hoạt động</span>
                                        )}
                                        {user.status === 0 && (
                                            <span className="badge bg-warning">Pending</span>
                                        )}
                                        {user.status === -1 && (
                                            <span className="badge bg-danger">Bị khóa</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="d-flex gap-2 justify-content-center">
                                            <button className="btn btn-outline-primary btn-sm"
                                                data-bs-toggle="modal"
                                                data-bs-target="#userModal"
                                                onClick={() => openEditUserModal(user)}>
                                                <FiEdit size={16} />
                                            </button>
                                            <button className="btn btn-danger btn-sm">
                                                <FiLock size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL ADD / EDIT USER */}
            <div
                className="modal fade"
                id="userModal"
                tabIndex={-1}
                aria-hidden="true"
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                {modalType === "add" ? "Thêm người dùng" : "Chỉnh sửa người dùng"}
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                            ></button>
                        </div>


                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Tên</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Số điện thoại</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Vai trò</label>
                                <select
                                    className="form-select"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="customer">Customer</option>
                                    <option value="seller">Seller</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>


                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                data-bs-dismiss="modal"
                            >
                                Hủy
                            </button>
                            <button
                                className="btn btn-primary"
                                data-bs-dismiss="modal"
                            // onClick={handleSave}
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default AdminUserManagement;