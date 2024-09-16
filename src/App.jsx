import React, { useState } from "react";
import Login from "./Pages/Login";
import Chat from "./Pages/Chat";

const default_user = {
  is_login: true,
  _id: "66c04dbc1eb52992d95c3af5",
  uid: "parent#0000ADH",
  name: "Dangijiii",
  image: null,
  phone: "916268834715",
  role: "PARENT",
  token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6IjY2YzA0ZGJjMWViNTI5OTJkOTVjM2FmNSIsIlJPTEUiOiJQQVJFTlQiLCJpYXQiOjE3MjY0Njk5ODh9.71YkTBPmR8CWwEtn9cR2Bfo5qo6Y2OUdIoxMZ6PIZlc",
};
// const default_user = {
//   is_login: true,
//   _id: null,
//   uid: null,
//   name: null,
//   image: null,
//   phone: null,
//   role: null,
//   token: null,
// };

export default function App() {
  const [user, setUser] = useState(default_user);
  return (
    <div>
      {user.is_login ? <Chat user={user} /> : <Login setUser={setUser} />}
    </div>
  );
}
