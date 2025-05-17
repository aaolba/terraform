import mysql from "mysql2/promise"

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.RDS_HOST,
  user: process.env.RDS_USER,
  password: process.env.RDS_PASSWORD,
  database: process.env.RDS_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// Initialize the database (create tables if they don't exist)
export async function initDatabase() {
  const connection = await pool.getConnection()

  try {
    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        profile_image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    console.log("Database initialized successfully")
  } catch (error) {
    console.error("Error initializing database:", error)
    throw error
  } finally {
    connection.release()
  }
}

// Create a new user
export async function createUser({
  name,
  email,
  profileImageUrl,
}: {
  name: string
  email: string
  profileImageUrl: string | null
}) {
  const connection = await pool.getConnection()

  try {
    const [result] = await connection.execute("INSERT INTO users (name, email, profile_image_url) VALUES (?, ?, ?)", [
      name,
      email,
      profileImageUrl,
    ])

    const insertId = (result as any).insertId

    // Get the created user
    const [rows] = await connection.execute("SELECT * FROM users WHERE id = ?", [insertId])

    const users = rows as any[]

    return {
      id: users[0].id,
      name: users[0].name,
      email: users[0].email,
      profileImageUrl: users[0].profile_image_url,
      createdAt: users[0].created_at,
    }
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  } finally {
    connection.release()
  }
}

// List all users
export async function listUsers() {
  const connection = await pool.getConnection()

  try {
    const [rows] = await connection.execute("SELECT * FROM users ORDER BY created_at DESC")

    const users = (rows as any[]).map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      profileImageUrl: user.profile_image_url,
      createdAt: user.created_at,
    }))

    return users
  } catch (error) {
    console.error("Error listing users:", error)
    throw error
  } finally {
    connection.release()
  }
}

// Delete a user
export async function deleteUser(id: number) {
  const connection = await pool.getConnection()

  try {
    await connection.execute("DELETE FROM users WHERE id = ?", [id])

    return true
  } catch (error) {
    console.error("Error deleting user:", error)
    throw error
  } finally {
    connection.release()
  }
}

// Initialize the database when the module is imported
initDatabase().catch(console.error)
