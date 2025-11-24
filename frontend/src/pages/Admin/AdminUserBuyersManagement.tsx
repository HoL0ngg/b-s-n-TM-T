import React, { useState, useEffect, useRef, use } from "react";
import {
    FiUserPlus,
    FiEdit,
    FiLock,
    FiUnlock,
    FiFilter
} from 'react-icons/fi';
import type { UserAdminType } from "../../types/admin/UserTypeAdmin";
import { createUserAdmin, fetchBuyerByStatusAdmin, updateUserAdmin, updateUserStatusAdmin } from "../../api/admin/usersAdmin";
import Pagenum from "../../components/Admin/Pagenum";
import Swal from "sweetalert2";

const AdminUserManagement: React.FC = () => {
    const closeModalRef = useRef<HTMLButtonElement>(null);
    const [users, setUsers] = useState<UserAdminType[]>([]);
    const [search, setSearch] = useState("");
    const [modalType, setModalType] = useState<"add" | "edit">("add");
    const [selectedUser, setSelectedUser] = useState<UserAdminType | null>(null);
    const [formData, setFormData] = useState({
        phone: "",
        name: "",
        email: "",
        password: "",
        status: 1,
        role: "customer",
        dob: "",
        gender: 0,
    });

    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const itemsPerPage = 5;
    const [debouncedSearch, setDebouncedSearch] = useState("");
    useEffect(() => {
        loadUsers();
    }, []);


    // const filtered = users.filter(
    //     (u) =>
    //         u.name.toLowerCase().includes(search.toLowerCase()) ||
    //         u.email.toLowerCase().includes(search.toLowerCase())
    // );

    const openAddUserModal = () => {
        setModalType("add");
        setFormData({
            phone: "",
            name: "",
            email: "",
            password: "",
            status: 1,
            role: "customer",
            dob: "",
            gender: 0,
        });
    }

    const openEditUserModal = (user: UserAdminType) => {
        const formattedDob = user.dob ? new Date(user.dob).toLocaleDateString('en-CA') : "";
        setModalType("edit");
        setSelectedUser(user);
        setFormData({
            phone: user.phone,
            name: user.name || "", // nếu user.username undefined thì fallback ""
            email: user.email || "",
            password: "", // để trống khi edit
            status: user.status ?? 1, // nếu undefined thì mặc định 1
            role: user.role || "customer",
            dob: formattedDob,
            gender: user.gender ?? 0,
        });
    }

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    }
    const handleUpdateStatus = async (
        title: string,
        phone: string,
        newStatus: number) => {
        const result = await Swal.fire({
            title,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Hủy",
        });
        if (result.isConfirmed) {
            try {
                const res = await updateUserStatusAdmin(phone, newStatus);
                Swal.fire("Thành công!", res.message, "success");
                loadUsers();
            } catch (error) {
                Swal.fire({
                    title: "Lỗi",
                    text: "Cập nhật trạng thái người dùng thất bại.",
                    icon: "error",
                });
            }
        }
    }
    const handleBanUser = async (phone: string) => {
        await handleUpdateStatus(
            "Bạn có chắc chắn muốn khóa người dùng này?",
            phone,
            -1
        );
    }
    const handleUnbanUser = async (phone: string) => {
        await handleUpdateStatus(
            "Bạn có chắc chắn muốn mở khóa người dùng này?",
            phone,
            1
        );
    }
    const loadUsers = async () => {
        try {
            const res = await fetchBuyerByStatusAdmin(statusFilter, currentPage, itemsPerPage, debouncedSearch);
            setUsers(res.users);
            setTotalPages(res.totalPages);
            // console.log("Danh sách người dùng đã tải:", res.users);
            // console.log("Total Pages:", res.totalPages);
        } catch (error) {
            console.error("Lỗi khi tải danh sách người dùng:", error);
        }
    }
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (modalType === "add") {
                const res = await createUserAdmin(formData);
                if (res.success) {
                    Swal.fire("Thành công!", res.message, "success");
                    closeModalRef.current?.click();
                } else {
                    Swal.fire("Thất bại!", res.message, "error");
                }
            } else if (modalType === "edit" && selectedUser) {
                const res = await updateUserAdmin(selectedUser.phone, formData);
                Swal.fire("Thành công!", res.message, "success");
                closeModalRef.current?.click();
            }

            loadUsers();
        } catch (error: any) {
            Swal.fire("Lỗi!", error.response?.data?.message || "Không thể lưu người dùng.", "error");
        }
    };
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    useEffect(() => {
        loadUsers();
    }, [statusFilter, currentPage, debouncedSearch]);
    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter]);
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

                                // Thêm 2 dòng này
                                readOnly={true}
                                onFocus={(e) => e.target.removeAttribute('readonly')}
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
                                    <option value="1">Hoạt động</option>
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
                            {users.map((user) => (
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
                                                {user.status === 1 && (
                                                    <FiLock size={16} onClick={() => handleBanUser(user.phone)} />
                                                )}
                                                {user.status === -1 && (
                                                    <FiUnlock size={16} onClick={() => handleUnbanUser(user.phone)} />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {/* --- 3. THANH PHÂN TRANG (Không đổi) --- */}
                    {users.length > 0 && (
                        <Pagenum
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    )}
                </div>
            </div>

            {/* MODAL ADD / EDIT USER */}
            <div
                className="modal fade"
                id="userModal"
                tabIndex={-1}
                aria-hidden="true"
            >
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        {/* [QUAN TRỌNG] Thẻ FORM bao trọn toàn bộ nội dung trong modal-content */}
                        <form onSubmit={handleSave}>

                            {/* 1. Header */}
                            <div className="modal-header">
                                <div className="text-center w-100">
                                    <h5 className="modal-title">
                                        {modalType === "add" ? "THÊM NGƯỜI DÙNG" : "CẬP NHẬT NGƯỜI DÙNG"}
                                    </h5>
                                </div>
                                <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                ></button>
                            </div>

                            {/* 2. Body */}
                            <div className="modal-body">
                                <div className="d-flex justify-content-evenly gap-4 align-items-center">
                                    <div className="w-50">

                                        {/* PHONE */}
                                        <div className="mb-3">
                                            <label className="form-label">Số điện thoại <span className="text-danger">*</span></label>
                                            <input
                                                required // Bắt buộc nhập
                                                type="text"
                                                className="form-control"
                                                value={formData.phone}
                                                disabled={modalType === "edit"} // Không cho sửa khi edit
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>

                                        {/* NAME */}
                                        <div className="mb-3">
                                            <label className="form-label">Họ tên <span className="text-danger">*</span></label>
                                            <input
                                                required
                                                type="text"
                                                className="form-control"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>

                                        {/* EMAIL */}
                                        <div className="mb-3">
                                            <label className="form-label">Email <span className="text-danger">*</span></label>
                                            <input
                                                required
                                                type="email" // Tự động validate định dạng email
                                                className="form-control"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>

                                        {/* PASSWORD */}
                                        <div className="mb-3">
                                            <label className="form-label">
                                                {modalType === "edit" ? "Mật khẩu (để trống nếu không đổi)" : <span>Mật khẩu <span className="text-danger">*</span></span>}
                                            </label>
                                            <input
                                                // Chỉ bắt buộc nhập khi đang là chế độ "add"
                                                required={modalType === "add"}
                                                type="password"
                                                className="form-control"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="w-50">
                                        {/* GENDER */}
                                        <div className="mb-3">
                                            <label className="form-label">Giới tính<span className="text-danger"> *</span></label>
                                            <div className="d-flex gap-2 align-items-center mb-4 pt-1">
                                                <div className="form-check">
                                                    <input
                                                        // required={modalType === "add"}
                                                        className="form-check-input"
                                                        type="radio"
                                                        name="gender" // Cùng name để chỉ được chọn 1 trong 2
                                                        id="gender_male"
                                                        checked={formData.gender === 1}
                                                        onChange={() => setFormData({ ...formData, gender: 1 })}
                                                    />
                                                    <label className="form-check-label pointer" htmlFor="gender_male">
                                                        Nam
                                                    </label>
                                                </div>

                                                <div className="form-check">
                                                    <input
                                                        // required={modalType === "add"}
                                                        className="form-check-input"
                                                        type="radio"
                                                        name="gender"
                                                        id="gender_female"
                                                        checked={formData.gender === 0}
                                                        onChange={() => setFormData({ ...formData, gender: 0 })}
                                                    />
                                                    <label className="form-check-label pointer" htmlFor="gender_female">
                                                        Nữ
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* STATUS */}
                                        <div className="mb-3">
                                            <label className="form-label">Trạng thái</label>
                                            <select
                                                className="form-select"
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) })}
                                            >
                                                <option value={1}>Hoạt động</option>
                                                <option value={0}>Khóa</option>
                                            </select>
                                        </div>
                                        {/* DOB */}
                                        <div className="mb-3">
                                            <label className="form-label">Ngày sinh</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={formData.dob || ""}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, dob: e.target.value })
                                                }
                                            />
                                        </div>
                                        {/* ROLE */}
                                        <div className="mb-3">
                                            <label className="form-label">Vai trò</label>
                                            <select
                                                className="form-select"
                                                value={formData.role}
                                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            >
                                                <option value="customer">Customer</option>
                                                {/* Có thể thêm admin/staff nếu cần */}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>


                            {/* 3. Footer */}
                            <div className="modal-footer">
                                <button
                                    type="button" // Bắt buộc là button để không submit form
                                    className="btn btn-secondary"
                                    data-bs-dismiss="modal" // Bootstrap handle việc đóng modal
                                    ref={closeModalRef} // Gắn ref để đóng modal bằng code khi lưu thành công
                                >
                                    Hủy
                                </button>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >
                                    Lưu
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div >
        </div >

    );
}
export default AdminUserManagement;