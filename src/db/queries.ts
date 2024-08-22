import pool from './pool';
import bcryptjs from 'bcryptjs';

export interface User {
  id: number;
  firstname: string;
  lastname: string;
  username: string;
  password: string;
  status: string | null
}

export interface Message {
  id: number;
  title: string;
  body: string;
  user_id: number;
  created_at: Date;
}
export interface MessageWithFormatted extends Message {
  formattedCreatedAt?: string;
  last_name?: string;
  first_name?: string;
}


const checkUsernameExists = async (username: string): Promise<boolean> => {
  const res = await pool.query('SELECT username FROM users WHERE username=$1', [username]);
  return res.rows.length > 0;
}

const getUser = async (username: string): Promise<User | null> => {
  const res = await pool.query('SELECT * FROM users WHERE username=$1', [username]);
  return res.rows.length > 0 ? res.rows[0] : null;
}

const addUser = async (firstname: string, lastname: string, username: string, password: string): Promise<void> => {
  const hashedPassword = await bcryptjs.hash(password, 10);
  await pool.query('INSERT INTO users (firstname, lastname, username, password) VALUES ($1, $2, $3, $4)', [firstname, lastname, username, hashedPassword]);
  console.log("Created user successfully");
}

const getUserById = async (id: number): Promise<User | null> => {
  const res = await pool.query('SELECT * FROM users WHERE id=$1', [id]);
  return res.rows.length > 0 ? res.rows[0] : null;
}

const getMessage = async (): Promise<Message[]> => {
  const res = await pool.query('SELECT * FROM message');
  return res.rows;
}

const addMessage = async (title: string, body: string, user_id: number): Promise<void> => {
  await pool.query(
    'INSERT INTO message (title, body, user_id, created_at) VALUES ($1, $2, $3, $4)', 
    [title, body, user_id, new Date()]
  );
}

const updateStatus = async (id: number, newStatus: String): Promise<void> => {
  await pool.query('UPDATE users SET status=$1 WHERE id=$2', [newStatus,id]);
}

export { checkUsernameExists,  getUser, addUser, getUserById, getMessage, addMessage, updateStatus };
