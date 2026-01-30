
import { User } from '../types';

const USERS_KEY = 'impersio_users_db';
const SESSION_KEY = 'impersio_current_session';

// Helper to get all users
const getUsersDB = (): Record<string, any> => {
    try {
        const data = localStorage.getItem(USERS_KEY);
        return data ? JSON.parse(data) : {};
    } catch {
        return {};
    }
};

// Helper to save users
const saveUsersDB = (db: Record<string, any>) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(db));
};

export const authService = {
    signUp: async (email: string, password: string, fullName: string): Promise<{ user: User | null; error: string | null }> => {
        const db = getUsersDB();
        if (db[email]) {
            return { user: null, error: 'User already exists' };
        }

        // Create user object matching the User interface
        const newUser: User = {
            id: crypto.randomUUID(),
            email,
            full_name: fullName,
            is_pro: false
        };

        // Save with password (but password isn't in User type)
        db[email] = {
            ...newUser,
            password 
        };

        saveUsersDB(db);
        return { user: newUser, error: null };
    },

    signIn: async (email: string, password: string, rememberMe: boolean): Promise<{ user: User | null; error: string | null }> => {
        const db = getUsersDB();
        const storedUser = db[email];

        if (!storedUser || storedUser.password !== password) {
            return { user: null, error: 'Invalid email or password' };
        }

        // Remove password from returned object
        const { password: _, ...userSafe } = storedUser;
        
        // Handle Session Persistence
        const sessionData = JSON.stringify(userSafe);
        
        // Clear both first to ensure no stale state
        localStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(SESSION_KEY);

        if (rememberMe) {
            localStorage.setItem(SESSION_KEY, sessionData);
        } else {
            sessionStorage.setItem(SESSION_KEY, sessionData);
        }

        return { user: userSafe as User, error: null };
    },

    signOut: () => {
        localStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(SESSION_KEY);
        window.location.reload();
    },

    getCurrentUser: (): User | null => {
        // Check session storage first (temporary session), then local storage (remember me)
        const session = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
        if (!session) return null;
        try {
            const user = JSON.parse(session);
            
            // Check DB for latest status (in case pro was added in another tab/session)
            const db = getUsersDB();
            // Fallback to user from session if not in DB (legacy support)
            const freshUser = user.email ? db[user.email] : null;
            
            if (freshUser) {
                 // Check Expiry
                if (freshUser.is_pro && freshUser.pro_expiry) {
                    if (new Date(freshUser.pro_expiry) < new Date()) {
                        freshUser.is_pro = false;
                        freshUser.pro_expiry = undefined;
                        // update db
                        db[user.email] = freshUser;
                        saveUsersDB(db);
                    }
                }
                const { password: _, ...safeUser } = freshUser;
                return safeUser as User;
            }
            
            return user;
        } catch {
            return null;
        }
    },

    redeemCode: async (code: string): Promise<{ success: boolean; message: string }> => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) return { success: false, message: 'You must be signed in to redeem a code.' };

        if (code.trim().toUpperCase() !== 'IMPERSIO') {
            return { success: false, message: 'Invalid subscription code.' };
        }

        const db = getUsersDB();
        const storedUser = db[currentUser.email];
        
        if (!storedUser) return { success: false, message: 'User record not found.' };

        // Calculate 1 year from now
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);

        // Update DB
        storedUser.is_pro = true;
        storedUser.pro_expiry = expiryDate.toISOString();
        db[currentUser.email] = storedUser;
        saveUsersDB(db);

        // Update Session in place
        const { password: _, ...userSafe } = storedUser;
        const sessionData = JSON.stringify(userSafe);
        
        if (localStorage.getItem(SESSION_KEY)) {
            localStorage.setItem(SESSION_KEY, sessionData);
        } else {
            sessionStorage.setItem(SESSION_KEY, sessionData);
        }

        return { success: true, message: 'Pro subscription activated for 1 year!' };
    }
};
