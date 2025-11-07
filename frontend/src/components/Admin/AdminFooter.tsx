import React from 'react';

const AdminFooter: React.FC = () => {
    const currentYear = new Date().getFullYear();
    return (
        <footer className="bg-white p-3 text-center border-top mt-auto">
            <div className="container-fluid">
                <span className="text-muted">
                    Copyright &copy; {currentYear} Market Platform. All rights reserved.
                </span>
            </div>
        </footer>
    );
};

export default AdminFooter;