import { useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import axios from 'axios';

// 1. Lấy URL từ biến môi trường (Fix lỗi hardcode localhost)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Hàm này sẽ gọi API backend
const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    try {
        // 2. QUAN TRỌNG: Lấy Token để vượt qua checkShopOwner
        const token = localStorage.getItem('token'); 

        const response = await axios.post(`${API_BASE_URL}/api/upload/image`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                // Gửi kèm token nếu có
                ...(token && { Authorization: `Bearer ${token}` }) 
            },
        });

        const url = response.data.url; // Backend trả về: /uploads/editor_images/ten_file.jpg

        // 3. Xử lý URL trả về để hiển thị được
        // Nếu là link tuyệt đối (http...) -> Trả về ngay
        if (url.startsWith('http')) {
            return url;
        }
        // Nếu là link tương đối -> Nối thêm domain Backend vào
        return `${API_BASE_URL}${url}`;

    } catch (error: any) {
        console.error('Lỗi khi upload ảnh:', error);
        // Báo lỗi chi tiết hơn để dễ debug
        throw new Error(error.response?.data?.message || 'Không thể upload ảnh. Vui lòng thử lại.');
    }
};


// --- THANH CÔNG CỤ (TOOLBAR) ---
const MenuBar = ({ editor }: { editor: any }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!editor) {
        return null;
    }

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                // Upload file và nhận về URL hoàn chỉnh
                const fullImageUrl = await uploadImage(file);
                
                // Chèn ảnh vào editor
                editor.chain().focus().setImage({ src: fullImageUrl }).run();
            } catch (e: any) {
                alert(e.message);
            } finally {
                // Reset input để chọn lại cùng 1 file vẫn kích hoạt sự kiện change
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        }
    };

    const triggerFileInput = () => {
        // Kích hoạt cú click vào input bị ẩn
        fileInputRef.current?.click();
    };


    return (
        <div className="menu-bar">
            {/* Các nút định dạng văn bản */}
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={editor.isActive('bold') ? 'is-active' : ''}
            >
                In đậm
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={editor.isActive('italic') ? 'is-active' : ''}
            >
                In nghiêng
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
            >
                Tiêu đề
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive('bulletList') ? 'is-active' : ''}
            >
                List
            </button>
            
            {/* Nút Thêm ảnh */}
            <button
                type="button"
                onClick={triggerFileInput}
                style={{display: 'flex', alignItems: 'center', gap: '4px'}}
            >
                <span>🖼️</span> Ảnh
            </button>
            
            {/* Input file ẩn */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/webp, image/gif"
                style={{ display: 'none' }}
            />
        </div>
    );
};

interface TiptapEditorProps {
    value: string;
    onChange: (htmlString: string) => void;
}

export default function TiptapEditor({ value, onChange }: TiptapEditorProps) {

    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({
                // Cho phép thay đổi kích thước ảnh (resize)
                inline: true,
                allowBase64: true, // Cho phép ảnh base64
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    return (
        <div className="tiptap-container">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
}