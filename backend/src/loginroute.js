// Login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("Login attempt:", email); // Debug

  // 1️⃣ Check if fields exist
  if (!email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    // 2️⃣ Find user (case-insensitive fix)
    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    // 3️⃣ If user not found
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 4️⃣ Compare passwords (if hashed)
    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // 5️⃣ Success
    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging in" });
  }
});