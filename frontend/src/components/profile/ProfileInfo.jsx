import React from "react";

export default function ProfileInfo({ user, onEdit }) {
    const hasProfileImage = Boolean(user?.profile_picture_path);
    const displayName = user?.username;
    const firstName = user?.first_name;
    const lastName = user?.last_name;
    const email = user?.email;
    const phoneNumber = user?.phone_number;
    const pfp_image = user?.profile_picture_path;
    const created_at = new Date(user?.created_at);
    const joined = created_at.getDate() + '/' + (created_at.getMonth() + 1) + '/' + created_at.getFullYear();

    return (
        <div className="card shadow-sm border-0" style={{ borderRadius: '8px' }}>
            <div className="card-body d-flex align-items-start gap-4">
                {hasProfileImage ? (
                    <img
                        src={pfp_image}
                        alt="profile picture"
                        className="rounded-circle flex-shrink-0"
                        style={{ width: 80, height: 80, objectFit: 'cover' }}
                    />
                ) : (
                    <div
                        className="rounded-circle bg-secondary d-inline-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: 80, height: 80 }}
                        aria-label="User Avatar Placeholder"
                    >
                        <i className="bi bi-person text-white" style={{ fontSize: '2rem' }}></i>
                    </div>
                )}

                <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <h2 className="h5 mb-1 fw-bold">{displayName}</h2>
                            {(firstName || lastName) && <h3 className="h6 mb-0 text-muted">{firstName} {lastName}</h3>}
                        </div>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={onEdit}
                        >
                            Edit profile
                        </button>
                    </div>
                    <div className="text-muted small">
                        <div className="mb-1"><i className="bi bi-envelope me-2"></i>{email}</div>
                        {phoneNumber && <div className="mb-1"><i className="bi bi-telephone me-2"></i>{phoneNumber}</div>}
                        <div><i className="bi bi-calendar me-2"></i>Member since: {joined}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}