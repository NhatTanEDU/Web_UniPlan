// components/Admin/UserList.tsx
import React from 'react';
import { User } from './types'; // Chúng ta sẽ tạo file types.ts

interface UserListProps {
    users: User[];
    onEdit: (user: User) => void;
    onDelete: (id: string) => void;
}

const UserList: React.FC<UserListProps> = ({ users, onEdit, onDelete }) => {
    return (
        <ul>
            {users.map(user => (
                <li key={user._id}>
                    {user.name} ({user.email})
                    <button onClick={() => onEdit(user)}>Edit</button>
                    <button onClick={() => onDelete(user._id)}>Delete</button>
                </li>
            ))}
        </ul>
    );
};

export default UserList;