import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_very_secret_key_change_this';

export const generateToken = (payload: object): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

export const verifyToken = (token: string): any => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};
