import React, { useState } from 'react';
import Modal from '../ui/modal';
import Input from '../ui/input';
import Button from '../ui/button';

const InviteModal = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');

    const handleInvite = () => {
        // Logic to send invite to the email
        console.log(`Inviting ${email}`);
        // Clear the input after sending the invite
        setEmail('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-lg font-semibold">Invite a Friend</h2>
            <Input
                type="email"
                placeholder="Enter friend's email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-4"
            />
            <div className="mt-6 flex justify-end">
                <Button onClick={handleInvite} disabled={!email}>
                    Send Invite
                </Button>
            </div>
        </Modal>
    );
};

export default InviteModal;