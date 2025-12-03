const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const prisma = require('../models/prismaClient');

const oauth2Client = new OAuth2Client(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
);

const googleAuthCallback = async (req, res) => {
    try {

        console.log(req.body);
        const { code } = req.body; // rename from 'code' to 'id_token'
        const id_token = code;
        if (!id_token) {
            return res.status(400).json({ error: 'ID token required' });
        }

        console.log("Before ticket");

        const ticket = await oauth2Client.verifyIdToken({
            idToken: id_token,
            audience: process.env.CLIENT_ID
        });

        console.log("ticket", ticket);
        const googleUser = ticket.getPayload();

        console.log(googleUser);
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { google_id: googleUser.sub },
                    { email: googleUser.email }
                ]
            }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    google_id: googleUser.sub, // unique Google ID
                    email: googleUser.email,
                    email_verified: googleUser.email_verified,
                    username: googleUser.name,
                    first_name: googleUser.given_name,
                    last_name: googleUser.family_name,
                    profile_picture_path: googleUser.picture
                }
            });
        } else if (!user.google_id) {
            // Update existing user with Google ID
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    google_id: googleUser.sub,
                    email_verified: googleUser.email_verified,
                    first_name: googleUser.given_name,
                    last_name: googleUser.family_name
                }
            });
        }

        const jwtToken = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // vrne se kot HTTP-only cookie, ne v body-ju
        res.cookie('session', jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                first_name: user.first_name,
                last_name: user.last_name,
                profile_picture_path: user.profile_picture_path,
                created_at: user.created_at
            }
        });
    } catch (error) {
        console.error(error);
        res.status(401).json({ error: 'Authentication failed' });
    }
};

const me = async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: {
            id: true,
            email: true,
            username: true,
            first_name: true,
            last_name: true,
            profile_picture_path: true,
            created_at: true,
            phone_number: true
        }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
};

const logout = (req, res) => {
    res.clearCookie('session');
    res.status(200).json({ message: "Logged out"})
};

module.exports = { googleAuthCallback, logout, me };
