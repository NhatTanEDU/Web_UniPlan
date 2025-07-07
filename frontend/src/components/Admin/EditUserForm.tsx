// components/Admin/EditUserForm.tsx
import React from 'react';
import { User } from './types'; // Chúng ta sẽ tạo file types.ts

interface EditUserFormProps {
    editingUser: User | null;
    editFormData: Partial<User>;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSave: () => void;
    onCancel: () => void;
}

const EditUserForm: React.FC<EditUserFormProps> = ({
    editingUser,
    editFormData,
    onInputChange,
    onSave,
    onCancel,
}) => {
    if (!editingUser) {
        return null;
    }

    return (
        <div>
            <h3>Edit User</h3>
            <label>Name:</label>
            <input
                type="text"
                name="name"
                value={editFormData.name || ''}
                onChange={onInputChange}
            />
            <label>Email:</label>
            <input
                type="email"
                name="email"
                value={editFormData.email || ''}
                onChange={onInputChange}
            />
            <button onClick={onSave}>Save</button>
            <button onClick={onCancel}>Cancel</button>
        </div>
    );
};

export default EditUserForm;