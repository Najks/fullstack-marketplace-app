import React from 'react';
import { NavLink } from 'react-router-dom';

const defaultItems = [
    { to: '/', label: 'Home', end: true },
    { to: '/about', label: 'About' },
];

export default function NavMenu({ items, ulClassName = 'navbar-nav me-auto mb-2 mb-lg-0' }) {
    const menuItems = items ?? defaultItems;
    const linkClass = ({ isActive }) => 'nav-link' + (isActive ? ' active fw-semibold' : '');
    return (
        <ul className={ulClassName}>
            {menuItems.map(({ to, label, end }, idx) => (
                <li key={idx} className="nav-item">
                    <NavLink to={to} end={end} className={linkClass}>
                        {label}
                    </NavLink>
                </li>
            ))}
        </ul>
    );
}