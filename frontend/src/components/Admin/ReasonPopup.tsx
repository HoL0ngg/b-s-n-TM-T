import React from "react";

interface ReasonPopupProps {
    isOpen: boolean;
    onClose: () => void;
    reason: string | null;
    title: string;
}

const ReasonPopup: React.FC<ReasonPopupProps> = ({ isOpen, onClose, reason, title }) => {
    if (!isOpen) return null;

    return (
        <div
            className={`modal fade show d-block`}
            tabIndex={-1}
            role="dialog"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
            <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <div className="w-100 text-center"><h5 className="modal-title">{title}</h5></div>
                        <button
                            type="button"
                            className="btn-close"
                            aria-label="Close"
                            onClick={onClose}
                        ></button>
                    </div>
                    <div className="modal-body" style={{ maxHeight: "300px", overflowY: "auto" }}>
                        {/* whiteSpace: "pre-wrap" giữ các ký tự xuống dòng từ database
                            wordBreak: "break-word" → xuống dòng khi từ quá dài.                        
                        */}
                        <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                            {reason || "Không có lý do."}
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-primary" onClick={onClose}>
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReasonPopup;
