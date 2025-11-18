import { useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Hàm này sẽ gọi API backend của bạn
const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file); // 'image' phải khớp với tên field trong multer (backend)

    try {
        const response = await axios.post('http://localhost:5000/api/upload/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log(response);

        return response.data.url;
    } catch (error) {
        console.error('Lỗi khi upload ảnh:', error);
        throw new Error('Không thể upload ảnh.');
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
                // 1. Upload file
                const imageUrl = await uploadImage(file);
                const hihi = `${API_BASE_URL}` + imageUrl;
                editor.chain().focus().setImage({ src: hihi }).run();
            } catch (e: any) {
                alert(e.message);
            }
        }
    };

    const triggerFileInput = () => {
        // Kích hoạt cú click vào input bị ẩn
        fileInputRef.current?.click();
    };


    return (
        <div className="menu-bar">
            {/* (Các nút cũ: Đậm, Nghiêng, H2, Danh sách) */}
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={editor.isActive('bold') ? 'is-active' : ''}
            >
                Đậm (B)
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={editor.isActive('italic') ? 'is-active' : ''}
            >
                Nghiêng (I)
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
                Danh sách
            </button>
            <button
                type="button"
                onClick={triggerFileInput}
            >
                🖼️ Thêm ảnh
            </button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
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
                allowBase64: true, // Cho phép ảnh base64 (ví dụ: dán từ clipboard)
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