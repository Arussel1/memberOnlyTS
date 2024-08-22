import pool from './pool';
import bcryptjs from 'bcryptjs';

interface User {
  id: number;
  firstname: string;
  lastname: string;
  username: string;
  password: string;
  status: string | null
}

interface Message {
  id: number;
  title: string;
  body: string;
  user_id: number;
  created_at: Date;
}
interface MessageWithFormatted extends Message {
  formattedCreatedAt?: string;
  last_name?: string;
  first_name?: string;
}


class UserQueries {
  async checkUsernameExists(username: string): Promise<boolean> {
    const res = await pool.query('SELECT username FROM users WHERE username=$1', [username]);
    return res.rows.length > 0;
  }

  async getUser(username: string): Promise<User | null> {
    const res = await pool.query('SELECT * FROM users WHERE username=$1', [username]);
    return res.rows.length > 0 ? res.rows[0] : null;
  }

  async addUser(firstname: string, lastname: string, username: string, password: string): Promise<void> {
    const hashedPassword = await bcryptjs.hash(password, 10);
    await pool.query('INSERT INTO users (firstname, lastname, username, password) VALUES ($1, $2, $3, $4)', [firstname, lastname, username, hashedPassword]);
    console.log("Created user successfully");
  }

  async getUserById(id: number): Promise<User | null> {
    const res = await pool.query('SELECT * FROM users WHERE id=$1', [id]);
    return res.rows.length > 0 ? res.rows[0] : null;
  }

  async updateStatus(id: number, newStatus: string): Promise<void> {
    await pool.query('UPDATE users SET status=$1 WHERE id=$2', [newStatus, id]);
  }
}

class MessageQueries {
  async getMessage(): Promise<Message[]> {
    const res = await pool.query('SELECT * FROM message');
    return res.rows;
  }

  async addMessage(title: string, body: string, user_id: number): Promise<void> {
    await pool.query('INSERT INTO message (title, body, user_id, created_at) VALUES ($1, $2, $3, $4)', [title, body, user_id, new Date()]);
  }
}



export { UserQueries, MessageQueries, User, Message, MessageWithFormatted };
