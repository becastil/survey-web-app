import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
  userName?: string;
}

export async function authenticateSocket(
  socket: AuthenticatedSocket,
  next: (err?: ExtendedError) => void
) {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return next(new Error('Authentication error: Invalid token'));
    }

    // Attach user info to socket
    socket.userId = user.id;
    socket.userEmail = user.email || undefined;
    socket.userName = user.user_metadata?.name || user.email || 'Anonymous';

    // Join user-specific room
    socket.join(`user:${user.id}`);
    
    console.log(`User ${socket.userName} (${socket.userId}) connected`);
    
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication error'));
  }
}